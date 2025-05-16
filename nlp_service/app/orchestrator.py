import os
import json
import yaml
import logging
from typing import Dict, Union, Optional
import sys
from pathlib import Path

# 添加父目录到系统路径，以便导入其他模块
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.stt_interface import STTInterface
from interfaces.nlu_interface import NLUInterface
from interfaces.tts_interface import TTSInterface
from stt.factory import STTFactory
from nlu.factory import NLUFactory
from tts.factory import TTSFactory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
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
        self.config = self._load_config(config_path)
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
            nlu_config = self.config.get('nlu', {'engine': 'placeholder'})
            nlu_factory = NLUFactory()
            return nlu_factory.create_engine(nlu_config)
        except Exception as e:
            logger.error(f"初始化NLU引擎失败: {str(e)}")
            # 如果失败，使用NLUFactory中的默认引擎
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
            NLU处理结果字典
        """
        try:
            return await self.nlu_engine.understand(text)
        except Exception as e:
            logger.error(f"NLU处理失败: {str(e)}")
            return {'action': 'UNKNOWN', 'entity': None}
    
    async def _perform_tts(self, text_to_speak: str) -> Union[str, bytes, None]:
        """
        执行文字转语音
        
        Args:
            text_to_speak: 要转换为语音的文本
            
        Returns:
            TTS音频的URL、Base64编码的字节数据，或None
        """
        try:
            return await self.tts_engine.synthesize(text_to_speak)
        except Exception as e:
            logger.error(f"TTS转换失败: {str(e)}")
            return None
    
    def _generate_response_message(self, nlu_result: Dict) -> str:
        """
        基于NLU结果生成响应消息
        
        Args:
            nlu_result: NLU处理结果
            
        Returns:
            响应消息
        """
        # 根据不同的NLU结果生成不同的响应
        action = nlu_result.get('action', 'UNKNOWN')
        entity = nlu_result.get('entity')
        location = nlu_result.get('location', '')
        
        if action == 'TURN_ON':
            if entity == 'light':
                return f"好的，正在为您打开{location}的灯。"
            elif entity:
                return f"好的，正在为您打开{location}{entity}。"
            else:
                return "好的，正在执行打开操作。"
        elif action == 'TURN_OFF':
            if entity == 'air_conditioner':
                return f"好的，正在为您关闭{location}空调。"
            elif entity:
                return f"好的，正在为您关闭{location}{entity}。"
            else:
                return "好的，正在执行关闭操作。"
        else:
            return "抱歉，我没有理解您的指令。"
    
    async def handle_audio_input(self, audio_data: bytes, settings: Dict) -> Dict:
        """
        处理音频输入，执行STT、NLU和可选的TTS操作
        
        Args:
            audio_data: 音频数据
            settings: 处理设置
            
        Returns:
            处理结果字典
        """
        try:
            # 执行STT
            transcribed_text = await self._perform_stt(audio_data)
            logger.info(f"STT结果: {transcribed_text}")
            
            # 执行NLU
            nlu_result = await self._perform_nlu(transcribed_text)
            logger.info(f"NLU结果: {nlu_result}")
            
            # 生成响应消息
            response_message = self._generate_response_message(nlu_result)
            
            # 根据设置决定是否执行TTS
            tts_enabled = settings.get('tts_enabled', True)
            tts_output_reference = None
            if tts_enabled:
                tts_output_reference = await self._perform_tts(response_message)
                logger.info(f"TTS结果: {tts_output_reference}")
            
            # 返回结果
            return {
                'input_type': 'audio',
                'transcribed_text': transcribed_text,
                'nlu_result': nlu_result,
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
        处理文本输入，执行NLU和可选的TTS操作
        
        Args:
            text_input: 输入文本
            settings: 处理设置
            
        Returns:
            处理结果字典
        """
        try:
            # 执行NLU
            nlu_result = await self._perform_nlu(text_input)
            logger.info(f"NLU结果: {nlu_result}")
            
            # 生成响应消息
            response_message = self._generate_response_message(nlu_result)
            
            # 根据设置决定是否执行TTS
            tts_enabled = settings.get('tts_enabled', True)
            tts_output_reference = None
            if tts_enabled:
                tts_output_reference = await self._perform_tts(response_message)
                logger.info(f"TTS结果: {tts_output_reference}")
            
            # 返回结果
            return {
                'input_type': 'text',
                'transcribed_text': text_input,  # 文本输入时，transcribed_text为原始输入
                'nlu_result': nlu_result,
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