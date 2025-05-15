from voice_module.interfaces.stt_interface import SpeechToText, STTError
from typing import Dict, Any, List
import dolphin

class DolphinSTT(SpeechToText):
    """
    Speech-To-Text engine using Dolphin models.
    """
    def __init__(self, config: dict = None):
        """
        Initialize the DolphinSTT engine with optional configuration.
        """
        super().__init__(config)
        self.model_size = self.config.get("model_size", "small")
        self.device = self.config.get("device", "cpu")

    def transcribe(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Transcribe the given audio data.

        Args:
            audio_data (bytes): The audio data to transcribe. e.g. "audio.wav"

        Returns:
            Dict[str, Any]: The transcribed text.
        """
        if not self.available():
            raise STTError("Dolphin Engine is not available.")
        
        try:
            waveform = dolphin.load_audio(audio_data)
            if self.model_size == "base":
                model = dolphin.load_model("base", "/data/models/dolphin", "cpu")
            model = dolphin.load_model("small", "/data/models/dolphin", "cpu")
            result = model(waveform)
            return result
        
        except Exception as e:
            raise STTError(f"Error transcribing audio: {e}")
    
    def get_supported_languages(self) -> List[str]:
        """
        Get the supported languages for the DolphinSTT engine.
        """
        return ["en", "zh", "ja", "ru", "ko", "ct", "fa"]
    
    def available(self) -> bool:
        """
        Check if the DolphinSTT engine is available.
        """
        try:
            import dolphin
            return True
        except ImportError:
            print("Dolphin not installed, use: pip install -U dataoceanai-dolphin")
            return False
