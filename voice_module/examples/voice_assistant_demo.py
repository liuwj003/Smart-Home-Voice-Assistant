import sys
import os
import json
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from voice_module.src.recognizer import VoiceRecognizer
from voice_module.src.nlu import create_nlu_engine, Intent
from voice_module.src.tts import create_tts_engine, DeviceStatusReporter

def load_device_status():
    """加载模拟的设备状态数据"""
    return {
        "living_room_light": {
            "name": "客厅灯",
            "type": "light",
            "status": "on",
            "brightness": 80
        },
        "bedroom_ac": {
            "name": "卧室空调",
            "type": "ac",
            "status": "on",
            "temperature": 26,
            "mode": "制冷"
        },
        "tv": {
            "name": "电视",
            "type": "tv",
            "status": "off",
            "channel": 1,
            "volume": 50
        }
    }

def main():
    # 初始化组件
    recognizer = VoiceRecognizer()
    nlu_engine = create_nlu_engine("transformer")  # 使用基于Transformer的NLU
    tts_engine = create_tts_engine("edge")  # 使用Edge TTS
    status_reporter = DeviceStatusReporter(tts_engine)
    
    # 加载设备状态
    devices = load_device_status()
    
    print("智能家居语音助手已启动！")
    print("支持的语音命令示例：")
    print("1. '客厅灯的状态如何？'")
    print("2. '卧室空调现在是什么状态？'")
    print("3. '告诉我所有设备的状态'")
    print("4. '把客厅灯调暗一点'")
    print("5. '把卧室空调温度调到25度'")
    print("6. '打开电视'")
    print("\n按Ctrl+C退出程序")
    
    try:
        while True:
            # 等待语音输入
            print("\n请说话...")
            text = recognizer.recognize_from_microphone()
            if not text:
                print("未能识别语音，请重试")
                continue
            
            print(f"识别到的文本: {text}")
            
            # 理解意图
            intent = nlu_engine.understand(text)
            print(f"检测到的语言: {intent.language}")
            print(f"识别到的意图: {intent.name} (置信度: {intent.confidence:.2f})")
            print(f"提取的实体: {json.dumps(intent.entities, ensure_ascii=False, indent=2)}")
            
            # 处理意图
            if intent.name == "query_device_status":
                device_id = intent.entities.get("device_id")
                if device_id:
                    if device_id in devices:
                        status_reporter.report_single_device(devices[device_id])
                    else:
                        tts_engine.speak(f"抱歉，没有找到设备 {device_id}")
                else:
                    # 查询所有设备状态
                    status_reporter.report_multiple_devices(list(devices.values()))
            
            elif intent.name == "control_device":
                device_id = intent.entities.get("device_id")
                action = intent.entities.get("action")
                if device_id in devices:
                    # 更新设备状态
                    if action == "on":
                        devices[device_id]["status"] = "on"
                    elif action == "off":
                        devices[device_id]["status"] = "off"
                    # 报告更新后的状态
                    status_reporter.report_single_device(devices[device_id])
                else:
                    tts_engine.speak(f"抱歉，没有找到设备 {device_id}")
            
            elif intent.name == "adjust_parameter":
                device_id = intent.entities.get("device_id")
                parameter = intent.entities.get("parameter")
                value = intent.entities.get("value")
                if device_id in devices:
                    device = devices[device_id]
                    if parameter in device:
                        # 更新设备参数
                        device[parameter] = value
                        # 报告更新后的状态
                        status_reporter.report_single_device(device)
                    else:
                        tts_engine.speak(f"抱歉，设备 {device['name']} 不支持参数 {parameter}")
                else:
                    tts_engine.speak(f"抱歉，没有找到设备 {device_id}")
            
            else:
                tts_engine.speak("抱歉，我没有理解您的意思，请重试")
    
    except KeyboardInterrupt:
        print("\n程序已退出")
    except Exception as e:
        print(f"发生错误: {e}")
        tts_engine.speak("抱歉，系统出现错误，请重试")

if __name__ == "__main__":
    main() 