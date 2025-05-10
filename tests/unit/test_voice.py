import os
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import pytest
from voice_module.src.recognizer import VoiceRecognizer
from voice_module.src.nlp.processor import CommandProcessor

def test_voice_recognizer_initialization():
    recognizer = VoiceRecognizer()
    assert recognizer is not None

def test_command_processor():
    processor = CommandProcessor()
    result = processor.process_command("开灯")
    assert result["success"] is True
    assert result["action"] == "turn_on_light"

def test_command_processor_unknown_command():
    processor = CommandProcessor()
    result = processor.process_command("未知命令")
    assert result["success"] is False
    assert "error" in result 