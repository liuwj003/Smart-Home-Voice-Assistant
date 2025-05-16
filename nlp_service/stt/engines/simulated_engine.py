import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any, List

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.stt_interface import STTInterface

# 配置日志
logger = logging.getLogger(__name__)

class SimulatedSTTEngine(STTInterface):
    """
    模拟的STT引擎，用于在没有依赖的情况下进行测试
    """
    
    def __init__(self, config: Dict):
        """
        初始化SimulatedSTTEngine
        
        Args:
            config: 引擎配置
        """
        super().__init__(config)
        self.language = self.config.get("language", "zh")
        logger.info(f"SimulatedSTTEngine初始化完成，语言: {self.language}")
    
    async def transcribe(self, audio_data: bytes) -> str:
        """
        将音频数据转换为文本
        
        Args:
            audio_data: 音频数据的字节流
            
        Returns:
            模拟的转录文本
        """
        logger.info(f"SimulatedSTTEngine.transcribe被调用，音频大小: {len(audio_data)} 字节")
        
        # 根据音频数据长度提供不同的模拟结果
        if len(audio_data) < 1000:
            return "打开客厅的灯"
        elif len(audio_data) < 5000:
            return "关闭卧室的空调"
        else:
            return "播放我喜欢的音乐"
    
    def get_supported_formats(self) -> list:
        """
        获取此STT引擎支持的音频格式列表
        
        Returns:
            支持的格式列表
        """
        return ['wav', 'mp3', 'ogg', 'flac', 'webm', 'all']
    
    def get_supported_languages(self) -> List[str]:
        """
        获取支持的语言列表
        
        Returns:
            支持的语言列表
        """
        return ["zh", "en", "ja", "ko", "ru"]
    
    def available(self) -> bool:
        """
        检查引擎是否可用
        
        Returns:
            总是返回True
        """
        return True 