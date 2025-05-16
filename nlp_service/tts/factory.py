import logging
from typing import Dict
import importlib
import os
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.tts_interface import TTSInterface

# 配置日志
logger = logging.getLogger(__name__)

class TTSFactory:
    """
    TTS引擎工厂类，用于创建TTS引擎实例
    """
    
    def __init__(self):
        # 注册可用的TTS引擎
        self.engines = {
            "placeholder": "tts.engines.placeholder_engine.PlaceholderTTSEngine"
            # 可以在这里添加其他TTS引擎
        }
    
    def create_engine(self, config: Dict) -> TTSInterface:
        """
        根据配置创建TTS引擎实例
        
        Args:
            config: 包含引擎配置的字典，必须包含'engine'键指定引擎类型
            
        Returns:
            TTS引擎实例
            
        Raises:
            ValueError: 如果指定的引擎类型不存在
        """
        engine_type = config.get('engine', 'placeholder')
        
        if engine_type not in self.engines:
            logger.warning(f"未知的TTS引擎类型 '{engine_type}'，使用placeholder引擎")
            engine_type = 'placeholder'
        
        engine_class_path = self.engines[engine_type]
        
        try:
            # 动态导入引擎类
            module_path, class_name = engine_class_path.rsplit('.', 1)
            module = importlib.import_module(module_path)
            engine_class = getattr(module, class_name)
            
            # 创建引擎实例
            return engine_class(config)
        except (ImportError, AttributeError) as e:
            logger.error(f"加载TTS引擎 '{engine_type}' 失败: {str(e)}")
            # 如果加载失败，尝试加载placeholder引擎
            if engine_type != 'placeholder':
                logger.info("尝试加载placeholder引擎")
                return self.create_engine({'engine': 'placeholder'})
            else:
                raise ValueError(f"无法创建任何TTS引擎: {str(e)}") 