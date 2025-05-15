from abc import ABC, abstractmethod
from typing import Dict, Any

class TextToSpeech(ABC):
    """
    Abstract base class for Text-To-Speech engines.
    """ 
    def __init__(self, config: dict = None):
        """
        Initialize the TextToSpeech engine with optional configuration.

        Args:
            config (dict, optional): Configuration dictionary. Defaults to None.
        """
        self.config = config or {}  

    @abstractmethod
    def speak(self, text: str) -> bytes:
        """
        Return the audio data for the given text.

        Args:
            text (str): The text to speak.

        Returns:
            bytes: The audio data.
        """
        pass    

    @abstractmethod
    def available(self) -> bool:
        """
        Check if the TTS engine is available.

        Returns:
            bool: True if the engine is available, False otherwise.
        """
        pass
    
    @abstractmethod
    def get_language(self) -> str:
        """
        Get the language of the TTS engine.
        """
        pass
    
        
