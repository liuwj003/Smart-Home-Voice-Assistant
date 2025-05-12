import pyaudio
import wave
import numpy as np
import torch
import torchaudio
import sounddevice as sd
from .stt import create_stt_engine

class VoiceRecognizer:
    """语音识别器类，用于处理麦克风输入和音频文件"""
    
    def __init__(self, stt_engine_type="wav2vec2"):
        """
        初始化语音识别器
        
        Args:
            stt_engine_type: 语音识别引擎类型，可选值："simulated", "wav2vec2"
        """
        self.stt_engine = create_stt_engine(stt_engine_type)
        self.audio = pyaudio.PyAudio()
        self.sample_rate = 16000
        self.chunk_size = 1024
        self.channels = 1
        self.format = pyaudio.paFloat32
        
    def __del__(self):
        """清理资源"""
        self.audio.terminate()
    
    def record_audio(self, duration=5, output_file=None):
        """
        从麦克风录制音频
        
        Args:
            duration: 录制时长（秒）
            output_file: 输出文件路径（可选）
            
        Returns:
            numpy.ndarray: 录制的音频数据
        """
        print(f"开始录音，持续 {duration} 秒...")
        
        # 打开音频流
        stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size
        )
        
        # 录制音频
        frames = []
        for _ in range(0, int(self.sample_rate / self.chunk_size * duration)):
            data = stream.read(self.chunk_size)
            frames.append(np.frombuffer(data, dtype=np.float32))
        
        # 停止并关闭流
        stream.stop_stream()
        stream.close()
        
        # 合并音频数据
        audio_data = np.concatenate(frames, axis=0)
        
        # 保存到文件（如果指定）
        if output_file:
            with wave.open(output_file, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.audio.get_sample_size(pyaudio.paFloat32))
                wf.setframerate(self.sample_rate)
                wf.writeframes(audio_data.tobytes())
        
        print("录音完成")
        return audio_data
    
    def recognize_from_microphone(self, duration=5):
        """
        从麦克风录制并识别语音
        
        Args:
            duration: 录制时长（秒）
            
        Returns:
            str: 识别出的文本
        """
        audio_data = self.record_audio(duration)
        return self.stt_engine.transcribe(audio_data)
    
    def recognize_from_file(self, audio_file):
        """
        从音频文件识别语音
        
        Args:
            audio_file: 音频文件路径
            
        Returns:
            str: 识别出的文本
        """
        return self.stt_engine.transcribe(audio_file)
    
    def play_audio(self, audio_data):
        """
        播放音频数据
        
        Args:
            audio_data: numpy 数组形式的音频数据
        """
        sd.play(audio_data, self.sample_rate)
        sd.wait()  # 等待播放完成