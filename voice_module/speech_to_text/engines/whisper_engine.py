from voice_module.interfaces.stt_interface import SpeechToText, STTError
from typing import Dict, Any, List
import whisper
import torch

class WhisperSTT(SpeechToText):
    """
    Speech-To-Text engine using Whisper models.
    """
    def __init__(self, config: dict = None):
        """
        Initialize the WhisperSTT engine with optional configuration.
        """
        super().__init__(config)
        self.model_size = self.config.get("model_size", "base")
        self.device_name = self.config.get("device", "cpu")
        self.device = torch.device(self.device_name)

    def transcribe(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Transcribe the given audio data.

        Args:
            audio_data (bytes): The audio data to transcribe. e.g. "audio.wav"

        Returns:
            Dict[str, Any]: The transcribed text.
        """
        if not self.available():
            raise STTError("Whisper Engine is not available.")
        
        try:
            model = whisper.load_model(self.model_size)

            # load audio and pad/trim it to fit 30 seconds
            audio = whisper.load_audio(audio_data)
            audio = whisper.pad_or_trim(audio)

            # make log-Mel spectrogram and move to the same device as the model
            mel = whisper.log_mel_spectrogram(audio).to(self.device)

            # detect the spoken language
            _, probs = model.detect_language(mel)
            print(f"Detected language: {max(probs, key=probs.get)}")

            # decode the audio
            options = whisper.DecodingOptions()
            result = whisper.decode(model, mel, options)
            return result
        
        except Exception as e:
            raise STTError(f"Error transcribing audio: {e}")
    
    def get_supported_languages(self) -> List[str]:
        """
        Get the supported languages for the WhisperSTT engine.
        """
        return ["en", "zh", "ja", "ru", "ko"]
    
    def available(self) -> bool:
        """
        Check if the WhisperSTT engine is available.
        """
        try:
            import whisper
            return True
        except ImportError:
            print("Whisper not installed, use: pip install -U openai-whisper")
            return False
