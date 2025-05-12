import time
from ..src import create_voice_processor, create_audio_processor

def main():
    # 创建语音命令处理器
    voice_processor = create_voice_processor(
        stt_engine_type="whisper",  # 使用Whisper引擎
        nlu_engine_type="rule_based"  # 使用基于规则的NLU引擎
    )
    
    # 创建音频处理器
    audio_processor = create_audio_processor(
        voice_processor,
        silence_threshold=0.01,  # 静音阈值
        silence_duration=1.0,    # 静音持续时间（秒）
        min_speech_duration=0.5  # 最小语音持续时间（秒）
    )
    
    print("开始监听语音输入...")
    print("请说话（检测到静音后自动停止）...")
    
    try:
        # 开始监听
        audio_processor.start_listening()
        
        # 等待用户说话
        while True:
            time.sleep(0.1)
            if not audio_processor.is_speaking and audio_processor.audio_buffer:
                # 处理语音数据
                audio_data = b''.join(audio_processor.audio_buffer)
                result = voice_processor.process_voice_command(audio_data)
                
                print("\n识别结果:")
                print(f"原始文本: {result['original_text']}")
                print(f"意图: {result['intent']}")
                print(f"实体: {result['entities']}")
                
                # 清空缓冲区
                audio_processor.audio_buffer = []
                
                print("\n请继续说话（按Ctrl+C退出）...")
    
    except KeyboardInterrupt:
        print("\n停止监听...")
    finally:
        # 停止监听
        audio_processor.stop_listening()

if __name__ == "__main__":
    main() 