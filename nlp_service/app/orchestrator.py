import os
import json
import yaml
import logging
from typing import Dict, Union, Optional
import sys
from pathlib import Path
import base64

# 添加父目录到系统路径，以便导入其他模块
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.stt_interface import STTInterface
from interfaces.nlu_interface import NLUInterface
from interfaces.tts_interface import TTSInterface
from stt.factory import STTFactory
from nlu.factory import NLUFactory
from tts.factory import TTSFactory

logger = logging.getLogger(__name__)

class NLPServiceOrchestrator:
    """
    核心编排器类：负责协调STT、NLU和TTS服务的工作流。
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        初始化NLPServiceOrchestrator，加载配置并初始化各个引擎。
        
        Args:
            config_path: 配置文件的路径，如果为None则使用默认路径
        """
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.config = self._load_config(config_path)
        self._fix_config_paths()
        logger.info("配置加载完成")
        
        # 初始化STT、NLU和TTS引擎
        self.stt_engine = self._init_stt_engine()
        self.nlu_engine = self._init_nlu_engine()
        self.tts_engine = self._init_tts_engine()
        
        logger.info("所有引擎初始化完成")
    
    def _load_config(self, config_path: Optional[str] = None) -> Dict:
        """
        从YAML配置文件加载配置
        
        Args:
            config_path: 配置文件路径，如果为None则使用默认路径
            
        Returns:
            配置字典
        """
        if config_path is None:
            # 默认配置路径
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'config', 
                'config.yaml'
            )
        
        try:
            with open(config_path, 'r', encoding='utf-8') as file:
                return yaml.safe_load(file)
        except Exception as e:
            logger.error(f"加载配置失败: {str(e)}")
            # 返回默认配置
            return {
                'stt': {'engine': 'placeholder'},
                'nlu': {'engine': 'placeholder'},
                'tts': {'engine': 'placeholder'}
            }
    
    def _fix_config_paths(self):
        """把所有涉及路径的配置项都转为绝对路径"""
        def to_abs(path):
            if path and not os.path.isabs(path):
                return os.path.abspath(os.path.join(self.project_root, path))
            return path

        # NLU主模型
        if 'nlu' in self.config and 'local_model_target_dir' in self.config['nlu']:
            self.config['nlu']['local_model_target_dir'] = to_abs(self.config['nlu']['local_model_target_dir'])
        # BertNLUProcessor
        if 'bert_nlu_config' in self.config and 'local_model_target_dir' in self.config['bert_nlu_config']:
            self.config['bert_nlu_config']['local_model_target_dir'] = to_abs(self.config['bert_nlu_config']['local_model_target_dir'])
        # RAG知识库
        if 'rag_data_jsonl_path' in self.config:
            self.config['rag_data_jsonl_path'] = to_abs(self.config['rag_data_jsonl_path'])
        # RAG embedding
        if 'rag_embedding_config' in self.config and 'local_embedding_target_dir' in self.config['rag_embedding_config']:
            self.config['rag_embedding_config']['local_embedding_target_dir'] = to_abs(self.config['rag_embedding_config']['local_embedding_target_dir'])
    
    def _init_stt_engine(self) -> STTInterface:
        """
        初始化STT引擎
        
        Returns:
            STT引擎实例
        """
        try:
            stt_config = self.config.get('stt', {'engine': 'placeholder'})
            stt_factory = STTFactory()
            return stt_factory.create_engine(stt_config)
        except Exception as e:
            logger.error(f"初始化STT引擎失败: {str(e)}")
            # 如果失败，使用STTFactory中的默认引擎
            return STTFactory().create_engine({'engine': 'placeholder'})
    
    def _init_nlu_engine(self) -> NLUInterface:
        """
        初始化NLU引擎
        
        Returns:
            NLU引擎实例
        """
        try:
            nlu_config = self.config.get('nlu', {'engine': 'placeholder'}).copy()
            # 合并顶层配置
            if nlu_config.get('engine') == 'nlu_orchestrator':
                nlu_config['bert_nlu_config'] = self.config.get('bert_nlu_config', {})
                nlu_config['rag_data_jsonl_path'] = self.config.get('rag_data_jsonl_path')
                nlu_config['rag_embedding_config'] = self.config.get('rag_embedding_config', {})
                nlu_config['rag_similarity_threshold'] = self.config.get('rag_similarity_threshold', 250)
            nlu_factory = NLUFactory()
            return nlu_factory.create_engine(nlu_config)
        except Exception as e:
            logger.error(f"初始化NLU引擎失败: {str(e)}")
            return NLUFactory().create_engine({'engine': 'placeholder'})
    
    def _init_tts_engine(self) -> TTSInterface:
        """
        初始化TTS引擎
        
        Returns:
            TTS引擎实例
        """
        try:
            tts_config = self.config.get('tts', {'engine': 'placeholder'})
            tts_factory = TTSFactory()
            return tts_factory.create_engine(tts_config)
        except Exception as e:
            logger.error(f"初始化TTS引擎失败: {str(e)}")
            # 如果失败，使用TTSFactory中的默认引擎
            return TTSFactory().create_engine({'engine': 'placeholder'})
    
    async def _perform_stt(self, audio_data: bytes) -> str:
        """
        执行语音转文字
        
        Args:
            audio_data: 音频数据
            
        Returns:
            识别出的文本
        """
        try:
            return await self.stt_engine.transcribe(audio_data)
        except Exception as e:
            logger.error(f"STT转换失败: {str(e)}")
            return ""
    
    async def _perform_nlu(self, text: str) -> Dict:
        """
        执行自然语言理解
        
        Args:
            text: 输入文本
            
        Returns:
            NLU处理结果字典，包含五元组和响应消息
        """
        try:
            nlu_result = await self.nlu_engine.understand(text)
            
            # 确保结果中包含五元组字段
            for field in ["ACTION", "DEVICE_TYPE", "DEVICE_ID", "LOCATION", "PARAMETER"]:
                if field not in nlu_result:
                    nlu_result[field] = None if field != "DEVICE_ID" else "0"
            
            # 生成响应消息并添加到结果中
            response_message = self._generate_response_message(nlu_result)
            nlu_result["response_message_for_tts"] = response_message
            
            return nlu_result
        except Exception as e:
            logger.error(f"NLU处理失败: {str(e)}")
            return {
                'ACTION': 'UNKNOWN', 
                'DEVICE_TYPE': None,
                'DEVICE_ID': "0",
                'LOCATION': None,
                'PARAMETER': None,
                'response_message_for_tts': '对不起，我无法理解您的请求'
            }
    
    def _convert_file_to_base64(self, file_path: str) -> Optional[str]:
        """
        将音频文件转换为base64编码
        
        Args:
            file_path: 音频文件路径
            
        Returns:
            base64编码的字符串，格式为 "base64://DATA"
            如果转换失败则返回None
        """
        try:
            # 尝试多种路径拼接方式，确保能找到文件
            possible_paths = [
                # 1. 使用原始路径（可能是绝对路径）
                file_path,
                # 2. 相对于project_root
                os.path.join(self.project_root, file_path),
                # 3. 相对于nlp_service目录（可能是TTS引擎返回的）
                os.path.join(self.project_root, "nlp_service", file_path)
            ]
            
            # 找到第一个存在的文件路径
            abs_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    abs_path = path
                    logger.info(f"找到音频文件路径: {abs_path}")
                    break
                else:
                    logger.debug(f"尝试路径不存在: {path}")
            
            # 如果没有找到有效路径
            if not abs_path:
                logger.error(f"所有尝试路径均不存在: {possible_paths}")
                return None
                
            # 读取文件内容并转换为base64
            with open(abs_path, "rb") as f:
                audio_bytes = f.read()
                base64_data = base64.b64encode(audio_bytes).decode("utf-8")
                return f"base64://{base64_data}"
                
        except Exception as e:
            logger.error(f"转换音频文件到base64失败: {str(e)}")
            return None
    
    async def _perform_tts(self, text_to_speak: str) -> Union[str, bytes, None]:
        """
        执行文字转语音
        
        Args:
            text_to_speak: 要转换为语音的文本
            
        Returns:
            TTS音频的URL、Base64编码的字节数据，或None
        """
        try:
            result = await self.tts_engine.synthesize(text_to_speak)
            
            # 检查结果类型
            if isinstance(result, str):
                # 如果是路径，则转换为base64
                if os.path.exists(os.path.join(self.project_root, result)) or os.path.exists(result):
                    logger.info(f"将音频文件路径转换为base64: {result}")
                    return self._convert_file_to_base64(result)
                # 如果已经是URL或base64格式，直接返回
                elif result.startswith(('http://', 'https://', 'base64://')):
                    return result
                    
            # 返回原始结果
            return result
        except Exception as e:
            logger.error(f"TTS转换失败: {str(e)}")
            return None
    
    def _generate_response_message(self, nlu_result: Dict) -> str:
        """
        基于NLU五元组结果生成响应消息
        """
        # 英文动作到中文的映射（参考 fine_tuned_bert_processor）
        action_map = {
            "turn_on": "打开",
            "turn_off": "关闭",
            "modify": "调整",
            "add": "添加",
            "delete": "删除",
            "query": "查询",
            "open_curtain": "拉开",
            "close_curtain": "拉上",
            # 可继续补充...
        }
        action = nlu_result.get("ACTION")
        device_type = nlu_result.get("DEVICE_TYPE")
        device_id = nlu_result.get("DEVICE_ID")
        location = nlu_result.get("LOCATION")
        parameter = nlu_result.get("PARAMETER")
        
        # 检查是否是理解失败的情况
        if (not action or 
            action in ["UNKNOWN", "not_understand", None, ""] or 
            not device_type or 
            device_type in [None, ""]):
            return "抱歉，我没能理解您的意思"
            
        action_cn = action_map.get(action, action) if action else None
        parts = ["好的，正在"]
        if action_cn: parts.append(str(action_cn))
        if location: parts.append(str(location))
        if device_type: parts.append(str(device_type))
        if device_id and device_id not in ("0", 0, None, ""): parts.append(f"{device_id}号")
        # if parameter not in (None, ""): parts.append(f"{parameter}")
        return "".join(parts)
    
    async def handle_audio_input(self, audio_data: bytes, settings: Dict) -> Dict:
        """
        处理音频输入，执行STT、NLU和可选的TTS操作，支持根据settings动态切换引擎。
        """
        try:
            # 动态切换STT引擎
            if 'stt_engine' in settings:
                stt_config = self.config.get('stt', {}).copy()
                stt_config['engine'] = settings['stt_engine']
                self.stt_engine = STTFactory().create_engine(stt_config)
            # 动态切换NLU引擎
            if 'nlu_engine' in settings:
                nlu_config = self.config.get('nlu', {}).copy()
                nlu_config['engine'] = settings['nlu_engine']
                if nlu_config['engine'] == 'nlu_orchestrator':
                    nlu_config['bert_nlu_config'] = self.config.get('bert_nlu_config', {})
                    nlu_config['rag_data_jsonl_path'] = self.config.get('rag_data_jsonl_path')
                    nlu_config['rag_embedding_config'] = self.config.get('rag_embedding_config', {})
                    nlu_config['rag_similarity_threshold'] = self.config.get('rag_similarity_threshold', 250)
                self.nlu_engine = NLUFactory().create_engine(nlu_config)
            # 动态切换TTS引擎
            if 'tts_engine' in settings:
                tts_config = self.config.get('tts', {}).copy()
                tts_config['engine'] = settings['tts_engine']
                self.tts_engine = TTSFactory().create_engine(tts_config)
            
            # 获取TTS启用状态，默认启用
            tts_enabled = settings.get('tts_enabled', True)
            logger.info(f"TTS启用状态: {tts_enabled}")
            
            # 执行STT
            transcribed_text = await self._perform_stt(audio_data)
            logger.info(f"STT结果: {transcribed_text}")
            
            # 执行NLU（现在会返回带有response_message_for_tts的结果）
            nlu_result = await self._perform_nlu(transcribed_text)
            logger.info(f"NLU结果: {nlu_result}")
            
            # 使用NLU结果中的响应消息进行TTS，仅当tts_enabled为True时执行
            response_message = nlu_result.get("response_message_for_tts", "")
            tts_output_reference = None
            if tts_enabled:
                logger.info("TTS已启用，正在生成语音")
                tts_output_reference = await self._perform_tts(response_message)
            else:
                logger.info("TTS已禁用，跳过语音生成")
            
            # 准备前端需要的五元组格式
            five_tuple = {
                "action": nlu_result.get("ACTION"),
                "entity": nlu_result.get("DEVICE_TYPE"),
                "device_id": nlu_result.get("DEVICE_ID", "0"),
                "location": nlu_result.get("LOCATION"),
                "parameter": nlu_result.get("PARAMETER")
            }
            
            # 返回包含五元组的结果
            return {
                'input_type': 'audio',
                'transcribed_text': transcribed_text,
                'nlu_result': five_tuple,  # 五元组格式化
                'response_message_for_tts': response_message,
                'tts_output_reference': tts_output_reference,
                'status': 'success',
                'error_message': None
            }
        except Exception as e:
            logger.error(f"处理音频输入失败: {str(e)}")
            return {
                'input_type': 'audio',
                'transcribed_text': None,
                'nlu_result': None,
                'response_message_for_tts': None,
                'tts_output_reference': None,
                'status': 'error',
                'error_message': str(e)
            }
    
    async def handle_text_input(self, text_input: str, settings: Dict) -> Dict:
        """
        处理文本输入，执行NLU和可选的TTS操作，支持根据settings动态切换引擎。
        """
        try:
            if 'nlu_engine' in settings:
                nlu_config = self.config.get('nlu', {}).copy()
                nlu_config['engine'] = settings['nlu_engine']
                if nlu_config['engine'] == 'nlu_orchestrator':
                    nlu_config['bert_nlu_config'] = self.config.get('bert_nlu_config', {})
                    nlu_config['rag_data_jsonl_path'] = self.config.get('rag_data_jsonl_path')
                    nlu_config['rag_embedding_config'] = self.config.get('rag_embedding_config', {})
                    nlu_config['rag_similarity_threshold'] = self.config.get('rag_similarity_threshold', 250)
                self.nlu_engine = NLUFactory().create_engine(nlu_config)
                
            if 'tts_engine' in settings:
                tts_config = self.config.get('tts', {}).copy()
                tts_config['engine'] = settings['tts_engine']
                self.tts_engine = TTSFactory().create_engine(tts_config)
            
            # 获取TTS启用状态，默认启用
            tts_enabled = settings.get('tts_enabled', True)
            logger.info(f"TTS启用状态: {tts_enabled}")
            
            # 执行NLU（现在会返回带有response_message_for_tts的结果）
            nlu_result = await self._perform_nlu(text_input)
            logger.info(f"NLU结果: {nlu_result}")
            
            # 使用NLU结果中的响应消息进行TTS，仅当tts_enabled为True时执行
            response_message = nlu_result.get("response_message_for_tts", "")
            tts_output_reference = None
            if tts_enabled:
                logger.info("TTS已启用，正在生成语音")
                tts_output_reference = await self._perform_tts(response_message)
            else:
                logger.info("TTS已禁用，跳过语音生成")
            
            # 准备前端需要的五元组格式
            five_tuple = {
                "action": nlu_result.get("ACTION"),
                "entity": nlu_result.get("DEVICE_TYPE"),
                "device_id": nlu_result.get("DEVICE_ID", "0"),
                "location": nlu_result.get("LOCATION"),
                "parameter": nlu_result.get("PARAMETER")
            }
            
            return {
                'input_type': 'text',
                'transcribed_text': text_input,
                'nlu_result': five_tuple,  # 五元组格式化
                'response_message_for_tts': response_message,
                'tts_output_reference': tts_output_reference,
                'status': 'success',
                'error_message': None
            }
        except Exception as e:
            logger.error(f"处理文本输入失败: {str(e)}")
            return {
                'input_type': 'text',
                'transcribed_text': text_input,
                'nlu_result': None,
                'response_message_for_tts': None,
                'tts_output_reference': None,
                'status': 'error',
                'error_message': str(e)
            } 