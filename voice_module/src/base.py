from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union

class SpeechToText(ABC):
    """语音转文本的抽象基类"""
    
    @abstractmethod
    def transcribe(self, audio_input: Any) -> str:
        """
        将语音输入转换为文本
        
        Args:
            audio_input: 语音输入数据，具体类型取决于实现
            
        Returns:
            str: 转换后的文本
        """
        pass

class NLUProcessor(ABC):
    """自然语言理解的抽象基类"""
    
    @abstractmethod
    def process(self, text: str) -> Dict[str, Any]:
        """
        处理文本输入，识别意图和实体
        
        Args:
            text: 输入文本
            
        Returns:
            Dict[str, Any]: 包含意图和实体的结构化数据
        """
        pass

class VoiceCommandProcessor:
    """语音命令处理器，组合STT和NLU功能"""
    
    def __init__(self, stt: SpeechToText, nlu: NLUProcessor):
        """
        初始化语音命令处理器
        
        Args:
            stt: 语音转文本处理器
            nlu: 自然语言理解处理器
        """
        self.stt = stt
        self.nlu = nlu
    
    def process_voice_command(self, audio_input: Any) -> Dict[str, Any]:
        """
        处理语音命令的完整流程
        
        Args:
            audio_input: 语音输入数据
            
        Returns:
            Dict[str, Any]: 包含原始文本、意图和实体的结构化数据
        """
        # 1. 语音转文本
        text = self.stt.transcribe(audio_input)
        
        # 2. 自然语言理解
        result = self.nlu.process(text)
        
        # 3. 添加原始文本到结果中
        result['original_text'] = text
        
        return result 