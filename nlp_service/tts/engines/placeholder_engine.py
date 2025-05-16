import logging
import os
import time
from typing import Dict, Union
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.tts_interface import TTSInterface

# 配置日志
logger = logging.getLogger(__name__)

class PlaceholderTTSEngine(TTSInterface):
    """
    TTS的占位实现，用于测试和开发
    """
    
    def __init__(self, config: Dict):
        """
        初始化PlaceholderTTSEngine
        
        Args:
            config: 引擎配置
        """
        self.config = config
        
        # 创建临时音频文件目录
        self.temp_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'temp_audio'
        )
        os.makedirs(self.temp_dir, exist_ok=True)
        
        logger.info(f"PlaceholderTTSEngine 已初始化，临时目录: {self.temp_dir}")
    
    async def synthesize(self, text: str) -> Union[str, bytes, None]:
        """
        将文本转换为语音
        
        Args:
            text: 要转换为语音的文本
            
        Returns:
            模拟的临时音频文件路径
        """
        logger.info(f"PlaceholderTTSEngine.synthesize 被调用，文本: '{text}'")
        
        # 在实际实现中，这里应该调用实际的TTS引擎生成音频
        # 这里模拟生成一个临时文件路径
        timestamp = int(time.time())
        file_path = os.path.join(self.temp_dir, f"tts_response_{timestamp}.wav")
        
        # 创建一个空文件，模拟TTS输出
        with open(file_path, 'wb') as f:
            f.write(b'TTS_PLACEHOLDER')
        
        logger.info(f"生成的临时音频文件: {file_path}")
        
        # 返回相对于项目根目录的路径
        relative_path = os.path.relpath(
            file_path, 
            os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        
        return relative_path 