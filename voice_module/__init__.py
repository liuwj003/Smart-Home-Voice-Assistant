from typing import Dict, Any, Optional
from voice_module.interfaces.stt_interface import SpeechToText
from voice_module.interfaces.nlp_interface import NaturalLanguageProcessor
from voice_module.interfaces.tts_interface import TextToSpeech
from voice_module.speech_to_text.factory import create_stt_engine
from voice_module.nlp.factory import create_nlp_processor
import logging

logger = logging.getLogger(__name__)


class VoiceProcessor:
    """
    Main voice processing class that coordinates speech-to-text, NLP, and text-to-speech.
    """
    def __init__(
        self, 
        stt_engine: SpeechToText, 
        nlp_processor: NaturalLanguageProcessor,
        tts_engine: Optional[TextToSpeech] = None,
        config: Dict[str, Any] = None,
    ):
        """
        Initialize the voice processor with the necessary components.
        
        Args:
            stt_engine: Speech-to-text engine
            nlp_processor: Natural language processing engine
            tts_engine: Optional text-to-speech engine
            config: Additional configuration options
        """
        self.stt_engine = stt_engine
        self.nlp_processor = nlp_processor
        self.tts_engine = tts_engine
        self.config = config or {}
        
        # Store the engine types for settings API
        self.stt_engine_type = self.config.get("stt_engine_type", "simulated")
        self.nlp_engine_type = self.config.get("nlp_engine_type", "rule_based")
        self.language = self.config.get("language", "zh")
        self.voice_feedback = self.config.get("voice_feedback", True)
        
        logger.info(f"Voice processor initialized with STT engine: {self.stt_engine_type}, "
                  f"NLP engine: {self.nlp_engine_type}, language: {self.language}")
    
    def process_voice_command(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Process a voice command from audio data.
        
        Args:
            audio_data: Raw audio data bytes
            
        Returns:
            Dict with processed results including transcription, intent, and entities
        """
        try:
            # 1. Convert speech to text
            logger.debug("Converting speech to text")
            transcription_result = self.stt_engine.transcribe(audio_data)
            
            # Extract the text from the result
            if isinstance(transcription_result, dict):
                text = transcription_result.get("text", "")
                confidence = transcription_result.get("confidence", 0.0)
            else:
                # Handle string result or other formats
                text = str(transcription_result)
                confidence = 1.0
            
            logger.info(f"Transcription: {text}")
            
            # 2. Process the text through NLP
            if text.strip():  # Only process if there's text
                logger.debug("Processing text through NLP")
                nlp_result = self.nlp_processor.process(text)
                
                # Merge the results
                result = {
                    "transcription": text,
                    "intent": nlp_result.get("intent", "unknown"),
                    "entities": nlp_result.get("entities", {}),
                    "confidence": nlp_result.get("confidence", confidence)
                }
            else:
                # No text was transcribed
                result = {
                    "transcription": "",
                    "intent": "unknown",
                    "entities": {},
                    "confidence": 0.0
                }
            
            logger.info(f"Processed result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            return {
                "transcription": "",
                "intent": "error",
                "entities": {},
                "confidence": 0.0,
                "error": str(e)
            }


class AudioProcessor:
    """
    Handles audio input and processing.
    """
    def __init__(
        self,
        voice_processor: VoiceProcessor,
        silence_threshold: float = 0.01,
        silence_duration: float = 1.0,
        min_speech_duration: float = 0.5,
    ):
        """
        Initialize the audio processor.
        
        Args:
            voice_processor: The voice processor to use for commands
            silence_threshold: Threshold for silence detection
            silence_duration: Duration of silence to end recording
            min_speech_duration: Minimum duration for valid speech
        """
        self.voice_processor = voice_processor
        self.silence_threshold = silence_threshold
        self.silence_duration = silence_duration
        self.min_speech_duration = min_speech_duration
        
        # State variables
        self.is_listening = False
        self.audio_buffer = []
        
        logger.info("Audio processor initialized")
    
    def start_listening(self):
        """
        Start listening for audio input.
        """
        self.is_listening = True
        self.audio_buffer = []
        logger.info("Started listening for audio")
    
    def stop_listening(self):
        """
        Stop listening for audio input.
        """
        self.is_listening = False
        logger.info("Stopped listening for audio")
    
    def add_audio_data(self, audio_data: bytes):
        """
        Add audio data to the buffer.
        
        Args:
            audio_data: Raw audio data bytes
        """
        if self.is_listening:
            self.audio_buffer.append(audio_data)
            logger.debug(f"Added {len(audio_data)} bytes to audio buffer")


def create_voice_processor(stt_engine_type: str = "simulated", 
                           nlp_engine_type: str = "rule_based",
                           tts_engine_type: Optional[str] = None,
                           config: Dict[str, Any] = None) -> VoiceProcessor:
    """
    Factory function to create a voice processor with the specified engines.
    
    Args:
        stt_engine_type: Type of STT engine to use
        nlp_engine_type: Type of NLP processor to use
        tts_engine_type: Optional type of TTS engine to use
        config: Additional configuration options
    
    Returns:
        Configured VoiceProcessor instance
    """
    config = config or {}
    
    # Store engine types in config
    config["stt_engine_type"] = stt_engine_type
    config["nlp_engine_type"] = nlp_engine_type
    
    # Create STT engine
    logger.info(f"Creating STT engine of type: {stt_engine_type}")
    stt_engine = create_stt_engine(stt_engine_type, config)
    
    # Create NLP processor
    logger.info(f"Creating NLP processor of type: {nlp_engine_type}")
    nlp_processor = create_nlp_processor(nlp_engine_type, config)
    
    # Create TTS engine if specified
    tts_engine = None
    if tts_engine_type:
        # TODO: Implement TTS factory
        # from voice_module.text_to_speech.factory import create_tts_engine
        # tts_engine = create_tts_engine(tts_engine_type, config)
        pass
    
    # Create and return the voice processor
    return VoiceProcessor(
        stt_engine=stt_engine,
        nlp_processor=nlp_processor,
        tts_engine=tts_engine,
        config=config
    )


def create_audio_processor(voice_processor: VoiceProcessor,
                           silence_threshold: float = 0.01,
                           silence_duration: float = 1.0,
                           min_speech_duration: float = 0.5) -> AudioProcessor:
    """
    Factory function to create an audio processor.
    
    Args:
        voice_processor: The voice processor to use
        silence_threshold: Threshold for silence detection
        silence_duration: Duration of silence to end recording
        min_speech_duration: Minimum duration for valid speech
    
    Returns:
        Configured AudioProcessor instance
    """
    return AudioProcessor(
        voice_processor=voice_processor,
        silence_threshold=silence_threshold,
        silence_duration=silence_duration,
        min_speech_duration=min_speech_duration
    ) 