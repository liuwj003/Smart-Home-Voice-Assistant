import pyaudio
import wave
import threading
import queue
import numpy as np
from typing import Optional, Callable, Any
import time

class AudioRecorder:
    """实时音频录制器"""
    
    def __init__(
        self,
        chunk_size: int = 1024,
        format: int = pyaudio.paInt16,
        channels: int = 1,
        rate: int = 16000,
        callback: Optional[Callable[[bytes], Any]] = None
    ):
        """
        初始化音频录制器
        
        Args:
            chunk_size: 每次读取的音频块大小
            format: 音频格式
            channels: 声道数
            rate: 采样率
            callback: 音频数据回调函数
        """
        self.chunk_size = chunk_size
        self.format = format
        self.channels = channels
        self.rate = rate
        self.callback = callback
        
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.is_recording = False
        self.audio_queue = queue.Queue()
        self.recording_thread = None
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """PyAudio回调函数"""
        if self.is_recording:
            self.audio_queue.put(in_data)
            if self.callback:
                self.callback(in_data)
        return (in_data, pyaudio.paContinue)
    
    def start_recording(self):
        """开始录音"""
        if self.is_recording:
            return
        
        self.is_recording = True
        self.stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._audio_callback
        )
        self.stream.start_stream()
        
        # 启动录音线程
        self.recording_thread = threading.Thread(target=self._recording_worker)
        self.recording_thread.daemon = True
        self.recording_thread.start()
    
    def stop_recording(self) -> bytes:
        """
        停止录音并返回录制的音频数据
        
        Returns:
            bytes: 录制的音频数据
        """
        if not self.is_recording:
            return b''
        
        self.is_recording = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        # 等待录音线程结束
        if self.recording_thread:
            self.recording_thread.join()
        
        # 收集所有音频数据
        audio_data = b''
        while not self.audio_queue.empty():
            audio_data += self.audio_queue.get()
        
        return audio_data
    
    def _recording_worker(self):
        """录音工作线程"""
        while self.is_recording:
            time.sleep(0.1)
    
    def save_to_wav(self, audio_data: bytes, filename: str):
        """
        将音频数据保存为WAV文件
        
        Args:
            audio_data: 音频数据
            filename: 文件名
        """
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(self.format))
            wf.setframerate(self.rate)
            wf.writeframes(audio_data)
    
    def __del__(self):
        """清理资源"""
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.audio:
            self.audio.terminate()

class AudioProcessor:
    """音频处理器，用于处理实时音频输入"""
    
    def __init__(
        self,
        voice_processor: Any,  # VoiceCommandProcessor类型
        silence_threshold: float = 0.01,
        silence_duration: float = 1.0,
        min_speech_duration: float = 0.5
    ):
        """
        初始化音频处理器
        
        Args:
            voice_processor: 语音命令处理器实例
            silence_threshold: 静音阈值
            silence_duration: 静音持续时间（秒）
            min_speech_duration: 最小语音持续时间（秒）
        """
        self.voice_processor = voice_processor
        self.silence_threshold = silence_threshold
        self.silence_duration = silence_duration
        self.min_speech_duration = min_speech_duration
        
        self.recorder = AudioRecorder(callback=self._process_audio_chunk)
        self.audio_buffer = []
        self.last_sound_time = 0
        self.is_speaking = False
        self.speech_start_time = 0
    
    def _process_audio_chunk(self, audio_chunk: bytes):
        """
        处理音频数据块
        
        Args:
            audio_chunk: 音频数据块
        """
        # 将字节数据转换为numpy数组
        audio_data = np.frombuffer(audio_chunk, dtype=np.int16)
        
        # 计算音量
        volume = np.abs(audio_data).mean() / 32768.0
        
        current_time = time.time()
        
        # 检测语音开始
        if volume > self.silence_threshold:
            if not self.is_speaking:
                self.is_speaking = True
                self.speech_start_time = current_time
                self.audio_buffer = []
            self.last_sound_time = current_time
            self.audio_buffer.append(audio_chunk)
        
        # 检测语音结束
        elif self.is_speaking:
            if current_time - self.last_sound_time > self.silence_duration:
                # 检查语音持续时间是否足够
                if current_time - self.speech_start_time >= self.min_speech_duration:
                    # 处理完整的语音数据
                    audio_data = b''.join(self.audio_buffer)
                    self._process_speech(audio_data)
                
                self.is_speaking = False
                self.audio_buffer = []
    
    def _process_speech(self, audio_data: bytes):
        """
        处理完整的语音数据
        
        Args:
            audio_data: 完整的语音数据
        """
        # 使用语音处理器处理音频数据
        result = self.voice_processor.process_voice_command(audio_data)
        return result
    
    def start_listening(self):
        """开始监听音频输入"""
        self.recorder.start_recording()
    
    def stop_listening(self):
        """停止监听音频输入"""
        return self.recorder.stop_recording()
    
    def save_recording(self, filename: str):
        """
        保存录制的音频
        
        Args:
            filename: 文件名
        """
        audio_data = b''.join(self.audio_buffer)
        self.recorder.save_to_wav(audio_data, filename) 