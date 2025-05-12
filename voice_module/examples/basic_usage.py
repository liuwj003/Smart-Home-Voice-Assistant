from ..src import create_voice_processor

def main():
    # 创建语音命令处理器
    processor = create_voice_processor(
        stt_engine_type="simulated",  # 使用模拟的STT引擎
        nlu_engine_type="rule_based"  # 使用基于规则的NLU引擎
    )
    
    # 测试一些命令
    test_commands = [
        "打开客厅灯",
        "关闭卧室空调",
        "把客厅空调的温度调到22度",
        "电视声音大一点",
        "今天天气怎么样",
        "北京天气怎么样",
        "客厅灯坏了"  # 未知命令
    ]
    
    print("测试语音命令处理：")
    print("-" * 50)
    
    for command in test_commands:
        print(f"\n输入命令: {command}")
        result = processor.process_voice_command(command)
        
        print("处理结果:")
        print(f"  意图: {result['intent']}")
        print(f"  实体: {result['entities']}")
        print("-" * 50)

if __name__ == "__main__":
    main() 