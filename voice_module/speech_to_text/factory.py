from voice_module.interfaces.stt_interface import SpeechToText, STTError
from voice_module.speech_to_text.engines.dolphin_engine import DolphinSTT
# Any other STT engines can be imported here as needed

# List of available STT engines
STT_ENGINE_REGISTRY = {
    "dolphin": DolphinSTT,
    # Add other STT engines here
}

def create_stt_engine(engine_name: str, config: dict) -> SpeechToText:
    """
    Factory function to create an instance of a SpeechToText engine.

    Args:
        engine_name (str): The name of the STT engine to create.
        config (dict): Configuration parameters for the STT engine.

    Returns:
        SpeechToText: An instance of the specified STT engine.

    Raises:
        STTError: If the specified engine is not found or cannot be created.
    """
    engine_class = STT_ENGINE_REGISTRY.get(engine_name.lower())
    if not engine_class:
        raise STTError(f"STT engine '{engine_name}' not found.")
    
    try:
        # Get engine config
        engine_config = config.get("stt_engines", {}).get(engine_name, {})
        # Create an instance of the STT engine
        stt_instance = engine_class(config=engine_config)
        if not stt_instance.available():
            raise STTError(f"STT engine '{engine_name}' initialized but reported as not available.")
    except Exception as e:
        raise STTError(f"Failed to initialize STT engine '{engine_name}': {str(e)}")
