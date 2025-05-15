from abc import ABC, abstractmethod
from typing import Dict, Any, List

class SpeechToText(ABC):
    """
    Abstract base class for Speech-To-Text engines.
    """
    def __init__(self, config: dict = None):
        """
        Initialize the SpeechToText engine with optional configuration.

        Args:
            config (dict, optional): Configuration dictionary. Defaults to None.
        """
        self.config = config or {}

    @abstractmethod
    def transcribe(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Transcribe audio data to text.

        Args:
            audio_data (bytes): Audio data to transcribe.

        Returns:
            Dict[str, Any]: Dictionary containing transcription results.

        Raises:
            STTError: If the transcription fails.
        """
        pass

    @abstractmethod
    def get_supported_languages(self) -> List[str]:
        """Get the supported languages for the STT engine.

        Returns:
            List[str]: List of supported languages.
        """
        pass

    @abstractmethod
    def available(self) -> bool:
        """Check if the STT engine is available.

        Returns:
            bool: True if the engine is available, False otherwise.
        """
        pass


class STTError(Exception):
    """Exception raised for errors in the STT engine.

    Attributes:
        message (str): Explanation of the error.
    """
    pass

