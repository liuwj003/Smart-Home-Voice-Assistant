from abc import ABC, abstractmethod
from typing import Union

class TTSInterface(ABC):
    """
    文字转语音(Text to Speech)服务的接口定义
    """
    
    @abstractmethod
    async def synthesize(self, text: str) -> Union[str, bytes, None]:
        """
        将文本转换为语音
        
        Args:
            text: 要转换为语音的文本
            
        Returns:
            可以是以下之一：
            - 生成的音频文件的路径或URL
            - 音频数据的字节流（可能是Base64编码的）
            - None（如果转换失败）
        """
        pass 