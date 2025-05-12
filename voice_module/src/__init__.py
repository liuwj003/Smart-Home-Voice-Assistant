# 空文件，标记为Python包 

from .base import SpeechToText, NLUProcessor, VoiceCommandProcessor
from .stt import create_stt_engine, SimulatedSTT, WhisperSTT
from .nlu import create_nlu_engine, RuleBasedNLU
from .config import Intent
from .audio import AudioRecorder, AudioProcessor
from .utils import (
    extract_number, extract_mode, extract_fan_speed,
    extract_city, normalize_text, validate_command
)

__all__ = [
    # 基类
    'SpeechToText',
    'NLUProcessor',
    'VoiceCommandProcessor',
    
    # STT实现
    'create_stt_engine',
    'SimulatedSTT',
    'WhisperSTT',
    
    # NLU实现
    'create_nlu_engine',
    'RuleBasedNLU',
    
    # 音频处理
    'AudioRecorder',
    'AudioProcessor',
    
    # 常量
    'Intent',
    
    # 工具函数
    'extract_number',
    'extract_mode',
    'extract_fan_speed',
    'extract_city',
    'normalize_text',
    'validate_command'
]

def create_voice_processor(
    stt_engine_type: str = "simulated",
    nlu_engine_type: str = "rule_based",
    **kwargs
) -> VoiceCommandProcessor:
    """
    创建语音命令处理器的便捷函数
    
    Args:
        stt_engine_type: STT引擎类型
        nlu_engine_type: NLU引擎类型
        **kwargs: 传递给引擎创建函数的参数
        
    Returns:
        VoiceCommandProcessor: 语音命令处理器实例
    """
    stt_engine = create_stt_engine(stt_engine_type, **kwargs.get('stt_kwargs', {}))
    # 兼容 nlu_engine_type 的不同命名
    nlu_engine_type_map = {
        'rule_based': 'rule',
        'rule': 'rule',
        'transformer': 'transformer'
    }
    nlu_type = nlu_engine_type_map.get(nlu_engine_type, nlu_engine_type)
    nlu_engine = create_nlu_engine(nlu_type, **kwargs.get('nlu_kwargs', {}))
    return VoiceCommandProcessor(stt_engine, nlu_engine)

def create_audio_processor(
    voice_processor: VoiceCommandProcessor,
    silence_threshold: float = 0.01,
    silence_duration: float = 1.0,
    min_speech_duration: float = 0.5
) -> AudioProcessor:
    """
    创建音频处理器的便捷函数
    
    Args:
        voice_processor: 语音命令处理器实例
        silence_threshold: 静音阈值
        silence_duration: 静音持续时间（秒）
        min_speech_duration: 最小语音持续时间（秒）
        
    Returns:
        AudioProcessor: 音频处理器实例
    """
    return AudioProcessor(
        voice_processor,
        silence_threshold=silence_threshold,
        silence_duration=silence_duration,
        min_speech_duration=min_speech_duration
    ) 