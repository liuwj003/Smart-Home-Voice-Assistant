import logging
from typing import Dict, List, Any, Tuple, Optional
import sys
from pathlib import Path
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForTokenClassification
import re

# --- NLUInterface Definition (if not properly imported) ---
logger = logging.getLogger(__name__)
try:
    from interfaces.nlu_interface import NLUInterface
except ImportError:
    logger.warning("NLUInterface not found from 'interfaces.nlu_interface'. Using a dummy interface for testing.")
    class NLUInterface: # type: ignore
        async def understand(self, text: str) -> Dict:
            raise NotImplementedError
# -----------------------------------------------------------

class BertNLUProcessor(NLUInterface):
    """
    Pretrained Bert, then fine-tuned for slot filling.
    Extracts: DEVICE_TYPE, DEVICE_ID, LOCATION, ACTION, PARAMETER.
    Applies complex normalization for DEVICE_ID and PARAMETER.
    Outputs ACTION as a standardized English string.
    """

    CH_NUM_MAP = {
        '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
        '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        # '百': 100, '千': 1000, # Simplified _convert_chinese_int_segment handles this
        '点': '.'
    }
    CH_ORDINAL_PREFIX = "第"
    CH_ID_SUFFIXES = ["号", "个"]

    def __init__(self, config: Dict):
        self.config = config
        model_path_str = config.get("model_path")
        if not model_path_str:
            logger.error("配置中未提供 'model_path'。")
            raise ValueError("配置中必须提供 'model_path'，指向微调后的模型目录。")

        self.model_path = Path(model_path_str).resolve()
        self.tokenizer_path = str(Path(config.get("tokenizer_name_or_path", self.model_path)).resolve())

        if not self.model_path.exists() or not self.model_path.is_dir():
            logger.error(f"模型路径不存在或不是一个目录: {self.model_path}")
            raise FileNotFoundError(f"模型路径不存在或不是一个目录: {self.model_path}")

        logger.info(f"正在从 '{self.model_path}' 加载模型和tokenizer...")
        
        self.device = config.get("device")
        if self.device:
            self.device = torch.device(self.device)
        else:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"使用设备: {self.device}")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.tokenizer_path)
            self.model = AutoModelForTokenClassification.from_pretrained(self.model_path)
            self.model.to(self.device)
            self.model.eval()

            if hasattr(self.model.config, 'id2label'):
                self.id2slot = {int(k): v for k, v in self.model.config.id2label.items()}
                logger.info(f"从模型配置加载id2label映射: 共 {len(self.id2slot)} 个标签")
                if hasattr(self.model.config, 'label2id'):
                    self.slot2id = {k: int(v) for k, v in self.model.config.label2id.items()}
                else: 
                    self.slot2id = {v: k for k,v in self.id2slot.items()}
            else:
                logger.error("模型配置中未找到id2label。无法进行标签映射。将使用预定义列表。")
                slot_labels_list_fallback = [
                    "O", "B-DEVICE_TYPE", "I-DEVICE_TYPE", "B-DEVICE_ID", "I-DEVICE_ID",
                    "B-LOCATION", "I-LOCATION", "B-ACTION", "I-ACTION",
                    "B-PARAMETER", "I-PARAMETER",
                ]
                logger.warning(f"将使用预定义的 slot_labels_list_fallback 进行标签映射: {slot_labels_list_fallback}")
                self.id2slot = {i: label for i, label in enumerate(slot_labels_list_fallback)}
                self.slot2id = {label: i for i, label in enumerate(slot_labels_list_fallback)}
        except Exception as e:
            logger.error(f"加载模型或tokenizer失败: {e}", exc_info=True)
            raise
        logger.info("BertNLUProcessor 已成功初始化")

    def _convert_chinese_int_segment(self, cn_int_str: str) -> Optional[int]:
        """转换常见的中文整数片段 (万以下简单版)"""
        if not cn_int_str: return 0
        try: return int(cn_int_str) # 如果已经是阿拉伯数字
        except ValueError: pass

        if cn_int_str == "零": return 0
        
        num_map = self.CH_NUM_MAP
        # 单位处理
        units = {'十': 10, '百': 100, '千': 1000}
        # 移除不参与数值计算的单位词，例如温度的“度”或序数的“号”
        cleaned_str = cn_int_str.replace("度", "").replace("号","").replace("个","")

        if not cleaned_str: return None

        if cleaned_str == "十": return 10 # "十"本身

        total_value = 0
        current_section_value = 0 # 处理如 "一百零五" 中的 "一百" 和 "五"
        current_digit_value = 0 # 当前数字的值，如 "二" (在 "二百" 中)
        
        # 简单从左到右解析，处理 “二百三十五”, “二十三”, “十三”, “一百零五” 这种结构
        # 对于更复杂的 "一千二百三十四万五千六百七十八" 需要完整算法
        # 这里主要处理日常参数中常见的数字表达

        # 特殊处理 "十" 开头，如 "十三"
        if cleaned_str.startswith('十'):
            total_value = 10
            if len(cleaned_str) > 1:
                digit_after_shi = num_map.get(cleaned_str[1])
                if digit_after_shi is not None and digit_after_shi < 10:
                    total_value += digit_after_shi
                else: # "十" 后面不是1-9的数字
                    logger.debug(f"中文整数转换：'十'后字符 '{cleaned_str[1]}' 无法解析为个位数。")
                    return None 
            return total_value

        # 处理其他情况，如 "二十三", "二百三十五", "一百零五", "五"
        # 这个实现依然是简化的，依赖于数字和单位的交替出现
        temp_num = 0 # 用于累积数字，如 二 (in 二百)
        for char_cn in cleaned_str:
            digit = num_map.get(char_cn)
            if digit is not None:
                if digit >= 0 and digit <= 9: # 0-9
                    temp_num = temp_num * 10 + digit if temp_num > 0 and char_cn != '零' else digit # 处理连续数字或单个数字
                                                                                                # "二三" -> 23, "零五" -> 5
                                                                                                # "二百三" -> 二(temp_num=2) 百(total=200, temp_num=0) 三(temp_num=3)
                elif digit in [10, 100, 1000]: # 十, 百, 千
                    if temp_num == 0: temp_num = 1 # 处理 "百", "千", "十" 前面没有显式数字的情况
                    total_value += temp_num * digit
                    temp_num = 0 # 单位处理完后，temp_num清零
                else: # '点' 不应出现在整数段
                    logger.warning(f"中文整数转换：整数部分遇到非单位或非0-9数字 '{char_cn}'")
                    return None
            else:
                logger.warning(f"中文整数转换：遇到未知字符 '{char_cn}'")
                return None
        total_value += temp_num # 加上最后可能剩余的个位数或几十位数（如"二十"）
        
        return total_value if total_value > 0 or cleaned_str == "零" else (None if cleaned_str else 0)


    def _chinese_num_to_arabic_internal(self, cn_num_part: str) -> Optional[float]:
        """内部辅助函数，处理核心中文数字到阿拉伯数字的转换（整数和小数）"""
        if not cn_num_part: return None
        try: return float(cn_num_part)
        except ValueError: pass

        if '点' in cn_num_part:
            parts = cn_num_part.split('点', 1)
            if len(parts) == 2:
                integer_part_str = parts[0]
                decimal_part_str = parts[1]
                integer_val = self._convert_chinese_int_segment(integer_part_str) if integer_part_str and integer_part_str != '零' else 0
                if integer_val is None: return None

                decimal_val_str = ""
                if not decimal_part_str: # 处理 "三点" 这种情况
                    return float(integer_val)

                for char_code in decimal_part_str:
                    digit = self.CH_NUM_MAP.get(char_code)
                    if digit is not None and digit < 10:
                        decimal_val_str += str(digit)
                    else:
                        logger.warning(f"中文小数转换：小数部分存在非法字符 '{char_code}' in '{cn_num_part}'")
                        return None
                return float(str(integer_val) + "." + decimal_val_str) if decimal_val_str else float(integer_val)
            else:
                logger.warning(f"中文数字转换：'{cn_num_part}' 格式不规范的点号用法。")
                return None
        
        res_int = self._convert_chinese_int_segment(cn_num_part)
        return float(res_int) if res_int is not None else None

    def _normalize_parameter(self, param_str_orig: Optional[str]) -> Any:
        if param_str_orig is None: return None
        param_str = str(param_str_orig).strip()
        if not param_str: return None
        
        # 尝试移除常见单位以提取核心数值
        cleaned_num_part = param_str.replace("度", "").replace("档", "").replace("格", "").strip()
        
        # 处理百分数，如 "百分之五十", "50%", "百分之六点五"
        is_percent = False
        if "%" in cleaned_num_part:
            cleaned_num_part = cleaned_num_part.replace("%", "")
            is_percent = True
        elif param_str.startswith("百分之"): # 保留原始param_str的百分之用于判断
            cleaned_num_part = cleaned_num_part.replace("百分之", "")
            is_percent = True
        
        # 尝试直接转float或中文转float
        num_val = self._chinese_num_to_arabic_internal(cleaned_num_part)

        if num_val is not None:
            return num_val / 100.0 if is_percent else num_val
        
        logger.debug(f"参数 '{param_str_orig}' 未能标准化为数值，将返回原始字符串。")
        return param_str_orig # 如果都失败，返回原始字符串

    def _normalize_device_id(self, device_id_str_list: Optional[List[str]]) -> str:
        if not device_id_str_list: return "0" 
        id_text_joined = "".join(device_id_str_list)
        
        try: return str(int(id_text_joined)) # 已经是纯数字
        except ValueError: pass

        cleaned_id_text = id_text_joined
        for suffix in self.CH_ID_SUFFIXES:
            if cleaned_id_text.endswith(suffix):
                cleaned_id_text = cleaned_id_text[:-len(suffix)]
        
        is_ordinal = False
        if cleaned_id_text.startswith(self.CH_ORDINAL_PREFIX):
            cleaned_id_text = cleaned_id_text[len(self.CH_ORDINAL_PREFIX):]
            is_ordinal = True
        
        if not cleaned_id_text: 
            logger.warning(f"无法从 '{id_text_joined}' 解析出有效的DEVICE_ID核心数字。")
            return id_text_joined 

        arabic_num = self._chinese_num_to_arabic_internal(cleaned_id_text)

        if arabic_num is not None:
            arabic_num_int = int(arabic_num) # 中文数字转换后通常是整数
            if is_ordinal and arabic_num_int > 0:
                return str(arabic_num_int - 1) 
            return str(arabic_num_int)
            
        logger.debug(f"DEVICE_ID '{id_text_joined}' 未能完全标准化为数字，返回原始拼接值。")
        return id_text_joined

    def _extract_entities_from_bio(self, tokens: List[str], bio_tags: List[str]) -> Dict[str, List[str]]:
        entities: Dict[str, List[str]] = {
            "DEVICE_TYPE": [], "DEVICE_ID": [], "LOCATION": [],
            "ACTION": [], "PARAMETER": []
        }
        current_entity_text_list: List[str] = []
        current_entity_type: Optional[str] = None

        if len(tokens) != len(bio_tags):
            logger.warning(f"Token数量 ({len(tokens)}) 与BIO标签数量 ({len(bio_tags)}) 不匹配。跳过实体提取。")
            return entities
            
        for i in range(len(tokens)):
            token = tokens[i].replace("##", "")
            tag = bio_tags[i]
            entity_type_from_tag = tag[2:] if len(tag) > 2 else None

            if tag.startswith("B-"):
                if current_entity_text_list and current_entity_type:
                    if current_entity_type in entities:
                        entities[current_entity_type].append("".join(current_entity_text_list))
                current_entity_text_list = [token]
                current_entity_type = entity_type_from_tag
            elif tag.startswith("I-") and current_entity_type == entity_type_from_tag:
                current_entity_text_list.append(token)
            else: 
                if current_entity_text_list and current_entity_type:
                    if current_entity_type in entities:
                        entities[current_entity_type].append("".join(current_entity_text_list))
                current_entity_text_list = []
                current_entity_type = None
                
        if current_entity_text_list and current_entity_type: 
            if current_entity_type in entities:
                entities[current_entity_type].append("".join(current_entity_text_list))
        return entities

    async def understand(self, text: str) -> Dict[str, Any]:
        logger.info(f"BertNLUProcessor.understand 接收到文本: '{text}'")
        if not text or not text.strip():
            logger.warning("输入文本为空。")
            return {"DEVICE_TYPE": None, "DEVICE_ID": "0", "LOCATION": None, "ACTION": None, "PARAMETER": None}

        # --- Tokenization and Model Prediction (与之前版本相同) ---
        inputs = self.tokenizer(
            text, return_tensors="pt", truncation=True,
            max_length=self.config.get("max_seq_length", 128),
            padding="max_length", is_split_into_words=False
        )
        input_ids_tensor = inputs["input_ids"].to(self.device)
        attention_mask_tensor = inputs["attention_mask"].to(self.device)

        with torch.no_grad():
            logits = self.model(input_ids=input_ids_tensor, attention_mask=attention_mask_tensor).logits

        predicted_ids_per_token = torch.argmax(logits, dim=2).squeeze().cpu().tolist()
        raw_tokens = self.tokenizer.convert_ids_to_tokens(input_ids_tensor.squeeze().cpu().tolist())
        
        active_tokens: List[str] = []
        active_bio_tags: List[str] = []
        word_ids = inputs.word_ids(batch_index=0) 
        previous_word_idx = None

        for i, token_prediction_id in enumerate(predicted_ids_per_token):
            if i >= len(word_ids): break
            current_word_idx = word_ids[i]
            if current_word_idx is None: continue
            if current_word_idx != previous_word_idx:
                if raw_tokens[i] not in [self.tokenizer.cls_token, self.tokenizer.sep_token, self.tokenizer.pad_token]:
                    active_tokens.append(raw_tokens[i])
                    active_bio_tags.append(self.id2slot.get(token_prediction_id, "O"))
            previous_word_idx = current_word_idx
        
        logger.debug(f"原始文本 '{text}' 的 Active Tokens: {active_tokens}")
        logger.debug(f"对应的 Active BIO Tags: {active_bio_tags}")

        extracted_raw_entities = self._extract_entities_from_bio(active_tokens, active_bio_tags)
        logger.debug(f"从BIO标签提取的原始实体: {extracted_raw_entities}")
        
        # --- 获取初步提取的槽位值 ---
        device_type = "".join(extracted_raw_entities.get("DEVICE_TYPE", [])) or None
        device_id_str_list = extracted_raw_entities.get("DEVICE_ID")
        location = "".join(extracted_raw_entities.get("LOCATION", [])) or None
        
        action_text_list = extracted_raw_entities.get("ACTION", [])
        action_text = "".join(action_text_list) if action_text_list else None # 例如 "调高", "降低", "设置"
        
        parameter_text_list = extracted_raw_entities.get("PARAMETER", [])
        raw_param_text = "".join(parameter_text_list) if parameter_text_list else None # 例如 "两度", "百分之五十", "一点"

        # --- 标准化 ACTION, PARAMETER, DEVICE_ID ---
        final_action_english: Optional[str] = None
        final_parameter: Any = None
        
        final_device_id = self._normalize_device_id(device_id_str_list) # ID标准化

        # 1. 标准化参数文本为数值（如果可能）
        # _normalize_parameter 会返回 float 或原始字符串
        normalized_param_value = self._normalize_parameter(raw_param_text) 

        # 2. 根据 action_text 和初步标准化的参数来决定最终的 action 和 parameter
        if action_text:
            cleaned_action_text = "".join(action_text.split()) # 清理空格，例如 "调 高" -> "调高"

            # 英文动作映射 (基于核心单字包含)
            if "增" in cleaned_action_text or "添" in cleaned_action_text or "加" in cleaned_action_text or "装" in cleaned_action_text or "安" in cleaned_action_text:
                final_action_english = "add"
                final_parameter = raw_param_text # 添加设备的名称作为参数
            elif "删" in cleaned_action_text or "移除" in cleaned_action_text or "我不要" in cleaned_action_text or "解除" in cleaned_action_text :
                final_action_english = "delete"
                # 删除操作的参数可能是设备名或ID，这里如果PARAMETER槽有值，就用它
                final_parameter = raw_param_text if raw_param_text else None 
            elif "开" in cleaned_action_text or "启" in cleaned_action_text or "点亮" in cleaned_action_text:
                final_action_english = "turn_on"
                final_parameter = 0.0 # 开关默认参数
            elif "关" in cleaned_action_text or "闭" in cleaned_action_text or "熄" in cleaned_action_text:
                final_action_english = "turn_off"
                final_parameter = 0.0 # 开关默认参数
            elif "查询" in cleaned_action_text or "查看" in cleaned_action_text or "状态" in cleaned_action_text or "情况" in cleaned_action_text or "是多少" in cleaned_action_text:
                final_action_english = "query"
                final_parameter = raw_param_text # 查询的参数可能是具体想查询的属性
            elif "拉上" in cleaned_action_text or "合上" in cleaned_action_text:
                final_action_english = "close_curtain" 
                final_parameter = normalized_param_value if isinstance(normalized_param_value, float) else (1.0 if normalized_param_value is None else raw_param_text) # 1.0 代表完全关闭
            elif "拉开" in cleaned_action_text:
                final_action_english = "open_curtain"
                final_parameter = normalized_param_value if isinstance(normalized_param_value, float) else (1.0 if normalized_param_value is None else raw_param_text) # 1.0 代表完全打开
            
            # 重点处理 modify 类动作
            elif "调" in cleaned_action_text or "变" in cleaned_action_text or "设" in cleaned_action_text or "整" in cleaned_action_text or "到" in cleaned_action_text:
                final_action_english = "modify"
                
            # 默认使用已经标准化过的参数值
            final_parameter = normalized_param_value

            # 检查动作文本中是否有方向性词汇，并据此调整参数符号
            is_value_negative = False
            if "低" in cleaned_action_text or "冷" in cleaned_action_text or "暗" in cleaned_action_text or "小" in cleaned_action_text or "减" in cleaned_action_text:
                final_action_english = "modify"
                is_value_negative = True
                
            is_value_positive = False
            if "高" in cleaned_action_text or "热" in cleaned_action_text or "亮" in cleaned_action_text or "大" in cleaned_action_text or "增" in cleaned_action_text: # 注意 "增加" 可能和 add 冲突，这里的规则顺序很重要
                final_action_english = "modify"
                is_value_positive = True


            if isinstance(normalized_param_value, float): # 如果参数本身是数值
                if is_value_negative:
                    final_parameter = -abs(normalized_param_value) # 例如 "调低两度" -> -2.0
                    # 如果动作中有"高"但参数是"两度"，则保持为2.0，因为"高"是方向，"两度"是幅度
                    # 只有在参数本身没有明确数值，且动作有方向时，才用"+1" "-1"
                
                elif raw_param_text and raw_param_text in ["一点", "一些", "一点点"]: # 参数是相对词
                    if is_value_positive:
                        final_parameter = "+0.1" # 示例：小的正向调整标记
                    elif is_value_negative:
                        final_parameter = "-0.1" # 示例：小的负向调整标记
                    else: # 没有明确方向，但参数是“一点”
                        final_parameter = raw_param_text # 保留 "一点"
                elif raw_param_text: # 参数是其他文本，如 "制冷模式"
                    final_parameter = raw_param_text
            elif final_action_english == "modify": # 参数槽为空，但动作是调节类
                if is_value_positive:
                    final_parameter = "+1" 
                elif is_value_negative:
                    final_parameter = "-1"
                else:
                    logger.warning(f"动作是 '{final_action_english}' 但未提取或推断出任何参数，文本: '{text}'")
                    final_parameter = None
            else:
                if not final_action_english:
                    logger.warning(f"未知的中文动作实体 (最终判断): '{cleaned_action_text}'，无法映射。")
        else: # 如果模型没有提取出ACTION实体
            # 这里可以根据PARAMETER槽是否有值进行一些推断
            # 例如，如果text="温度25度"，ACTION为空，PARAMETER为25.0，可以推断为modify
            if isinstance(normalized_param_value, float) and device_type: # 有设备类型和数值参数，但无动作
                final_action_english = "modify" # 默认为修改参数
                final_parameter = normalized_param_value
                logger.info(f"无显式ACTION，但有设备和数值参数，推断为modify: {text}")


        final_result = {
            "DEVICE_TYPE": device_type,
            "DEVICE_ID": final_device_id,
            "LOCATION": location,
            "ACTION": final_action_english,
            "PARAMETER": final_parameter
        }
        logger.info(f"NLU 理解结果 for '{text}': {final_result}")
        return final_result

# --- 主程序/测试部分 ---
if __name__ == '__main__':
    import asyncio
    if not logger.hasHandlers():
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    current_file_dir = Path(__file__).resolve().parent
    nlu_dir = current_file_dir.parent 
    fine_tuned_model_path = nlu_dir / "model" / "fine_tuned_nlu_bert"

    config_for_testing = {
        "model_path": str(fine_tuned_model_path),
        "device": "cpu" 
    }
    
    if not fine_tuned_model_path.exists() or not fine_tuned_model_path.is_dir():
        logger.error(f"错误：指定的模型路径 '{fine_tuned_model_path}' 不存在或不是一个目录。")
        sys.exit(1)

    async def main_test():
        try:
            processor = BertNLUProcessor(config_for_testing)
            logger.info("BertNLUProcessor 初始化成功，准备测试。")
        except Exception as e:
            logger.error(f"初始化 BertNLUProcessor 失败: {e}", exc_info=True)
            return

        test_cases = [
            "空调温度调低两度",         # Expected ACTION: modify, PARAMETER: -2.0
            "把卧室灯的亮度调高一些",   # Expected ACTION: modify, PARAMETER: "+0.1" (或 "+1")
            "帮我加热一下微波炉",       # Expected ACTION: modify
            "客厅空调，温度二十二",     # Expected ACTION: modify, PARAMETER: 22.0
            "将风扇风速设为三档",       # ACTION: modify, PARAMETER: 3.0
            "把灯光调成红色",           # ACTION: modify, PARAMETER: "红色"
            "音量增大",                 # ACTION: modify, PARAMETER: "+1"
            "移除第二个摄像头",         # ACTION: delete, DEVICE_ID: "1"
            "添加一个叫书房夜灯的新灯到书房", # ACTION: add, PARAMETER: "书房夜灯"
            "将客厅的空调温度调低两度",   # ACTION: modify, PARAMETER: -2.0
            "客厅灯调到百分之五",        # ACTION: modify, PARAMETER: 0.05
            "打开三号卧室的灯",           # ACTION: turn_on, DEVICE_ID: "3"
            "温度调高",                 # ACTION: modify, PARAMETER: "+1"
            "湿度降低百分之十",         # ACTION: modify, PARAMETER: -0.1
            "把灯亮度调暗一点点",        # ACTION: modify, PARAMETER: "-0.1"
            "空调低2度",
            "加热烤箱"
        ]

        for text_case in test_cases:
            try:
                result = await processor.understand(text_case)
                print(f"\nInput: '{text_case}'\nOutput: {result}")
            except Exception as e:
                logger.error(f"处理 '{text_case}' 时出错: {e}", exc_info=True)
            print("-" * 40)

    asyncio.run(main_test())