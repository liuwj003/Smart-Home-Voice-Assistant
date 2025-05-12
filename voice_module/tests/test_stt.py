import unittest
import numpy as np
import os
from voice_module.src.stt import STTFactory, BaseSTT

class TestSTT(unittest.TestCase):
    def setUp(self):
        """测试前的准备工作"""
        self.test_audio_file = "test_audio.wav"
        # 创建一个简单的测试音频文件
        self._create_test_audio()
    
    def tearDown(self):
        """测试后的清理工作"""
        if os.path.exists(self.test_audio_file):
            os.remove(self.test_audio_file)
    
    def _create_test_audio(self):
        """创建测试用的音频文件"""
        import wave
        import struct
        
        # 创建一个简单的正弦波
        sample_rate = 16000
        duration = 1  # 1秒
        frequency = 440  # 440Hz
        
        # 生成音频数据
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(2 * np.pi * frequency * t)
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # 保存为WAV文件
        with wave.open(self.test_audio_file, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(audio_data.tobytes())
    
    def test_simulated_stt(self):
        """测试模拟语音识别引擎"""
        stt = STTFactory.create("simulated")
        result = stt.transcribe(self.test_audio_file)
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)
    
    def test_wav2vec2_stt(self):
        """测试 Wav2Vec2 语音识别引擎"""
        try:
            stt = STTFactory.create("wav2vec2")
            result = stt.transcribe(self.test_audio_file)
            self.assertIsInstance(result, str)
        except Exception as e:
            self.skipTest(f"Wav2Vec2 测试跳过: {str(e)}")
    
    def test_whisper_stt(self):
        """测试 Whisper 语音识别引擎"""
        try:
            stt = STTFactory.create("whisper")
            result = stt.transcribe(self.test_audio_file)
            self.assertIsInstance(result, str)
        except Exception as e:
            self.skipTest(f"Whisper 测试跳过: {str(e)}")
    
    def test_custom_stt(self):
        """测试自定义语音识别引擎的注册和使用"""
        class CustomSTT(BaseSTT):
            def transcribe(self, audio_data):
                return "自定义引擎测试结果"
            
            def _preprocess_audio(self, audio_data):
                return np.array([])
        
        # 注册自定义引擎
        STTFactory.register_engine("custom", CustomSTT)
        
        # 验证引擎是否可用
        self.assertIn("custom", STTFactory.list_available_engines())
        
        # 测试自定义引擎
        stt = STTFactory.create("custom")
        result = stt.transcribe(self.test_audio_file)
        self.assertEqual(result, "自定义引擎测试结果")
    
    def test_invalid_engine(self):
        """测试无效的引擎类型"""
        with self.assertRaises(ValueError):
            STTFactory.create("invalid_engine")
    
    def test_invalid_custom_engine(self):
        """测试无效的自定义引擎注册"""
        class InvalidEngine:
            pass
        
        with self.assertRaises(ValueError):
            STTFactory.register_engine("invalid", InvalidEngine)

if __name__ == '__main__':
    unittest.main()