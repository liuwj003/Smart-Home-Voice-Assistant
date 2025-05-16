import logging
from typing import Dict
import os
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.stt_interface import STTInterface

# 配置日志
logger = logging.getLogger(__name__)

class PlaceholderSTTEngine(STTInterface):
    """
    STT的占位实现，用于测试和开发
    """
    
    def __init__(self, config: Dict):
        """
        初始化PlaceholderSTTEngine
        
        Args:
            config: 引擎配置
        """
        super().__init__(config)
        logger.info("PlaceholderSTTEngine 已初始化")
    
    async def transcribe(self, audio_data: bytes) -> str:
        """
        将音频数据转换为文本
        
        Args:
            audio_data: 音频数据的字节流
            
        Returns:
            转换后的文本，由于这是一个占位实现，所以返回一个固定的文本
        """
        logger.info(f"PlaceholderSTTEngine.transcribe 被调用，音频大小: {len(audio_data)} 字节")
        
        # 在实际实现中，这里应该调用实际的STT引擎
        # 这里简单返回一个固定文本
        return "打开客厅的灯"
    
    def get_supported_formats(self) -> list:
        """
        获取此STT引擎支持的音频格式列表
        
        Returns:
            支持的格式列表，例如['wav', 'mp3', 'ogg']
        """
        return ['wav']
    
    def get_supported_languages(self) -> list:
        """
        获取此STT引擎支持的语言列表
        
        Returns:
            支持的语言列表
        """
        return ['zh', 'en']
    
    def available(self) -> bool:
        """
        检查STT引擎是否可用
        
        Returns:
            始终返回True
        """
        return True 