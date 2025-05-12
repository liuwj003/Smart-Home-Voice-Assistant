import torch
import torchaudio
from transformers import (
    Wav2Vec2ForCTC, 
    Wav2Vec2Processor,
    WhisperProcessor,
    WhisperForConditionalGeneration
)
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, Type, Optional, Any

class BaseSTT(ABC):
    """语音识别基类"""
    
    @abstractmethod
    def transcribe(self, audio_data: Any) -> str:
        """将音频数据转换为文本"""
        pass
    
    @abstractmethod
    def _preprocess_audio(self, audio_data: Any) -> np.ndarray:
        """预处理音频数据"""
        pass

class SimulatedSTT(BaseSTT):
    """模拟语音识别，用于测试"""
    def transcribe(self, audio_data: Any) -> str:
        return "这是一个模拟的语音识别结果"
    
    def _preprocess_audio(self, audio_data: Any) -> np.ndarray:
        return np.array([])

class Wav2Vec2STT(BaseSTT):
    """使用 Wav2Vec2 模型的语音识别实现"""
    def __init__(self, model_name: str = "facebook/wav2vec2-base-960h"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.processor = Wav2Vec2Processor.from_pretrained(model_name)
        self.model = Wav2Vec2ForCTC.from_pretrained(model_name).to(self.device)
    
    def _preprocess_audio(self, audio_data: Any) -> np.ndarray:
        if isinstance(audio_data, str):
            waveform, sample_rate = torchaudio.load(audio_data)
        else:
            waveform = torch.from_numpy(audio_data).float()
            if len(waveform.shape) == 1:
                waveform = waveform.unsqueeze(0)
            sample_rate = 16000
        
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)
        
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
        
        return waveform.squeeze().numpy()

    def transcribe(self, audio_data: Any) -> str:
        try:
            waveform = self._preprocess_audio(audio_data)
            inputs = self.processor(
                waveform, 
                sampling_rate=16000, 
                return_tensors="pt", 
                padding=True
            ).to(self.device)
            
            with torch.no_grad():
                logits = self.model(inputs.input_values).logits
            
            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = self.processor.batch_decode(predicted_ids)
            return transcription[0]
        except Exception as e:
            print(f"Wav2Vec2 语音识别错误: {str(e)}")
            return ""

class WhisperSTT(BaseSTT):
    """使用 Whisper 模型的语音识别实现"""
    def __init__(self, model_name: str = "openai/whisper-large"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.processor = WhisperProcessor.from_pretrained(model_name)
        self.model = WhisperForConditionalGeneration.from_pretrained(model_name).to(self.device)
        # 设置中文识别
        self.model.config.forced_decoder_ids = self.processor.get_decoder_prompt_ids(
            language="chinese", 
            task="transcribe"
        )
    
    def _preprocess_audio(self, audio_data: Any) -> np.ndarray:
        if isinstance(audio_data, str):
            waveform, sample_rate = torchaudio.load(audio_data)
        else:
            waveform = torch.from_numpy(audio_data).float()
            if len(waveform.shape) == 1:
                waveform = waveform.unsqueeze(0)
            sample_rate = 16000
        
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)
        
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
        
        return waveform.squeeze().numpy()

    def transcribe(self, audio_data: Any) -> str:
        try:
            waveform = self._preprocess_audio(audio_data)
            input_features = self.processor(
                waveform, 
                sampling_rate=16000, 
                return_tensors="pt"
            ).input_features.to(self.device)
            
            with torch.no_grad():
                predicted_ids = self.model.generate(input_features)
            
            transcription = self.processor.batch_decode(
                predicted_ids, 
                skip_special_tokens=True
            )
            return transcription[0]
        except Exception as e:
            print(f"Whisper 语音识别错误: {str(e)}")
            return ""

class STTFactory:
    """语音识别引擎工厂类"""
    _engines: Dict[str, Type[BaseSTT]] = {
        "simulated": SimulatedSTT,
        "wav2vec2": Wav2Vec2STT,
        "whisper": WhisperSTT
    }
    
    @classmethod
    def register_engine(cls, name: str, engine_class: Type[BaseSTT]) -> None:
        """注册新的语音识别引擎"""
        if not issubclass(engine_class, BaseSTT):
            raise ValueError(f"引擎类必须继承自 BaseSTT: {engine_class}")
        cls._engines[name] = engine_class
    
    @classmethod
    def create(cls, engine_type: str, **kwargs) -> BaseSTT:
        """创建语音识别引擎实例"""
        if engine_type not in cls._engines:
            raise ValueError(f"不支持的语音识别引擎类型: {engine_type}")
        return cls._engines[engine_type](**kwargs)
    
    @classmethod
    def list_available_engines(cls) -> list:
        """列出所有可用的引擎类型"""
        return list(cls._engines.keys())

# 为了向后兼容，保留原来的工厂函数
def create_stt_engine(engine_type: str = "wav2vec2", **kwargs) -> BaseSTT:
    """创建语音识别引擎的工厂函数（向后兼容）"""
    return STTFactory.create(engine_type, **kwargs)