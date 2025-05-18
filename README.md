# 智能家居语音助手
# 最新修改/更新记录看UPDATELOG.md文件，及时查看是否更新，并且更新之后可以在UPDATELOG.md里进行记录

这是一个使用Maven Java后端和React前端的智能家居语音助手项目。Python语音模块作为service被Java后端调用。

## 项目结构

- `frontend/`: React前端代码
- `backend/`: Java Maven后端代码
- `voice_module/`: Python语音处理模块

## 运行项目

### 准备工作

1. 确保已安装Java JDK 17+
2. 确保已安装Maven
3. 确保已安装Node.js和npm
4. 创建一个python=3.9的虚拟环境并安装ffmpeg：
```bash
conda create -n voice-app python=3.9
conda install -c conda-forge ffmpeg
```
* ffmpeg要conda-forge装一下。

### 启动项目

使用提供的批处理文件启动项目：

```bash
run.bat
```



## 配置

在 `backend/src/main/resources/application.yml` 中可以配置语音处理模块：

```yaml
voice:
  # 选择处理器类型: simulated(模拟) 或 real(实际Python模块)
  processor:
    type: simulated  # 或 'real'
  module:
    path: ./voice_module  # Python模块路径
  stt:
    engine-type: simulated  # STT引擎类型
  nlu:
    engine-type: rule_based  # NLU引擎类型
```

## 语音模块接口

语音模块通过Python子进程方式被Java后端调用，处理语音命令并返回结构化数据。

## 1. 项目描述
* 一个智能家居语音交互助手系统，目的是提高家居生活的便捷性和智能化程度。
* 能够识别用户的语音指令，并与家居设备进行交互，实现语音控制家电开关、调节设备参数、查询天气信息等功能



## 2. 目前已实现的功能
- [ ] 多种语音、方言的指令识别
- [ ] 理解用户的意图和需求
- [ ] 语音控制家居设备
- [ ] 语音播报家具情况
- [ ] 语音播报天气情况
- [ ] 语音提醒
- [ ] 与多种家居设备兼容，并保证良好的响应速度


## 功能特点

- 实时语音识别和控制
- 支持多种设备类型（灯光、空调、电视、窗帘等）
- 基于规则的意图识别
- 设备状态实时显示和控制
- 美观的移动应用界面
- 可配置的系统设置

## 3. 系统要求

### 后端服务
- Python 3.8+
- PyAudio
- OpenAI Whisper
- Springboot
- 其他依赖见 `requirements.txt`

### 移动应用
- Node.js 14+
- React Native 0.72+
- 其他依赖见 `backend/package.json`

## 4. 安装说明

### 后端服务

1. 创建并激活虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```
或者
```bash
conda create -n voice-app
conda activate voice-app
conda install ...
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 启动后端服务：
```bash
cd backend
mvn spring-boot:run
```

4. 启动前端：
```bash
cd frontend
npm install
npm start
```

服务将在 http://localhost:5000 运行。



## 5. 项目结构

```
SmartHomeVoiceAssistant/
├── frontend/                      # 前端Web界面（模拟控制面板）
│   ├── public/
│   ├── src/
│   │   ├── components/            # 控件组件（开关、温控、显示卡片等）
│   │   ├── pages/                 # 主界面（首页/天气/设置）
│   │   ├── services/              # 与后端交互的API
│   │   ├── package.json
│   │   └── README.md

├── backend/                       # 后端服务（API接口 + 仿真设备状态管理）
│   ├── src/
│   │   ├── controllers/           # 接收API请求（如 /device/on /weather）
│   │   ├── models/                # 模拟设备状态对象（如 Light, AC）
│   │   ├── services/              # 核心逻辑（如状态变更、天气获取）
│   │   ├── simulators/            # 仿真器：模拟设备行为和反馈
│   │   └── config/                # 配置项（如设备列表、天气API密钥等）
│   ├── requirements.txt
│   └── README.md

├── voice_module/                  # 语音处理模块
│   ├── src/
│   │   ├── __init__.py
│   │   ├── base.py            # 基础类和接口
│   │   ├── config.py          # 配置文件
│   │   ├── recognizer.py      # 语音识别器
│   │   ├── stt.py            # 语音转文本实现
│   │   ├── nlu.py            # 自然语言理解实现
│   │   ├── tts.py            # 文本转语音实现
│   │   └── utils.py          # 工具函数
│   ├── data/
│   │   ├── dict/
│   │   │   └── zh_dict.txt   # 中文词典
│   │   └── rules/
│   │       └── nlu_rules.json # NLU规则
│   ├── examples/
│   │   └── voice_assistant_demo.py  # 语音助手演示
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_recognizer.py
│   │   ├── test_stt.py
│   │   ├── test_nlu.py
│   │   └── test_tts.py
│   ├── requirements.txt
│   └── README.md

├── device_module/           # 设备控制模块（Optional？）
├── docs/                   # 项目文档
│   ├── img/                       # 用在文档里的各种图片（如UML图）
│   ├── requirement.md             # 需求分析文档
│   ├── design.md                  # 软件设计文档
│   ├── test_plan.md               # 测试计划
│   ├── project_plan.md            # 项目计划与进度
│   └── member_summary.md          # 成员分工与个人总结

├── tests/                  # 集成测试
│   ├── integration/               # 接口集成测试
│   └── test_report.md             # 测试用例与结果说明

├── demo/                          # 运行截图或演示视频
│   ├── video/
│   └── screenshots/

├── scripts/                       # 脚本（部署、启动、初始化模拟数据）
│   └── start_all.sh

├── requirements.txt        # 项目依赖
├── INSTALL_CN.md                  # 中文安装说明
├── INSTALL_EN.md                  # 英文安装说明
├── LICENSE.md                     # 许可证
├── CHANGELOG.md                   # 项目更新日志
└── README.md              # 项目说明文档

```

## 6. 使用说明
(可以直接在根目录下`run.bat`)
## 目前
```bash
在根目录下
cd backend
mvn spring-boot:run
启动后端服务

在根目录下
cd frontend
npm install
npm start
启动前端
```
1. 启动后端服务
2. 在移动应用中配置API地址（默认为 http://localhost:5000/api）
3. 使用语音按钮或设备控制界面控制设备

### 支持的语音命令

- 设备控制：
  - "打开/关闭[设备名称]"
  - "把[设备名称]打开/关闭"

- 参数设置：
  - "把[设备名称]的[参数]调到[数值]"
  - "设置[设备名称]的[参数]为[数值]"

- 参数调节：
  - "把[设备名称]的[参数]调高/调低"
  - "增加/减少[设备名称]的[参数]"

- 天气查询：
  - "[城市]天气怎么样"
  - "查询[城市]的天气"

## 7. 开发说明

### 添加新设备

1. 在 `voice_module/src/config.py` 中添加设备映射
2. 在移动应用的设备列表中添加新设备类型
3. 实现相应的控制界面

### 添加新命令

1. 在 `voice_module/src/config.py` 中添加新的意图和关键词
2. 在 `voice_module/src/nlu.py` 中实现新的意图识别逻辑
3. 在移动应用中添加相应的处理逻辑

## 8. 测试


## 9. 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 10. 许可证

MIT License

## 语音模块功能

### 语音识别 (STT)
- 支持多种语音识别引擎：
  - Google Speech Recognition
  - OpenAI Whisper
  - 模拟STT（用于测试）
- 支持麦克风输入和音频文件输入
- 支持实时语音识别

### 自然语言理解 (NLU)
- 支持多种语言和方言：
  - 简体中文
  - 繁体中文
  - 英语
  - 日语
  - 韩语
- 提供两种NLU实现：
  - 基于规则的NLU（快速、可定制）
  - 基于Transformer的NLU（高准确度、支持多语言）
- 自动语言检测
- 意图识别和实体提取
- 支持自定义规则和模型

### 文本转语音 (TTS)
- 支持多种TTS引擎：
  - pyttsx3（离线、轻量级）
  - Microsoft Edge TTS（在线、高质量）
- 支持多种语言和声音
- 支持语速和音量调节
- 支持保存语音到文件
- 设备状态语音报告

### 示例用法

```python
from voice_module.src.recognizer import VoiceRecognizer
from voice_module.src.nlu import create_nlu_engine
from voice_module.src.tts import create_tts_engine, DeviceStatusReporter

# 初始化组件
recognizer = VoiceRecognizer()
nlu_engine = create_nlu_engine("transformer")  # 使用基于Transformer的NLU
tts_engine = create_tts_engine("edge")  # 使用Edge TTS
status_reporter = DeviceStatusReporter(tts_engine)

# 语音识别
text = recognizer.recognize_from_microphone()

# 自然语言理解
intent = nlu_engine.understand(text)

# 语音播报
tts_engine.speak("设备状态已更新")
status_reporter.report_single_device(device_info)
```
