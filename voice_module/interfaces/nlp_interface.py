from abc import ABC, abstractmethod
from typing import Dict, Any

class NaturalLanguageProcessor(ABC):
    """
    Abstract base class for Natural Language Processing engines.
    """
    def __init__(self, config: dict = None):
        """
        Initialize the NaturalLanguageProcessor engine with optional configuration.
        """
        self.config = config or {}

    @abstractmethod
    def process(self, text: str) -> Dict[str, Any]:
        """
        Process the given text.
        """
        pass    

    @abstractmethod
    def available(self) -> bool:
        """
        Check if the NLP engine is available.
        """
        pass
    
    
    
        
