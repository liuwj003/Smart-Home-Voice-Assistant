import logging
from typing import Dict, List, Any, Tuple, Optional
import sys
from pathlib import Path
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForTokenClassification

# 将项目根目录添加到系统路径 (如果您的 NLUInterface 在其他地方)
# 如果 NLUInterface 和这个文件在同一个包或可直接导入，这可能不是必需的
# 假设 NLUInterface 在 nlu/ 目录的 interfaces 子目录
# CURRENT_FILE_DIR = Path(__file__).resolve().parent # .../nlu/processors
# PROJECT_ROOT_NLU = CURRENT_FILE_DIR.parent # .../nlu
# sys.path.append(str(PROJECT_ROOT_NLU.parent)) # 添加 SmartHomeVoiceAssistant 根目录 (如果需要)
# sys.path.append(str(PROJECT_ROOT_NLU)) # 添加 nlu 目录 (如果 interfaces 在 nlu/interfaces)

# 为了让代码可独立运行和测试，如果 NLUInterface 未找到，则定义一个简单的
try:
    from interfaces.nlu_interface import NLUInterface
except ImportError:
    logger = logging.getLogger(__name__) # 需要先定义logger
    logger.warning("NLUInterface not found from 'interfaces.nlu_interface'. Using a dummy interface for testing.")
    class NLUInterface: # type: ignore
        async def understand(self, text: str) -> Dict:
            raise NotImplementedError

# 配置日志
logger = logging.getLogger(__name__) # 确保logger在使用前定义

class BertNLUProcessor(NLUInterface):
    """
    Pretrained Bert, then fine-tuned for slot filling on a small dataset.
    Extracts: DEVICE_TYPE, DEVICE_CURR_ID, LOCATION, ACTION, PARAMETER.
    """

    def __init__(self, config: Dict):
        """
        初始化BertNLUProcessor

        Args:
            config: 处理器配置，应包含:
                model_path (str): 微调后模型的**相对或绝对路径**.
                                  例如，如果此文件在 'nlu/processors/'，模型在 'nlu/model/fine_tuned_nlu_bert/',
                                  则相对路径可以是 '../model/fine_tuned_nlu_bert'
                tokenizer_name_or_path (str, optional): Tokenizer的路径，如果与model_path不同. 默认使用model_path.
                device (str, optional): "cuda" 或 "cpu". 默认自动检测.
        """
        self.config = config
        
        # model_path 现在应该由调用者通过 config 传入一个指向实际微调模型的有效路径
        model_path_str = config.get("model_path")
        if not model_path_str:
            logger.error("配置中未提供 'model_path'。")
            raise ValueError("配置中必须提供 'model_path'，指向微调后的模型目录。")

        # 解析model_path，可以是相对路径也可以是绝对路径
        # 如果是从当前文件所在目录开始的相对路径
        self.model_path = (Path(__file__).parent / model_path_str).resolve()
        # 如果传入的是期望的绝对路径或相对于工作目录的路径，可以直接用 Path(model_path_str).resolve()
        # 为了更通用，我们假设传入的model_path是相对于项目结构中某个基点的，
        # 或者调用者会传入正确的绝对路径。
        # 简单起见，我们直接使用传入的路径，并期望它是正确的。
        self.model_path = Path(model_path_str).resolve()


        self.tokenizer_path = str(Path(config.get("tokenizer_name_or_path", self.model_path)).resolve()) # Tokenizer通常和模型一起保存

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
                # 你可能还需要 slot2id，可以从 id2slot 反向生成或从 model.config.label2id 获取
                if hasattr(self.model.config, 'label2id'):
                    self.slot2id = {k: int(v) for k, v in self.model.config.label2id.items()}
                else: # Fallback if label2id not present
                    self.slot2id = {v: k for k,v in self.id2slot.items()}

            else:
                logger.error("模型配置中未找到id2label。无法进行标签映射。")
                # 你之前定义的 slot_labels_list 可以作为回退，但最好模型配置是完整的
                slot_labels_list_fallback = [
                    "O", "B-DEVICE_TYPE", "I-DEVICE_TYPE", "B-DEVICE_ID", "I-DEVICE_ID", # 注意这里之前是DEVICE_CURR_ID
                    "B-LOCATION", "I-LOCATION", "B-ACTION", "I-ACTION",
                    "B-PARAMETER", "I-PARAMETER",
                ]
                logger.warning(f"将使用预定义的 slot_labels_list_fallback 进行标签映射: {slot_labels_list_fallback}")
                self.id2slot = {i: label for i, label in enumerate(slot_labels_list_fallback)}
                self.slot2id = {label: i for i, label in enumerate(slot_labels_list_fallback)}
                # raise ValueError("无法确定标签映射 (id2slot)。") # 或者直接报错

        except Exception as e:
            logger.error(f"加载模型或tokenizer失败: {e}", exc_info=True)
            raise

        logger.info("BertNLUProcessor 已成功初始化")

    def _extract_entities_from_bio(self, tokens: List[str], bio_tags: List[str]) -> Dict[str, List[str]]:
        entities: Dict[str, List[str]] = {
            "DEVICE_TYPE": [], "DEVICE_ID": [], "LOCATION": [], # 修改 DEVICE_CURR_ID 为 DEVICE_ID
            "ACTION": [], "PARAMETER": []
        }
        current_entity_text = ""
        current_entity_type = None

        if len(tokens) != len(bio_tags):
            logger.warning(f"Token数量 ({len(tokens)}) 与BIO标签数量 ({len(bio_tags)}) 不匹配。跳过实体提取。")
            return entities
            
        for i in range(len(tokens)):
            token = tokens[i]
            tag = bio_tags[i]

            # 修正实体类型名称，确保与 entities 字典中的键一致
            # 例如，如果标签是 "B-DEVICE_CURR_ID"，我们希望映射到 "DEVICE_ID"
            entity_type_from_tag = tag[2:]
            if entity_type_from_tag == "DEVICE_CURR_ID": # 如果你的标签仍然是DEVICE_CURR_ID
                 entity_type_from_tag = "DEVICE_ID"


            if tag.startswith("B-"):
                if current_entity_text and current_entity_type:
                    if current_entity_type in entities: # current_entity_type 应该是纯类型名
                        entities[current_entity_type].append(current_entity_text)
                    else:
                        logger.warning(f"未知的实体类型 '{current_entity_type}' 来自标签的B-部分。")
                current_entity_text = token.replace("##", "")
                current_entity_type = entity_type_from_tag # 使用处理后的 entity_type_from_tag
            elif tag.startswith("I-") and current_entity_type == entity_type_from_tag:
                current_entity_text += token.replace("##", "")
            else: 
                if current_entity_text and current_entity_type:
                    if current_entity_type in entities:
                        entities[current_entity_type].append(current_entity_text)
                    else:
                        logger.warning(f"未知的实体类型 '{current_entity_type}' (前一个实体)。")
                current_entity_text = ""
                current_entity_type = None
                
        if current_entity_text and current_entity_type: 
            if current_entity_type in entities:
                entities[current_entity_type].append(current_entity_text)
            else:
                logger.warning(f"未知的实体类型 '{current_entity_type}' (最后一个实体)。")
        return entities

    def _normalize_parameter(self, param_str: Optional[str]) -> Any:
        if param_str is None:
            return None
        param_str = str(param_str).strip()
        if not param_str:
            return None
            
        if "%" in param_str:
            try:
                return float(param_str.replace("%", "").strip()) / 100.0
            except ValueError:
                logger.warning(f"无法将百分比参数 '{param_str}' 转换为浮点数。")
                return param_str 
        try:
            # 尝试处理 "二十三度" -> 23.0, "两度" -> 2.0 这种 (需要更复杂的中文数字转换)
            # 简单版本：直接尝试float转换
            return float(param_str)
        except ValueError:
            # 这里可以加入中文数字到阿拉伯数字的转换逻辑
            # 示例（非常基础，不完整）：
            if "两" in param_str and "度" in param_str: param_str = param_str.replace("两", "2")
            if "二十三" in param_str: param_str = param_str.replace("二十三", "23")
            # ... 更多规则 ...
            # 再次尝试转换
            try:
                return float(param_str.replace("度","").strip()) # 去掉"度"再尝试
            except ValueError:
                logger.debug(f"参数 '{param_str}' 不是标准浮点数，将返回原字符串。")
                return param_str


    async def understand(self, text: str) -> Dict[str, Any]:
        logger.info(f"BertNLUProcessor.understand 接收到文本: '{text}'")
        if not text or not text.strip():
            logger.warning("输入文本为空。")
            return {
                "DEVICE_TYPE": None, "DEVICE_ID": "0", "LOCATION": None, # 修改 DEVICE_CURR_ID 为 DEVICE_ID
                "ACTION": None, "PARAMETER": None
            }

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=self.config.get("max_seq_length", 128),
            padding="max_length",
            is_split_into_words=False
        )
        input_ids_tensor = inputs["input_ids"].to(self.device)
        attention_mask_tensor = inputs["attention_mask"].to(self.device)

        with torch.no_grad():
            logits = self.model(input_ids=input_ids_tensor, attention_mask=attention_mask_tensor).logits

        predicted_ids_per_token = torch.argmax(logits, dim=2).squeeze().cpu().tolist()
        
        tokens = self.tokenizer.convert_ids_to_tokens(input_ids_tensor.squeeze().cpu().tolist())
        
        active_tokens: List[str] = []
        active_bio_tags: List[str] = []
        
        word_ids = inputs.word_ids(batch_index=0) 
        previous_word_idx = None

        for i, token_prediction_id in enumerate(predicted_ids_per_token):
            if i >= len(word_ids): 
                break
            current_word_idx = word_ids[i]
            
            if current_word_idx is None: 
                continue
            
            if current_word_idx != previous_word_idx:
                if tokens[i] not in [self.tokenizer.cls_token, self.tokenizer.sep_token, self.tokenizer.pad_token]:
                    active_tokens.append(tokens[i].replace("##", "")) 
                    active_bio_tags.append(self.id2slot.get(token_prediction_id, "O"))
            previous_word_idx = current_word_idx
            
            if len("".join(active_tokens)) > len(text) + 5 : 
                logger.debug("提取的token长度似乎超过原始文本，提前停止。")
                break
        
        logger.debug(f"原始文本 '{text}' 的 Active Tokens: {active_tokens}")
        logger.debug(f"对应的 Active BIO Tags: {active_bio_tags}")

        extracted_raw_entities = self._extract_entities_from_bio(active_tokens, active_bio_tags)
        logger.debug(f"从BIO标签提取的原始实体: {extracted_raw_entities}")

        device_type = extracted_raw_entities.get("DEVICE_TYPE")[0] if extracted_raw_entities.get("DEVICE_TYPE") else None
        device_id_list = extracted_raw_entities.get("DEVICE_ID") # 使用 DEVICE_ID
        device_id = device_id_list[0] if device_id_list else "0" 
        
        location = extracted_raw_entities.get("LOCATION")[0] if extracted_raw_entities.get("LOCATION") else None
        
        action_list = extracted_raw_entities.get("ACTION")
        action = action_list[0] if action_list else None
        
        parameter_list = extracted_raw_entities.get("PARAMETER")
        raw_param = parameter_list[0] if parameter_list else None
        parameter = self._normalize_parameter(raw_param)

        if action:
            action_lower = "".join(action.split()).lower() # 移除空格并转小写
            if action_lower in ["开", "打开灯", "点亮", "开启"]:
                action = "打开"
            elif action_lower in ["关", "关灯", "熄灭", "关掉", "关闭掉"]:
                action = "关闭"
            elif action_lower in ["调到", "变成", "设为", "调整", "调", "设置", "调高", "调低"]:
                action = "modify"
            elif action_lower in ["增加", "添加", "新增", "装个", "安装一个"]:
                action = "添加"
            elif action_lower in ["删除掉", "移除掉", "删除", "移除", "我不要", "删了", "解除绑定"]:
                action = "删除"
            elif action_lower in ["查询", "状态是", "情况"]:
                action = "查询"
            elif action_lower in ["拉上", "拉开"]: # 窗帘动作
                action = action_lower # 保留原样或归一化
            # 可以添加更多规则

        if action in ["打开", "关闭"] and parameter is None: # 如果没有提取到参数，但动作是开关
            parameter = 0.0
            
        if action == "modify" and parameter is None:
            logger.warning(f"动作是 '{action}' 但未提取到参数，文本: '{text}'")

        final_result = {
            "DEVICE_TYPE": device_type,
            "DEVICE_ID": device_id, # 修改 DEVICE_CURR_ID 为 DEVICE_ID
            "LOCATION": location,
            "ACTION": action,
            "PARAMETER": parameter
        }
        logger.info(f"NLU 理解结果 for '{text}': {final_result}")
        return final_result

# --- 主程序/测试部分 ---
if __name__ == '__main__':
    import asyncio
    # 配置日志以便在控制台看到输出
    if not logger.hasHandlers(): # 避免重复添加处理器
        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # !! 重要: 修改这里的 model_path 指向你实际微调好的模型文件夹 !!
    # 假设这个脚本 (BertNLUProcessor.py) 位于 nlu/processors/
    # 并且微调模型位于 nlu/model/fine_tuned_nlu_bert/
    # 因此，相对路径是 '../model/fine_tuned_nlu_bert'
    
    # 获取当前文件 (BertNLUProcessor.py) 所在的目录
    current_file_dir = Path(__file__).resolve().parent # .../nlu/processors
    # 获取 nlu 目录
    nlu_dir = current_file_dir.parent # .../nlu
    # 构建到微调模型的路径
    fine_tuned_model_path = nlu_dir / "model" / "fine_tuned_nlu_bert"


    config_for_testing = {
        "model_path": str(fine_tuned_model_path), # 使用计算出的路径
        "device": "cpu" # 测试时可以强制CPU，避免GPU问题
    }
    
    # 检查模型路径是否存在，如果不存在，则不尝试创建虚拟模型，而是报错退出
    if not fine_tuned_model_path.exists() or not fine_tuned_model_path.is_dir():
        logger.error(f"错误：指定的模型路径 '{fine_tuned_model_path}' 不存在或不是一个目录。")
        logger.error("请确保您已经训练了模型，并将其保存在正确的路径，或者正确配置了 'model_path'。")
        logger.error("测试部分将不会运行。")
        sys.exit(1) # 直接退出，因为没有模型无法测试

    async def main_test():
        try:
            processor = BertNLUProcessor(config_for_testing) # 使用修正后的配置名
            logger.info("BertNLUProcessor 初始化成功，准备测试。")
        except Exception as e:
            logger.error(f"初始化 BertNLUProcessor 失败: {e}", exc_info=True)
            return

        test_cases = [
            "开客厅灯",
            "开一下那个客厅灯",
            "客厅灯开",
            "卧室加湿器1湿度调到50%",
            "把卧室里的加湿器1湿度变成0.5",
            "关闭空调2号",
            "请将书房的灯亮度设为百分之七十",
            "在客厅添加一个叫客厅氛围灯的新灯",
            "删除厨房那个咖啡机",
            "空调温度调低一点",
            "什么也不做",
            ""
        ]

        for text_case in test_cases:
            try:
                result = await processor.understand(text_case)
                print(f"\nInput: '{text_case}'\nOutput: {result}")
            except Exception as e:
                logger.error(f"处理 '{text_case}' 时出错: {e}", exc_info=True)
            print("-" * 40)

    asyncio.run(main_test())