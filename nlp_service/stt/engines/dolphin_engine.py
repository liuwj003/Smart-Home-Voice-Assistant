import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
import torch
import dolphin
import re
from zhconv import convert  

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.stt_interface import STTInterface, STTError

# 配置日志
logger = logging.getLogger(__name__)

class DolphinSTTEngine(STTInterface):
    """
    使用Dolphin模型的STT引擎
    """
    
    def __init__(self, config: Dict):
        """
        初始化DolphinSTTEngine
        
        Args:
            config: 引擎配置
        """
        super().__init__(config)
        self.model_size = self.config.get("model_size", "small")
        # 检测可用设备并处理配置
        self.device_name = self.config.get("device", "auto")
        if self.device_name == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.device_name = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = torch.device(self.device_name)

        self.device = torch.device(self.device_name)
        self.models_dir = self.config.get("models_dir", os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            "data", 
            "models", 
            "dolphin"
        ))
        logger.info(f"DolphinSTTEngine初始化完成，模型大小: {self.model_size}, 设备: {self.device_name}")
    
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
            raise STTError("Dolphin引擎不可用")
        
        try:
            # 保存音频数据到临时文件
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name
                temp_file.write(audio_data)
            
            logger.info(f"音频数据已保存到临时文件: {temp_filename}")
            
            # 加载音频和模型
            waveform = dolphin.load_audio(temp_filename)
            model = dolphin.load_model(self.model_size, self.models_dir,self.device_name)
            
            # 执行转录
            result = model(waveform)
            
            # 清理临时文件
            os.unlink(temp_filename)
            
            pattern = re.compile(r"<[^>]*>")
            result_text = pattern.sub("", result.text)
            converted_text = convert(result_text, 'zh-cn')
            return converted_text
            
        except Exception as e:
            logger.error(f"音频转文本失败: {str(e)}")
            raise STTError(f"音频转文本失败: {str(e)}")
    
    def get_supported_formats(self) -> list:
        """
        获取此STT引擎支持的音频格式列表
        
        Returns:
            支持的格式列表
        """
        return ['wav', 'mp3', 'ogg']
    
    def get_supported_languages(self) -> List[str]:
        """
        获取支持的语言列表
        
        Returns:
            支持的语言列表
        """
        return ["en", "zh", "ja", "ru", "ko", "ct", "fa"]
    
    def available(self) -> bool:
        """
        检查引擎是否可用
        
        Returns:
            如果引擎可用则为True，否则为False
        """
        try:
            import dolphin
            return True
        except ImportError:
            logger.warning("Dolphin未安装，请使用: pip install -U dataoceanai-dolphin")
            return False 
    
