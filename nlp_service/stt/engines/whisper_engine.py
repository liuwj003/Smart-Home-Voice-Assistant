import logging
import os
import sys
import torch
import whisper
from pathlib import Path
from typing import Dict, Any, List

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.stt_interface import STTInterface, STTError

# 配置日志
logger = logging.getLogger(__name__)

class WhisperSTTEngine(STTInterface):
    """
    使用Whisper模型的STT引擎
    """
    
    def __init__(self, config: Dict):
        """
        初始化WhisperSTTEngine
        
        Args:
            config: 引擎配置
        """
        super().__init__(config)
        self.model_size = self.config.get("model_size", "base")
        self.device_name = self.config.get("device", "cpu")
        self.device = torch.device(self.device_name)
        logger.info(f"WhisperSTTEngine初始化完成，模型大小: {self.model_size}, 设备: {self.device_name}")
    
    async def transcribe(self, audio_data: bytes) -> str:
        """
        将音频数据转换为文本
        
        Args:
            audio_data: 音频数据的字节流
            
        Returns:
            转换后的文本
            
        Raises:
            STTError: 如果转换失败
        """
        if not self.available():
            raise STTError("Whisper引擎不可用")
        
        try:
            # 保存音频数据到临时文件
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name
                temp_file.write(audio_data)
            
            logger.info(f"音频数据已保存到临时文件: {temp_filename}")
            
            # 加载模型
            model = whisper.load_model(self.model_size)
            
            # 加载音频并进行处理
            audio = whisper.load_audio(temp_filename)
            audio = whisper.pad_or_trim(audio)
            
            # 生成梅尔频谱图并移动到相同设备
            mel = whisper.log_mel_spectrogram(audio).to(self.device)
            
            # 检测语言
            _, probs = model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            logger.info(f"检测到的语言: {detected_lang}")
            
            # 解码音频
            options = whisper.DecodingOptions()
            result = whisper.decode(model, mel, options)
            
            # 清理临时文件
            os.unlink(temp_filename)
            
            return result.text
            
        except Exception as e:
            logger.error(f"音频转文本失败: {str(e)}")
            raise STTError(f"音频转文本失败: {str(e)}")
    
    def get_supported_formats(self) -> list:
        """
        获取此STT引擎支持的音频格式列表
        
        Returns:
            支持的格式列表
        """
        return ['wav', 'mp3', 'ogg', 'flac', 'webm']
    
    def get_supported_languages(self) -> List[str]:
        """
        获取支持的语言列表
        
        Returns:
            支持的语言列表
        """
        return ["en", "zh", "ja", "ru", "ko", "fr", "de", "es", "it", "pt", "nl", "tr", "pl", "ar"]
    
    def available(self) -> bool:
        """
        检查引擎是否可用
        
        Returns:
            如果引擎可用则为True，否则为False
        """
        try:
            import whisper
            return True
        except ImportError:
            logger.warning("Whisper未安装，请使用: pip install -U openai-whisper")
            return False 