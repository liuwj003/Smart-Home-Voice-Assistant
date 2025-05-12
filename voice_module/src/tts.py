from abc import ABC, abstractmethod
from typing import Any, Optional, Union
import pyttsx3
import edge_tts
import asyncio
import tempfile
import os

class TextToSpeech(ABC):
    """文本转语音的抽象基类"""
    
    @abstractmethod
    def speak(self, text: str, **kwargs) -> None:
        """
        将文本转换为语音并播放
        
        Args:
            text: 要转换的文本
            **kwargs: 其他参数，如语速、音量、音调等
        """
        pass
    
    @abstractmethod
    def save_to_file(self, text: str, filename: str, **kwargs) -> None:
        """
        将文本转换为语音并保存到文件
        
        Args:
            text: 要转换的文本
            filename: 输出文件名
            **kwargs: 其他参数
        """
        pass

class Pyttsx3TTS(TextToSpeech):
    """使用pyttsx3的TTS实现"""
    
    def __init__(self, voice: Optional[str] = None, rate: int = 150, volume: float = 1.0):
        """
        初始化pyttsx3 TTS引擎
        
        Args:
            voice: 语音ID，如果为None则使用默认语音
            rate: 语速（词/分钟）
            volume: 音量（0.0-1.0）
        """
        self.engine = pyttsx3.init()
        if voice:
            self.engine.setProperty('voice', voice)
        self.engine.setProperty('rate', rate)
        self.engine.setProperty('volume', volume)
    
    def speak(self, text: str, **kwargs) -> None:
        """播放文本"""
        self.engine.say(text)
        self.engine.runAndWait()
    
    def save_to_file(self, text: str, filename: str, **kwargs) -> None:
        """保存到文件"""
        self.engine.save_to_file(text, filename)
        self.engine.runAndWait()

class EdgeTTS(TextToSpeech):
    """使用Microsoft Edge TTS的实现"""
    
    def __init__(self, voice: str = "zh-CN-XiaoxiaoNeural"):
        """
        初始化Edge TTS
        
        Args:
            voice: 语音ID，默认为中文女声
        """
        self.voice = voice
    
    async def _speak_async(self, text: str, **kwargs) -> None:
        """异步播放文本"""
        communicate = edge_tts.Communicate(text, self.voice)
        await communicate.play()
    
    def speak(self, text: str, **kwargs) -> None:
        """同步播放文本"""
        asyncio.run(self._speak_async(text, **kwargs))
    
    async def _save_to_file_async(self, text: str, filename: str, **kwargs) -> None:
        """异步保存到文件"""
        communicate = edge_tts.Communicate(text, self.voice)
        await communicate.save(filename)
    
    def save_to_file(self, text: str, filename: str, **kwargs) -> None:
        """同步保存到文件"""
        asyncio.run(self._save_to_file_async(text, filename, **kwargs))

def create_tts_engine(engine_type: str = "pyttsx3", **kwargs) -> TextToSpeech:
    """
    工厂函数，创建TTS引擎
    
    Args:
        engine_type: 引擎类型，可选值："pyttsx3", "edge"
        **kwargs: 传递给具体实现的参数
        
    Returns:
        TextToSpeech: TTS引擎实例
    """
    if engine_type == "pyttsx3":
        return Pyttsx3TTS(**kwargs)
    elif engine_type == "edge":
        return EdgeTTS(**kwargs)
    else:
        raise ValueError(f"Unsupported TTS engine type: {engine_type}")

class DeviceStatusReporter:
    """设备状态报告器，用于生成和播报设备状态"""
    
    def __init__(self, tts_engine: TextToSpeech):
        """
        初始化设备状态报告器
        
        Args:
            tts_engine: TTS引擎实例
        """
        self.tts = tts_engine
    
    def report_single_device(self, device: dict) -> None:
        """
        报告单个设备的状态
        
        Args:
            device: 设备信息字典
        """
        status_text = self._generate_device_status_text(device)
        self.tts.speak(status_text)
    
    def report_multiple_devices(self, devices: list) -> None:
        """
        报告多个设备的状态
        
        Args:
            devices: 设备信息字典列表
        """
        status_text = self._generate_multiple_devices_status_text(devices)
        self.tts.speak(status_text)
    
    def _generate_device_status_text(self, device: dict) -> str:
        """生成单个设备的状态文本"""
        name = device.get('name', '未知设备')
        status = '开启' if device.get('status') == 'on' else '关闭'
        
        # 根据设备类型生成不同的状态描述
        device_type = device.get('type', '')
        if device_type == 'light':
            brightness = device.get('brightness', 0)
            return f"{name}当前{status}，亮度为{brightness}%"
        elif device_type == 'ac':
            temperature = device.get('temperature', 0)
            mode = device.get('mode', '自动')
            return f"{name}当前{status}，温度为{temperature}度，模式为{mode}"
        elif device_type == 'tv':
            channel = device.get('channel', 1)
            volume = device.get('volume', 0)
            return f"{name}当前{status}，频道为{channel}，音量为{volume}%"
        elif device_type == 'curtain':
            position = device.get('position', 0)
            return f"{name}当前{status}，开合度为{position}%"
        else:
            return f"{name}当前{status}"
    
    def _generate_multiple_devices_status_text(self, devices: list) -> str:
        """生成多个设备的状态文本"""
        if not devices:
            return "没有找到任何设备"
        
        status_texts = [self._generate_device_status_text(device) for device in devices]
        return "，".join(status_texts) 