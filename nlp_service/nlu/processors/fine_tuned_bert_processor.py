import logging
from typing import Dict, List, Any, Tuple, Optional
import sys
from pathlib import Path
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForTokenClassification
import re
from huggingface_hub import snapshot_download
logger = logging.getLogger(__name__)
try:
    from interfaces.nlu_interface import NLUInterface
except ImportError:
    logger.warning("NLUInterface not found from 'interfaces.nlu_interface'. Using a dummy interface for testing.")
    class NLUInterface: # type: ignore
        async def understand(self, text: str) -> Dict:
            raise NotImplementedError

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

    DEFAULT_MODEL_HUB_ID = "LIUWJ/fine-tuned-home-bert"

    def __init__(self, config: Dict):
        """
        初始化BertNLUProcessor

        Args:
            config: 处理器配置，应包含:
                local_model_target_dir (str): 希望模型文件存放的本地目录路径.
                                            例如: "nlu/model/fine_tuned_nlu_bert"
                model_hub_id (str, optional): Hugging Face Hub上的模型ID。
                                             如果未提供，则使用类中定义的 DEFAULT_MODEL_HUB_ID。
                tokenizer_hub_id (str, optional): Tokenizer在Hub上的ID，如果与model_hub_id不同。
                                                 通常使用 model_hub_id 即可。
                device (str, optional): "cuda" 或 "cpu". 默认自动检测.
                force_download (bool, optional): 是否强制重新下载模型，即使本地已存在。默认为 False.
        """
        self.config = config

        local_model_target_dir_str = config.get("local_model_target_dir")
        if not local_model_target_dir_str:
            logger.error("配置中未提供 'local_model_target_dir'。")
            raise ValueError("配置中必须提供 'local_model_target_dir'，用于存放或加载模型文件。")
        
        self.local_model_path = Path(local_model_target_dir_str).resolve()
        # 确保目标目录存在，如果不存在则创建
        self.local_model_path.mkdir(parents=True, exist_ok=True)

        model_hub_id_to_download = config.get("model_hub_id", self.DEFAULT_MODEL_HUB_ID)
        tokenizer_hub_id_to_download = config.get("tokenizer_hub_id", model_hub_id_to_download)
        force_download = config.get("force_download", False)

        # --- 模型下载和加载逻辑 ---
        # 检查本地目标目录是否已包含必要的模型文件
        # 通过检查 config.json 和权重文件（pytorch_model.bin 或 model.safetensors）来判断
        config_file = self.local_model_path / "config.json"
        weights_file_bin = self.local_model_path / "pytorch_model.bin"
        weights_file_safetensors = self.local_model_path / "model.safetensors"
        tokenizer_config_file = self.local_model_path / "tokenizer_config.json"


        model_exists_locally = config_file.exists() and \
                               (weights_file_bin.exists() or weights_file_safetensors.exists()) and \
                               tokenizer_config_file.exists()

        model_load_path_str = str(self.local_model_path) # 默认从这个路径加载

        if not model_exists_locally or force_download:
            if force_download:
                logger.info(f"强制重新下载模型 '{model_hub_id_to_download}' 到 '{self.local_model_path}'...")
            else:
                logger.info(f"本地模型 '{self.local_model_path}' 不完整或未找到，尝试从 Hugging Face Hub '{model_hub_id_to_download}' 下载...")
            
            try:
                # 使用 snapshot_download 下载整个模型仓库到指定本地目录
                # ignore_patterns 可以排除不需要的文件，例如 .gitattributes, README.md (如果Hub上有)
                # local_dir_use_symlinks=False 会实际复制文件，而不是创建符号链接
                downloaded_path_str = snapshot_download(
                    repo_id=model_hub_id_to_download,
                    local_dir=model_load_path_str, # 直接下载到目标路径
                    local_dir_use_symlinks=False, 
                    # revision="main", # 可以指定分支、标签或commit hash
                    # token=True, # 如果是私有模型，确保已登录或传入token
                    ignore_patterns=[".gitattributes"] # 忽略git属性文件
                )
                logger.info(f"模型文件已成功下载/更新到: {downloaded_path_str}")
            except Exception as e:
                logger.error(f"从 Hub 下载模型 '{model_hub_id_to_download}' 到 '{self.local_model_path}' 失败: {e}", exc_info=True)
                logger.error("请检查网络连接、模型ID是否正确，以及您是否有权访问该模型（如果是私有模型）。")
                # 如果下载失败，但本地仍有部分文件，加载可能会出错。可以考虑清空目录或抛出更严重的错误。
                # 为简单起见，这里继续尝试加载，但很可能会失败。
                if not model_exists_locally: # 如果之前本地根本没有，现在下载又失败，则无法继续
                     raise FileNotFoundError(f"模型下载失败且本地 '{self.local_model_path}' 无有效模型。") from e
        else:
            logger.info(f"在本地路径 '{self.local_model_path}' 找到现有模型文件，将直接使用。")
    
        
        self.device = config.get("device")
        if self.device:
            if self.device.lower() == "auto":
                self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                logger.info(f"设置为自动选择设备，将使用: {self.device}")
            else:
                self.device = torch.device(self.device)
        else:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"未指定设备，自动选择: {self.device}")
        logger.info(f"使用设备: {self.device}")

        try:
            # 始终从 model_load_path_str (即 self.local_model_path) 加载
            self.tokenizer = AutoTokenizer.from_pretrained(model_load_path_str)
            self.model = AutoModelForTokenClassification.from_pretrained(model_load_path_str)

            # 确保模型加载到正确设备
            self.model.to(self.device)
            logger.info(f"模型已加载到设备: {self.device}")
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
        logger.info(f"BertNLUProcessor 已成功初始化 (模型来源: '{model_load_path_str}')")

    def _convert_chinese_int_segment(self, cn_int_str: str) -> Optional[int]:
        """转换常见的中文整数片段 (万以下简单版)"""
        if not cn_int_str: return 0
        try: return int(cn_int_str) # 如果已经是阿拉伯数字
        except ValueError: pass

        if cn_int_str == "零": return 0
        
        num_map = self.CH_NUM_MAP
        # 单位处理
        units = {'十': 10, '百': 100, '千': 1000}
        # 移除不参与数值计算的单位词，例如温度的"度"或序数的"号"
        cleaned_str = cn_int_str.replace("度", "").replace("号","").replace("个","")

        if not cleaned_str: return None

        if cleaned_str == "十": return 10 # "十"本身

        total_value = 0
        current_section_value = 0 # 处理如 "一百零五" 中的 "一百" 和 "五"
        current_digit_value = 0 # 当前数字的值，如 "二" (在 "二百" 中)
        
        # 简单从左到右解析，处理 "二百三十五", "二十三", "十三", "一百零五" 这种结构
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
        
        # 先判断是否是百分比，并提取数字部分
        is_percent = False
        numeric_part_for_conversion = param_str # 默认用原始清理过的字符串进行数字转换

        if "%" in param_str:
            numeric_part_for_conversion = param_str.replace("%", "").strip()
            is_percent = True
        elif param_str.startswith("百分之"):
            numeric_part_for_conversion = param_str.replace("百分之", "").strip()
            is_percent = True
        
        # 移除数字部分中可能仍然存在的单位（如果它们紧跟数字）
        # 这一步要在判断百分比之后，以防 "百分之五十度" 这样的情况
        if not is_percent: # 只有非百分比数才移除这些单位，避免 "百分之五十度" 错误处理
             numeric_part_for_conversion = numeric_part_for_conversion.replace("度", "").replace("档", "").replace("格", "").strip()

        if not numeric_part_for_conversion: # 如果移除后为空 (例如参数就是 "度")
            logger.debug(f"参数 '{param_str_orig}' 清理后为空，返回原始字符串。")
            return param_str_orig


        # 尝试直接转float或中文转float
        num_val = self._chinese_num_to_arabic_internal(numeric_part_for_conversion)

        if num_val is not None:
            num_val = num_val / 100.0 if is_percent else num_val
            
            if num_val.is_integer():
                return str(int(num_val))
            return str(num_val)
        
        # 如果经过上述处理，num_val 仍为 None，说明无法转为数值
        # 此时，我们应该返回原始未经修改的参数文本，因为它可能是状态词等
        logger.debug(f"参数 '{param_str_orig}' 未能标准化为数值，将返回原始字符串。")
        return param_str_orig

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
        device_type = ",".join(extracted_raw_entities.get("DEVICE_TYPE", [])) or None
        device_id_str_list = extracted_raw_entities.get("DEVICE_ID")
        location = ",".join(extracted_raw_entities.get("LOCATION", [])) or None
        
        action_text_list = extracted_raw_entities.get("ACTION", [])
        action_text_raw = "".join(action_text_list) if action_text_list else None 
        
        parameter_text_list = extracted_raw_entities.get("PARAMETER", [])
        raw_param_text = ",".join(parameter_text_list) if parameter_text_list else None

        # --- 标准化 ACTION, PARAMETER, DEVICE_ID ---
        final_action_english: Optional[str] = None
        final_parameter: Any = None
        
        final_device_id = self._normalize_device_id(device_id_str_list)
        
        normalized_param_from_slot = self._normalize_parameter(raw_param_text) # 参数槽的标准化值

        # 增强判断方向: 同时考虑action、参数和原始文本
        combined_text_for_direction = (action_text_raw or "") + (raw_param_text or "") + text
        
        is_negative_direction = "低" in combined_text_for_direction or \
                                "冷" in combined_text_for_direction or \
                                "暗" in combined_text_for_direction or \
                                "小" in combined_text_for_direction or \
                                "减" in combined_text_for_direction 
                                
        is_positive_direction = "高" in combined_text_for_direction or \
                                "热" in combined_text_for_direction or \
                                "亮" in combined_text_for_direction or \
                                "大" in combined_text_for_direction or \
                                "增" in combined_text_for_direction or \
                                "加" in combined_text_for_direction

        def format_number_as_str(num):
            """将数值转为字符串，如果是整数则去掉小数点和尾零"""
            try:
                float_val = float(num)
                if float_val.is_integer():
                    return str(int(float_val))
                return str(float_val)
            except (ValueError, TypeError):
                return str(num)

        if action_text_raw:
            cleaned_action_text = "".join(action_text_raw.split())
            
            # 优先处理非modify动作
            if "增" in cleaned_action_text or "添" in cleaned_action_text or ("加" in cleaned_action_text and not is_positive_direction) or "装" in cleaned_action_text or "安" in cleaned_action_text: # "加"如果不是表示增加数值
                final_action_english = "add"
                final_parameter = raw_param_text 
            elif "删" in cleaned_action_text or "移" in cleaned_action_text or "不要" in cleaned_action_text or "除" in cleaned_action_text :
                final_action_english = "delete"
                final_parameter = raw_param_text 
            elif "开" in cleaned_action_text or "启" in cleaned_action_text or "亮" in cleaned_action_text:
                final_action_english = "turn_on"
                final_parameter = "0"  
            elif "关" in cleaned_action_text or "闭" in cleaned_action_text or "熄" in cleaned_action_text:
                final_action_english = "turn_off"
                final_parameter = "0" # 
            elif "查" in cleaned_action_text or "询" in cleaned_action_text or "状态" in cleaned_action_text or "情况" in cleaned_action_text or "多少" in cleaned_action_text or "看" in cleaned_action_text or "问" in cleaned_action_text:
                final_action_english = "query"
                final_parameter = raw_param_text
            elif "上" in cleaned_action_text or "合" in cleaned_action_text or "关" in cleaned_action_text or "拉" in cleaned_action_text:
                final_action_english = "close_curtain" 
                final_parameter = normalized_param_from_slot
            elif "开" in cleaned_action_text:
                final_action_english = "open_curtain"
                final_parameter = normalized_param_from_slot
            
            # 处理 modify 类动作
            # (如果上面的条件都不满足，但包含调节类核心词，则认为是modify)
            # 或者，如果参数槽有值，且没有明确的其他动作，也认为是modify
            elif "调" in cleaned_action_text or "变" in cleaned_action_text or \
                 "设" in cleaned_action_text or "整" in cleaned_action_text or \
                 "到" in cleaned_action_text or is_negative_direction or is_positive_direction or \
                 (raw_param_text and not final_action_english):
                
                final_action_english = "modify"
                final_parameter = normalized_param_from_slot # 默认使用参数槽的值

                try:
                    param_float = float(normalized_param_from_slot) if normalized_param_from_slot is not None else None
                    if param_float is not None:
                        # 无论参数符号与方向是否一致，都添加符号
                        abs_val_str = format_number_as_str(abs(param_float)) # 使用辅助函数处理整数值
                        if is_negative_direction:
                            if param_float > 0:  # 例如 "调低2度", param=2.0 -> "-2"
                                final_parameter = f"-{abs_val_str}"
                            else:  # 例如 "调低-2度"
                                final_parameter = f"-{abs_val_str}"
                        elif is_positive_direction:
                            if param_float < 0:  # 例如 "调高-2度"
                                final_parameter = f"+{abs_val_str}"
                            else:  # 例如 "调高2度", param=2.0 -> "+2"
                                final_parameter = f"+{abs_val_str}"
                        else:
                            # 没有明确方向，保留原始值但转为字符串
                            final_parameter = format_number_as_str(param_float)
                except (ValueError, TypeError):
                    # 参数不是数值，处理相对词或者其他文本
                    if raw_param_text and raw_param_text in ["一点", "一些", "一点点"]:  # 参数是相对词
                        if is_positive_direction: final_parameter = "+0.1"
                        elif is_negative_direction: final_parameter = "-0.1"
                        else: final_parameter = raw_param_text  # 保留 "一点" 如果没有明确方向
                    elif raw_param_text:  # 参数是其他文本，如 "制冷模式"
                        final_parameter = raw_param_text
                    else:  # 参数槽为空，但动作是调节类（例如，只说了 "调高"）
                        if is_positive_direction: final_parameter = "+1"
                        elif is_negative_direction: final_parameter = "-1"
                        else:
                            logger.warning(f"动作是 '{final_action_english}' 但未提取或推断出任何参数，文本: '{text}'")
                            final_parameter = None
            else: # 如果经过以上所有判断都没有匹配到标准动作
                if not final_action_english: 
                    logger.warning(f"未知的中文动作实体 (最终判断): '{cleaned_action_text}'，无法映射。")
                    final_parameter = normalized_param_from_slot # 即使动作未知，参数也标准化一下
        
        # 如果没有提取出ACTION实体，但有设备和参数
        elif not final_action_english and device_type and raw_param_text:
            final_action_english = "modify" # 默认为修改参数
            
            try:
                # 处理浮点数参数，添加正负号
                param_float = float(normalized_param_from_slot) if normalized_param_from_slot is not None else None
                if param_float is not None:
                    # 如果是数值且有方向，添加符号
                    abs_val_str = format_number_as_str(abs(param_float)) 
                    if is_positive_direction:
                        final_parameter = f"+{abs_val_str}" 
                    elif is_negative_direction:
                        final_parameter = f"-{abs_val_str}"
                    else:
                        # 没有明确方向，保留原始值但转为字符串
                        final_parameter = format_number_as_str(param_float)
                else:
                    # 不是数值类型
                    if is_positive_direction: final_parameter = "+1" 
                    elif is_negative_direction: final_parameter = "-1"
                    else: final_parameter = normalized_param_from_slot  # 非数值参数
            except (ValueError, TypeError):
                # 无法转换为浮点数
                if is_positive_direction: final_parameter = "+1"
                elif is_negative_direction: final_parameter = "-1"
                else: final_parameter = normalized_param_from_slot  # 原始值
                
            logger.info(f"无显式ACTION，但有设备和参数，推断为modify: {text}")
            
        # 没有ACTION实体也没参数，但有设备类型且有方向性指示
        elif not final_action_english and device_type and (is_positive_direction or is_negative_direction):
            final_action_english = "modify"
            if is_positive_direction:
                final_parameter = "+1"
            else:
                final_parameter = "-1"

        # 再次检查开关动作的默认参数
        if final_action_english in ["turn_on", "turn_off"] and final_parameter is None:
            final_parameter = "0"
        
        if final_action_english == "modify" and final_parameter is None:
            if is_positive_direction:
                final_parameter = "+1"
            elif is_negative_direction:
                final_parameter = "-1"
        
        # 如果有设备类型但没有动作，并且检测到方向性词，默认为modify
        if device_type and final_action_english is None and (is_positive_direction or is_negative_direction):
            final_action_english = "modify"
            if is_positive_direction:
                final_parameter = "+1"
            elif is_negative_direction:
                final_parameter = "-1"

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
    target_local_model_directory = nlu_dir / "model" / "fine_tuned_nlu_bert"

    config_for_testing = {
        "local_model_target_dir": str(target_local_model_directory), # 本地目标目录
        "model_hub_id": "LIUWJ/fine-tuned-home-bert", # Hub模型ID
        "device": "cpu",
        # "force_download": True # 强制重新下载则取消这行注释
    }

    async def main_test():
        try:
            processor = BertNLUProcessor(config_for_testing)
            logger.info("BertNLUProcessor 初始化成功，准备测试。")
        except Exception as e:
            logger.error(f"初始化 BertNLUProcessor 失败: {e}", exc_info=True)
            return

        test_cases = [
            "空调温度调低两度",         # Expected ACTION: modify, PARAMETER: "-2.0"
            "把卧室灯的亮度调高一些",   # Expected ACTION: modify, PARAMETER:  "+1"
            "帮我加热一下微波炉",       # Expected ACTION: modify
            "客厅空调，温度二十二",     # Expected ACTION: modify, PARAMETER: "22.0"
            "将风扇风速设为三档",       # ACTION: modify, PARAMETER: "3.0"
            "把灯光调成红色",           # ACTION: modify, PARAMETER: "红色"
            "音量增大",                 # ACTION: modify, PARAMETER: "+1"
            "移除第二个摄像头",         # ACTION: delete, DEVICE_ID: "1"
            "添加一个叫书房夜灯的新灯到书房", # ACTION: add, PARAMETER: "书房夜灯"
            "将客厅的空调温度调低两度",   # ACTION: modify, PARAMETER: "-2.0"
            "客厅灯调到百分之五",        # ACTION: modify, PARAMETER: "0.05"
            "打开三号卧室的灯",           # ACTION: turn_on, DEVICE_ID: "3"
            "客厅空调温度调高",                 # ACTION: modify, PARAMETER: "+1"
            "湿度降低百分之十",         # ACTION: modify, PARAMETER: "-0.1"
            "把灯亮度调暗一点点",        # ACTION: modify, PARAMETER: "-0.1"
            "空调低2度",                # ACTION: modify, PARAMETER: "-2.0"
            "加热烤箱",
            "热一下烤箱",
            "拉窗帘"
        ]

        for text_case in test_cases:
            try:
                result = await processor.understand(text_case)
                print(f"\nInput: '{text_case}'\nOutput: {result}")
            except Exception as e:
                logger.error(f"处理 '{text_case}' 时出错: {e}", exc_info=True)
            print("-" * 40)

    asyncio.run(main_test())
