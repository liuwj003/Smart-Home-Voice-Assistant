import logging
import os
import sys
import torch
import whisper
from pathlib import Path
from typing import Dict, Any, List
import tempfile
import time

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
        
        # 检测可用设备并处理配置
        self.device_name = self.config.get("device", "auto")
        if self.device_name == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.device_name = "cuda" if torch.cuda.is_available() else "cpu"
        else:
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
            temp_filename = self.save_audio_temp(audio_data)
            
            logger.info(f"音频数据已保存到临时文件: {temp_filename}")
            
            # 加载模型并明确指定设备
            model = whisper.load_model(self.model_size).to(self.device)
            logger.info(f"Whisper模型已加载到设备: {self.device}")
            
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
            options = whisper.DecodingOptions(fp16=False if self.device_name == "cpu" else True)
            result = whisper.decode(model, mel, options)
            
            # 清理临时文件
            try:
                os.unlink(temp_filename)
                logger.info(f"临时文件已删除: {temp_filename}")
            except Exception as e:
                logger.warning(f"临时文件删除失败: {str(e)}")
            
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

    def save_audio_temp(self, audio_data):
        # 获取当前文件的上上级目录（即项目根目录）
        project_root = Path(__file__).resolve().parent.parent.parent
        tmp_dir = project_root / "data" / "tmp_audio"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        fd, temp_filename = tempfile.mkstemp(suffix='.wav', dir=str(tmp_dir))
        with os.fdopen(fd, 'wb') as tmp_file:
            tmp_file.write(audio_data)
        logger.info(f"写入后文件存在: {os.path.exists(temp_filename)}, 路径: {temp_filename}")
        logger.info(f"文件大小: {os.path.getsize(temp_filename) if os.path.exists(temp_filename) else '不存在'}")
        return temp_filename 