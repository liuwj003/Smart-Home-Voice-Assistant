from abc import ABC, abstractmethod
from typing import Dict

class NLUInterface(ABC):
    """
    自然语言理解(Natural Language Understanding)服务的接口定义
    """
    
    @abstractmethod
    async def understand(self, text: str) -> Dict:
        """
        理解文本输入并提取意图、实体等信息
        
        Args:
            text: 输入文本
            
        Returns:
            包含理解结果的字典，例如 {'action': 'TURN_ON', 'entity': 'light', 'location': '客厅'}
        """
        pass 