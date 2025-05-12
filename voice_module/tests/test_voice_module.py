import unittest
from ..src import (
    create_voice_processor,
    Intent,
    RuleBasedNLU,
    SimulatedSTT
)

class TestVoiceModule(unittest.TestCase):
    """测试语音模块的主要功能"""
    
    def setUp(self):
        """测试前的准备工作"""
        self.processor = create_voice_processor(
            stt_engine_type="simulated",
            nlu_engine_type="rule_based"
        )
    
    def test_device_control(self):
        """测试设备控制命令"""
        # 测试开灯命令
        result = self.processor.process_voice_command("打开客厅灯")
        self.assertEqual(result["intent"], Intent.DEVICE_CONTROL)
        self.assertEqual(result["entities"]["device_id"], "living_room_light")
        self.assertEqual(result["entities"]["action"], "TURN_ON")
        
        # 测试关空调命令
        result = self.processor.process_voice_command("关闭卧室空调")
        self.assertEqual(result["intent"], Intent.DEVICE_CONTROL)
        self.assertEqual(result["entities"]["device_id"], "bedroom_ac")
        self.assertEqual(result["entities"]["action"], "TURN_OFF")
    
    def test_parameter_setting(self):
        """测试参数设置命令"""
        # 测试设置温度
        result = self.processor.process_voice_command("把客厅空调的温度调到22度")
        self.assertEqual(result["intent"], Intent.SET_PARAMETER)
        self.assertEqual(result["entities"]["device_id"], "living_room_ac")
        self.assertEqual(result["entities"]["parameter"], "temperature")
        self.assertEqual(result["entities"]["value"], 22)
        
        # 测试设置模式
        result = self.processor.process_voice_command("客厅空调设为制冷模式")
        self.assertEqual(result["intent"], Intent.SET_PARAMETER)
        self.assertEqual(result["entities"]["device_id"], "living_room_ac")
        self.assertEqual(result["entities"]["parameter"], "mode")
        self.assertEqual(result["entities"]["value"], "cool")
    
    def test_parameter_adjustment(self):
        """测试参数调节命令"""
        # 测试调高音量
        result = self.processor.process_voice_command("电视声音大一点")
        self.assertEqual(result["intent"], Intent.ADJUST_PARAMETER)
        self.assertEqual(result["entities"]["device_id"], "living_room_tv")
        self.assertEqual(result["entities"]["parameter"], "volume")
        self.assertEqual(result["entities"]["direction"], "UP")
        
        # 测试调低温度
        result = self.processor.process_voice_command("空调温度低一点")
        self.assertEqual(result["intent"], Intent.ADJUST_PARAMETER)
        self.assertEqual(result["entities"]["device_id"], "living_room_ac")
        self.assertEqual(result["entities"]["parameter"], "temperature")
        self.assertEqual(result["entities"]["direction"], "DOWN")
    
    def test_weather_query(self):
        """测试天气查询命令"""
        # 测试查询默认城市天气
        result = self.processor.process_voice_command("今天天气怎么样")
        self.assertEqual(result["intent"], Intent.QUERY_WEATHER)
        self.assertIsNone(result["entities"]["city"])
        
        # 测试查询指定城市天气
        result = self.processor.process_voice_command("北京天气怎么样")
        self.assertEqual(result["intent"], Intent.QUERY_WEATHER)
        self.assertEqual(result["entities"]["city"], "北京")
    
    def test_unknown_command(self):
        """测试未知命令"""
        # 测试无法识别的命令
        result = self.processor.process_voice_command("今天吃什么")
        self.assertEqual(result["intent"], Intent.UNKNOWN)
        self.assertEqual(result["entities"], {})
        
        # 测试包含设备但无法识别的命令
        result = self.processor.process_voice_command("客厅灯坏了")
        self.assertEqual(result["intent"], Intent.UNKNOWN)
        self.assertEqual(result["entities"]["device_id"], "living_room_light")

if __name__ == '__main__':
    unittest.main() 