def test_imports():
    """测试所有必要的包是否都已正确安装"""
    try:
        import pyaudio
        print("✓ PyAudio 已安装")
    except ImportError:
        print("✗ PyAudio 未安装")

    try:
        import pyttsx3
        print("✓ pyttsx3 已安装")
    except ImportError:
        print("✗ pyttsx3 未安装")

    try:
        import edge_tts
        print("✓ edge-tts 已安装")
    except ImportError:
        print("✗ edge-tts 未安装")

    try:
        import langdetect
        print("✓ langdetect 已安装")
    except ImportError:
        print("✗ langdetect 未安装")

    try:
        import jieba
        print("✓ jieba 已安装")
    except ImportError:
        print("✗ jieba 未安装")

    try:
        import torch
        print(f"✓ PyTorch 已安装 (版本: {torch.__version__})")
    except ImportError:
        print("✗ PyTorch 未安装")

    try:
        import transformers
        print(f"✓ transformers 已安装 (版本: {transformers.__version__})")
    except ImportError:
        print("✗ transformers 未安装")

def test_audio_devices():
    """测试音频设备"""
    try:
        import pyaudio
        p = pyaudio.PyAudio()
        print("\n可用的音频输入设备：")
        for i in range(p.get_device_count()):
            dev_info = p.get_device_info_by_index(i)
            if dev_info.get('maxInputChannels') > 0:  # 只显示输入设备
                print(f"- {dev_info.get('name')}")
        p.terminate()
    except Exception as e:
        print(f"✗ 测试音频设备时出错: {e}")

def test_tts():
    """测试文本转语音"""
    try:
        import pyttsx3
        engine = pyttsx3.init()
        print("\n可用的 TTS 声音：")
        for voice in engine.getProperty('voices'):
            print(f"- {voice.name}")
    except Exception as e:
        print(f"✗ 测试 TTS 时出错: {e}")

if __name__ == "__main__":
    print("开始测试环境配置...\n")
    test_imports()
    test_audio_devices()
    test_tts()
    print("\n环境测试完成！") 