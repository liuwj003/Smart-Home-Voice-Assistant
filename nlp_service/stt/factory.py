import logging
from typing import Dict
import importlib
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.stt_interface import STTInterface

# 配置日志
logger = logging.getLogger(__name__)

class STTFactory:
    """
    STT引擎工厂类，用于创建STT引擎实例
    """
    
    def __init__(self):
        # 注册可用的STT引擎
        self.engines = {
            "placeholder": "stt.engines.placeholder_engine.PlaceholderSTTEngine",
            "whisper": "stt.engines.whisper_engine.WhisperSTTEngine",
            "dolphin": "stt.engines.dolphin_engine.DolphinSTTEngine",
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
            ValueError: 如果无法创建任何STT引擎
        """
        # 获取引擎类型，默认使用placeholder
        engine_type = config.get('engine', 'placeholder')
        
        # 检查引擎类型是否存在
        if engine_type not in self.engines:
            logger.warning(f"未知的STT引擎类型 '{engine_type}'，使用placeholder引擎")
            engine_type = 'placeholder'
        
        engine_class_path = self.engines[engine_type]
        
        try:
            # 动态导入引擎类
            module_path, class_name = engine_class_path.rsplit('.', 1)
            module = importlib.import_module(module_path)
            engine_class = getattr(module, class_name)
            
            # 创建引擎实例
            engine = engine_class(config)
            
            # 检查引擎是否可用
            if not engine.available():
                logger.warning(f"STT引擎 '{engine_type}' 不可用，使用placeholder引擎")
                if engine_type != 'placeholder':
                    return self.create_engine({'engine': 'placeholder'})
                else:
                    raise ValueError(f"STT引擎 'placeholder' 不可用")
            
            return engine
        except Exception as e:
            logger.error(f"创建STT引擎 '{engine_type}' 失败: {str(e)}")
            if engine_type != 'placeholder':
                logger.info("尝试使用placeholder引擎")
                return self.create_engine({'engine': 'placeholder'})
            else:
                raise ValueError(f"无法创建任何STT引擎: {str(e)}") 