import logging
import os
import sys
import json
import re
import torch
from pathlib import Path
from typing import Dict, Optional, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import tempfile

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.nlu_interface import NLUInterface

logger = logging.getLogger(__name__)

class DeepSeekNLUProcessor(NLUInterface):
    """
    使用DeepSeek模型进行自然语言理解
    """
    
    def __init__(self, config: Dict):
        """
        初始化DeepSeekNLUProcessor
        
        Args:
            config: 处理器配置，应包含:
                api_key (str): DeepSeek API密钥
                base_url (str, optional): DeepSeek API基础URL，默认为 "https://api.deepseek.com"
                temperature (float, optional): 生成参数，控制随机性，默认为0.7
                model (str, optional): 使用的模型名称，默认为'deepseek-chat'
                model_path (str, optional): 用于BIO标记的本地模型路径
        """
        self.config = config
        logger.info("初始化DeepSeekNLUProcessor...")
        
        # 初始化DeepSeek模型
        self.llm = ChatOpenAI(
            temperature=config.get("temperature", 0.7),
            model=config.get("model", "deepseek-chat"),
            api_key=config.get("api_key", "sk-070151a6fcd14bed867ac165a2fce23a"),  # 默认使用配置中的API密钥
            base_url=config.get("base_url", "https://api.deepseek.com")
        )
        
        # 定义提示模板
        self.prompt_template = """
        你是一个家居智能助手,对于输入的问题
        {question}
        你应该输出JSON格式，元素要求如下：
        {{
        "output":"对于这个问题的智能回答",
        "operation":"具体做了什么操作对什么家具(中文)(如果有多个操作不能省略动词)(制冷制热后面要加模式)"
        }}
        """
        
        self.prompt = ChatPromptTemplate.from_messages([("human", self.prompt_template)])
        
        # 加载BERT模型用于BIO标记
        try:
            # 获取模型路径
            model_path = config.get("model_path", "nlp_service/nlu/model/fine_tuned_nlu_bert")
            if not os.path.exists(model_path):
                model_path = config.get("local_model_target_dir", "nlp_service/nlu/model/fine_tuned_nlu_bert")
            
            if os.path.exists(model_path):
                from transformers import AutoModelForTokenClassification, AutoTokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.bert_model = AutoModelForTokenClassification.from_pretrained(model_path)
                self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                self.bert_model.to(self.device)
                logger.info(f"成功加载BIO标记模型: {model_path}")
            else:
                logger.warning(f"无法找到BIO标记模型路径: {model_path}")
                self.tokenizer = None
                self.bert_model = None
        except Exception as e:
            logger.error(f"加载BIO标记模型失败: {e}")
            self.tokenizer = None
            self.bert_model = None
        
        logger.info("DeepSeekNLUProcessor初始化完成")
    
    def _clean_json_response(self, response_str: str) -> Dict:
        """清理模型返回的JSON字符串"""
        # 移除可能的Markdown代码块标记
        response_str = re.sub(r'```json|```', '', response_str).strip()
        
        try:
            return json.loads(response_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析错误: {e}")
            # 返回默认结构
            return {
                "output": "抱歉，我无法理解您的指令",
                "operation": ""
            }
    
    def _classify_action(self, action_text: str) -> int:
        """使用LLM智能分类动作"""
        classification_prompt = f"""
        请将以下家居控制动作分类：
        动作: {action_text}
        
        可选分类:
        0 - 打开/启动/开启类动作
        1 - 关闭/停止类动作
        2 - 调成/设置类动作
        3 - 调高类动作
        4 - 降低类动作
        只需返回单个数字(0,1,2,3,4)，不要包含其他任何内容。
        """
        try:
            response = self.llm.invoke(classification_prompt)
            return int(response.content.strip())
        except:
            return 0  # 默认值
    
    def _bio_tag_operation(self, operation_text: str) -> List[Dict]:
        """使用微调模型对operation进行BIO分词"""
        if not self.tokenizer or not self.bert_model:
            logger.warning("BIO标记模型未加载，无法进行实体识别")
            return []
        
        try:
            inputs = self.tokenizer(operation_text, return_tensors="pt", truncation=True).to(self.device)
            with torch.no_grad():
                outputs = self.bert_model(**inputs)
            predictions = torch.argmax(outputs.logits, dim=2).squeeze().tolist()
            
            tokens = self.tokenizer.convert_ids_to_tokens(inputs["input_ids"].squeeze())
            labels = [self.bert_model.config.id2label[pred] for pred in predictions]
            
            entities = []
            current_entity = None
            for token, label in zip(tokens, labels):
                if label.startswith("B-"):
                    if current_entity:
                        entities.append(current_entity)
                    current_entity = {"text": token.replace("##", ""), "type": label[2:]}
                elif label.startswith("I-"):
                    if current_entity and current_entity["type"] == label[2:]:
                        current_entity["text"] += token.replace("##", "")
                else:
                    if current_entity:
                        entities.append(current_entity)
                        current_entity = None
            
            if current_entity:
                entities.append(current_entity)
            return entities
        except Exception as e:
            logger.error(f"BIO标记处理失败: {e}")
            return []
    
    def _extract_entities_from_operation(self, operation_text: str) -> Dict[str, Any]:
        """从操作文本中提取五元组实体"""
        entities = self._bio_tag_operation(operation_text)
        
        # 初始化结果
        result = {
            "ACTION": None,
            "DEVICE_TYPE": None,
            "DEVICE_ID": "0",
            "LOCATION": None,
            "PARAMETER": None
        }
        
        # 从实体中提取各字段
        for entity in entities:
            entity_type = entity["type"]
            entity_text = entity["text"]
            
            if entity_type == "ACTION":
                # 将中文动作分类转换为英文动作
                action_class = self._classify_action(entity_text)
                if action_class == 0:
                    result["ACTION"] = "turn_on"
                elif action_class == 1:
                    result["ACTION"] = "turn_off"
                elif action_class == 2:
                    result["ACTION"] = "modify"
                elif action_class == 3:
                    result["ACTION"] = "modify"  # 调高也是修改
                elif action_class == 4:
                    result["ACTION"] = "modify"  # 调低也是修改
                else:
                    result["ACTION"] = "unknown"
            elif entity_type == "DEVICE_TYPE":
                result["DEVICE_TYPE"] = entity_text
            elif entity_type == "DEVICE_ID":
                result["DEVICE_ID"] = entity_text
            elif entity_type == "LOCATION":
                result["LOCATION"] = entity_text
            elif entity_type == "PARAMETER":
                result["PARAMETER"] = entity_text
        
        return result
    
    async def understand(self, text: str) -> Dict[str, Any]:
        """
        使用DeepSeek理解文本输入并提取意图和实体
        
        Args:
            text: 输入文本
            
        Returns:
            包含理解结果的字典，例如 {'ACTION': 'turn_on', 'DEVICE_TYPE': 'light', 'LOCATION': '客厅'}
        """
        logger.info(f"DeepSeek处理文本: '{text}'")
        
        try:
            # 使用提示模板格式化查询
            formatted_prompt = self.prompt.format(question=text)
            
            # 调用DeepSeek API
            response = self.llm.invoke(formatted_prompt)
            
            # 解析JSON响应
            deepseek_result = self._clean_json_response(response.content)
            
            # 获取操作文本
            operation_text = deepseek_result.get("operation", "")
            
            # 提取五元组实体
            five_tuple_result = self._extract_entities_from_operation(operation_text)
            
            # 如果没有识别出动作和设备类型，尝试使用启发式规则
            if not five_tuple_result["ACTION"] or not five_tuple_result["DEVICE_TYPE"]:
                if "开" in operation_text or "打开" in operation_text or "启动" in operation_text:
                    five_tuple_result["ACTION"] = "turn_on"
                elif "关" in operation_text or "关闭" in operation_text or "停止" in operation_text:
                    five_tuple_result["ACTION"] = "turn_off"
                elif "调" in operation_text or "设置" in operation_text or "改变" in operation_text:
                    five_tuple_result["ACTION"] = "modify"
                
                # 尝试提取设备类型
                device_types = ["灯", "电灯", "空调", "风扇", "窗帘", "电视", "音响", "门锁", "加湿器", "净化器"]
                for device in device_types:
                    if device in operation_text:
                        five_tuple_result["DEVICE_TYPE"] = device
                        break
            
            # 保留原始DeepSeek输出以供参考
            five_tuple_result["deepseek_output"] = deepseek_result.get("output", "")
            five_tuple_result["deepseek_operation"] = operation_text
            
            logger.info(f"DeepSeek处理结果: {five_tuple_result}")
            return five_tuple_result
            
        except Exception as e:
            logger.error(f"DeepSeek处理失败: {e}")
            return {
                "ACTION": None,
                "DEVICE_TYPE": None,
                "DEVICE_ID": "0",
                "LOCATION": None,
                "PARAMETER": None,
                "error": str(e)
            }

# 用于测试的入口点
if __name__ == "__main__":
    # 设置日志
    logging.basicConfig(level=logging.INFO)
    
    # 测试代码
    import asyncio
    
    async def test():
        processor = DeepSeekNLUProcessor({})
        result = await processor.understand("打开卧室的灯")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    asyncio.run(test())
