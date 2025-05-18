import logging
from typing import Dict
import importlib
import os
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.stt_interface import STTInterface, STTError
from stt.engines.placeholder_engine import PlaceholderSTTEngine
from stt.engines.whisper_engine import WhisperSTTEngine
from stt.engines.dolphin_engine import DolphinSTTEngine

# 配置日志
logger = logging.getLogger(__name__)

class STTFactory:
    """
    STT引擎工厂类，用于创建STT引擎实例
    """
    
    def __init__(self):
        # 注册可用的STT引擎
        self.engines = {
            "placeholder": PlaceholderSTTEngine,
            "whisper": WhisperSTTEngine,
            "dolphin": DolphinSTTEngine,
            # 可以在这里添加其他STT引擎
        }
    
    def create_engine(self, config: Dict) -> STTInterface:
        """
        根据配置创建STT引擎实例
        
        Args:
            config: 包含引擎配置的字典，必须包含'engine'键指定引擎类型
            
        Returns:
            STT引擎实例
            
        Raises:
            STTError: 如果指定的引擎类型不存在或无法创建
        """
        engine_type = config.get('engine', 'simulated')  # 默认使用模拟引擎
        
        if engine_type not in self.engines:
            logger.warning(f"未知的STT引擎类型 '{engine_type}'，使用simulated引擎")
            engine_type = 'simulated'
        
        try:
            # 获取引擎类
            engine_class = self.engines[engine_type]
            
            # 创建引擎实例
            engine_instance = engine_class(config)
            
            # 检查引擎是否可用
            if not engine_instance.available():
                logger.warning(f"STT引擎 '{engine_type}' 不可用，尝试使用simulated引擎")
                return self.create_engine({'engine': 'simulated'})
            
            return engine_instance
        except Exception as e:
            logger.error(f"创建STT引擎 '{engine_type}' 失败: {str(e)}")
            # 如果创建失败，尝试使用模拟引擎
            if engine_type != 'simulated':
                logger.info("尝试使用simulated引擎")
                return self.create_engine({'engine': 'simulated'})
            else:
                # 如果连模拟引擎都创建失败，使用占位引擎
                logger.info("尝试使用placeholder引擎")
                return PlaceholderSTTEngine({}) 