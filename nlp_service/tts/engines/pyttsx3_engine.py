import logging
import os
import time
from typing import Dict, Union
import sys
from pathlib import Path
import pyttsx3
import asyncio

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.tts_interface import TTSInterface

# 配置日志
logger = logging.getLogger(__name__)

class Pyttsx3TTSEngine(TTSInterface):
    """
    基于pyttsx3的TTS引擎实现
    """
    
    def __init__(self, config: Dict):
        """
        初始化Pyttsx3TTSEngine
        
        Args:
            config: 引擎配置
        """
        self.config = config
        
        # 初始化pyttsx3引擎
        self.engine = pyttsx3.init()
        
        # 设置语音属性
        if 'voice' in config:
            voices = self.engine.getProperty('voices')
            # 根据配置选择男声或女声
            voice_index = 0  # 默认女声
            if config.get('voice') == 'male' and len(voices) > 1:
                voice_index = 1
            self.engine.setProperty('voice', voices[voice_index].id)
        
        # 设置语速
        if 'speed' in config:
            # pyttsx3的rate是words per minute, 默认是200
            default_rate = 200
            rate = int(default_rate * config.get('speed', 1.0))
            self.engine.setProperty('rate', rate)
            
        # 设置音量
        if 'volume' in config:
            self.engine.setProperty('volume', config.get('volume', 1.0))
        
        # 创建临时音频文件目录
        self.temp_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'temp_audio'
        )
        os.makedirs(self.temp_dir, exist_ok=True)
        
        logger.info(f"Pyttsx3TTSEngine 已初始化，临时目录: {self.temp_dir}")
    
    async def synthesize(self, text: str) -> Union[str, bytes, None]:
        """
        将文本转换为语音
        
        Args:
            text: 要转换为语音的文本
            
        Returns:
            生成的音频文件路径
        """
        logger.info(f"Pyttsx3TTSEngine.synthesize 被调用，文本: '{text}'")
        
        # 创建一个唯一的文件名
        timestamp = int(time.time())
        file_path = os.path.join(self.temp_dir, f"tts_response_{timestamp}.wav")
        
        # 异步运行pyttsx3的语音合成
        def _synthesize():
            self.engine.save_to_file(text, file_path)
            self.engine.runAndWait()
        
        # 在线程池中运行pyttsx3，因为它会阻塞主线程
        await asyncio.to_thread(_synthesize)
        
        logger.info(f"生成的音频文件: {file_path}")
        
        # 返回相对于项目根目录的路径
        relative_path = os.path.relpath(
            file_path, 
            os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        
        return relative_path 