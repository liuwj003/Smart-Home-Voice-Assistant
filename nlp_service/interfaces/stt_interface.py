from abc import ABC, abstractmethod
from typing import Dict, Any, List

class STTInterface(ABC):
    """
    语音转文字(Speech to Text)服务的接口定义
    """
    
    def __init__(self, config: dict = None):
        """
        初始化STT引擎
        
        Args:
            config (dict, optional): 配置字典，默认为None
        """
        self.config = config or {}
    
    @abstractmethod
    async def transcribe(self, audio_data: bytes) -> str:
        """
        将音频数据转换为文本
        
        Args:
            audio_data: 音频数据的字节流
            
        Returns:
            转换后的文本
        """
        pass
    
    @abstractmethod
    def get_supported_formats(self) -> list:
        """
        获取此STT引擎支持的音频格式列表
        
        Returns:
            支持的格式列表，例如['wav', 'mp3', 'ogg']
        """
        pass
    
    @abstractmethod
    def get_supported_languages(self) -> List[str]:
        """
        获取此STT引擎支持的语言列表
        
        Returns:
            支持的语言列表，例如['en', 'zh', 'ja']
        """
        pass
    
    @abstractmethod
    def available(self) -> bool:
        """
        检查STT引擎是否可用
        
        Returns:
            True如果引擎可用，否则False
        """
        pass


class STTError(Exception):
    """
    STT引擎错误
    
    Attributes:
        message (str): 错误说明
    """
    pass 