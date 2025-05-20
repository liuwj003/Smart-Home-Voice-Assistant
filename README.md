# 智能家居语音助手
# 最新修改/更新记录看UPDATELOG.md文件，及时查看是否更新，并且更新之后可以在UPDATELOG.md里进行记录

这是一个使用Maven Java后端和React前端的智能家居语音助手项目。Python语音模块作为service被Java后端调用。

## 项目结构

- `frontend/`: React前端代码
- `backend/`: Java Maven后端代码
- `nlp_service/`: 语音处理、自然语言理解服务模块

## 运行项目

### 准备工作

1. 确保已安装Java JDK 17+
2. 确保已安装Maven
3. 确保已安装Node.js和npm
4. 安装一下`Microsoft Visual C++ Build Tools`（参考链接：https://blog.csdn.net/nk1610099/article/details/141504899），确保安装了组件：
- `MSVC v143 - VS 2022 C++ x64/x86 build tools`
- `Windows 10 SDK`（如果你使用的是 Windows 10，具体版本根据你的需求选择）
- `C++ CMake tools for Windows`

5. **创建一个python=3.9的虚拟环境并安装ffmpeg**：
```bash
conda create -n voice-app python=3.9
conda install -c conda-forge ffmpeg
```
* **ffmpeg要conda-forge装一下**。
* 如果不用conda或者不创建虚拟环境，直接运行的话，**记得要把ffmpeg添加到系统路径**，参考教程https://blog.csdn.net/Natsuago/article/details/143231558。

### 启动项目

使用提供的批处理文件启动项目：

```bash
run.bat
```

## 配置

在 `backend/src/main/resources/application.yml` 中可以配置语音处理模块。
以及各种confiig


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
│   │   └── config/                # 配置项（如设备列表、天气API密钥等）
│   └── README.md

├── nlu_service/                  # 语音处理模块
│   ├── src/
│   │   ├── __init__.py
│   │   ├── base.py            # 基础类和接口
│   │   ├── config.py          # 配置文件
│   │   ├── recognizer.py      # 语音识别器
│   │   ├── stt.py            # 语音转文本实现
│   │   ├── nlu.py            # 自然语言理解实现
│   │   ├── tts.py            # 文本转语音实现
│   │   └── utils.py          # 工具函数
│   └── README.md

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

├── requirements.txt        # 项目依赖
├── INSTALL_CN.md                  # 中文安装说明
├── INSTALL_EN.md                  # 英文安装说明
├── LICENSE.md                     # 许可证
├── CHANGELOG.md                   # 项目更新日志
└── README.md              # 项目说明文档

```

### 支持的语音命令


## 7. 开发说明


## 8. 测试


## 9. 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 10. 许可证

My License

## 语音模块功能

### 语音识别 (STT)
  - OpenAI Whisper

### 自然语言理解 (NLU)
- 支持多种语言和方言：
  - 简体中文
  - 繁体中文
  - 英语
  - 日语
  - 韩语
- 提供2种NLU实现：
  - 基于Transformer的NLU（高准确度、支持多语言）
  - 基于deepseek
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

