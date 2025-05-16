import logging
from typing import Dict
import os
import sys
from pathlib import Path

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.nlu_interface import NLUInterface

# 配置日志
logger = logging.getLogger(__name__)

class PlaceholderNLUProcessor(NLUInterface):
    """
    NLU的占位实现，用于测试和开发
    """
    
    def __init__(self, config: Dict):
        """
        初始化PlaceholderNLUProcessor
        
        Args:
            config: 处理器配置
        """
        self.config = config
        logger.info("PlaceholderNLUProcessor 已初始化")
    
    async def understand(self, text: str) -> Dict:
        """
        理解文本输入并提取意图、实体等信息
        
        Args:
            text: 输入文本
            
        Returns:
            包含理解结果的字典
        """
        logger.info(f"PlaceholderNLUProcessor.understand 被调用，输入文本: '{text}'")
        
        # 简单的规则匹配逻辑
        text_lower = text.lower()
        
        if '开' in text_lower and '灯' in text_lower:
            location = '客厅' if '客厅' in text_lower else ''
            return {'action': 'TURN_ON', 'entity': 'light', 'location': location}
        
        elif '关' in text_lower and '空调' in text_lower:
            location = '客厅' if '客厅' in text_lower else ''
            return {'action': 'TURN_OFF', 'entity': 'air_conditioner', 'location': location}
        
        else:
            # 默认情况
            return {'action': 'UNKNOWN', 'entity': None} 