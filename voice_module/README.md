# 智能家居语音交互模块

这个模块提供了智能家居系统的语音交互功能，包括语音识别（STT）和自然语言理解（NLU）两个主要组件。

## 功能特点

- 支持多种语音识别引擎（模拟引擎和Whisper引擎）
- 支持基于规则和基于机器学习的自然语言理解
- 支持设备控制、参数设置、天气查询等多种意图识别
- 模块化设计，易于扩展和集成

## 安装依赖

```bash
pip install -r requirements.txt
```

## 快速开始

### 基本使用

```python
from voice_module.src import create_voice_processor

# 创建语音命令处理器
processor = create_voice_processor(
    stt_engine_type="simulated",  # 或 "whisper"
    nlu_engine_type="rule_based"  # 或 "ml_based"
)

# 处理语音命令
result = processor.process_voice_command("打开客厅灯")
print(result)
```

### 支持的语音命令类型

1. 设备控制
   - 开关设备：打开/关闭 [设备名称]
   - 示例：打开客厅灯、关闭卧室空调

2. 参数设置
   - 设置具体值：把 [设备名称] 的 [参数] 调到 [数值]
   - 示例：把客厅空调的温度调到22度

3. 参数调节
   - 相对调节：[设备名称] [参数] [方向]
   - 示例：电视声音大一点、空调温度调低一点

4. 天气查询
   - 查询天气：今天天气怎么样
   - 查询指定城市天气：[城市]天气怎么样

## 模块结构

```
voice_module/
├── src/
│   ├── __init__.py      # 模块入口
│   ├── base.py          # 基础类定义
│   ├── stt.py           # 语音识别实现
│   ├── nlu.py           # 自然语言理解实现
│   ├── config.py        # 配置和常量
│   └── utils.py         # 工具函数
├── tests/               # 测试文件
├── examples/            # 示例代码
└── README.md           # 说明文档
```

## 主要组件

### 语音识别（STT）

- `SimulatedSTT`: 模拟语音识别，用于测试
- `WhisperSTT`: 基于OpenAI Whisper的语音识别实现

### 自然语言理解（NLU）

- `RuleBasedNLU`: 基于规则的意图识别和实体提取
- `MLBasedNLU`: 基于机器学习的NLU实现（待开发）

## 开发说明

### 添加新的意图类型

1. 在 `config.py` 中的 `Intent` 类中添加新的意图类型
2. 在 `RuleBasedNLU` 类中实现对应的意图检测方法
3. 在 `process` 方法中添加对新意图的处理逻辑

### 添加新的设备类型

1. 在 `config.py` 中的 `DEVICE_NAME_TO_ID_MAP` 添加新的设备映射
2. 如果需要，添加设备特定的参数和模式定义

### 添加新的语音识别引擎

1. 创建新的STT类，继承 `SpeechToText` 基类
2. 实现 `transcribe` 方法
3. 在 `create_stt_engine` 工厂函数中添加新引擎的支持

## 测试

运行单元测试：

```bash
python -m unittest discover tests
```

## 示例

查看 `examples` 目录下的示例代码，了解如何使用语音模块：

- `basic_usage.py`: 基本使用示例
- `advanced_usage.py`: 高级功能示例（待添加）

## 注意事项

1. 使用Whisper引擎需要安装额外的依赖
2. 确保音频输入格式符合要求
3. 对于生产环境，建议使用基于机器学习的NLU实现

## 贡献

欢迎提交问题和改进建议！

## 许可证

MIT License