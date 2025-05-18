import logging
from typing import Dict
import importlib
import os
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent))

from interfaces.nlu_interface import NLUInterface

# 配置日志
logger = logging.getLogger(__name__)

class NLUFactory:
    """
    NLU引擎工厂类，用于创建NLU引擎实例
    """
    
    def __init__(self):
        # 注册可用的NLU引擎
        self.engines = {
            "placeholder": "nlu.processors.placeholder_processor.PlaceholderNLUProcessor",
            "fine_tuned_bert": "nlu.processors.fine_tuned_bert_processor.BertNLUProcessor",
            "nlu_orchestrator": "nlu.processors.nlu_orchestrator.SmartHomeNLUOrchestrator"
            # 可以在这里添加其他NLU引擎
        }
    
    def create_engine(self, config: Dict) -> NLUInterface:
        """
        根据配置创建NLU引擎实例
        
        Args:
            config: 包含引擎配置的字典，必须包含'engine'键指定引擎类型
            
        Returns:
            NLU引擎实例
            
        Raises:
            ValueError: 如果指定的引擎类型不存在
        """
        engine_type = config.get('engine', 'placeholder')
        
        if engine_type not in self.engines:
            logger.warning(f"未知的NLU引擎类型 '{engine_type}'，使用placeholder引擎")
            engine_type = 'placeholder'
        
        engine_class_path = self.engines[engine_type]
        
        try:
            # 动态导入引擎类
            module_path, class_name = engine_class_path.rsplit('.', 1)
            module = importlib.import_module(module_path)
            engine_class = getattr(module, class_name)
            
            # 针对 nlu_orchestrator 做参数解包
            if engine_type == "nlu_orchestrator":
                return engine_class(
                    bert_nlu_config=config.get('bert_nlu_config', {}),
                    rag_data_jsonl_path=config.get('rag_data_jsonl_path'),
                    rag_embedding_config=config.get('rag_embedding_config', {}),
                    rag_similarity_threshold=config.get('rag_similarity_threshold', 250)
                )
            else:
                # 其他引擎保持原样
                return engine_class(config)
        except (ImportError, AttributeError) as e:
            logger.error(f"加载NLU引擎 '{engine_type}' 失败: {str(e)}")
            # 如果加载失败，尝试加载placeholder引擎
            if engine_type != 'placeholder':
                logger.info("尝试加载placeholder引擎")
                return self.create_engine({'engine': 'placeholder'})
            else:
                raise ValueError(f"无法创建任何NLU引擎: {str(e)}") 