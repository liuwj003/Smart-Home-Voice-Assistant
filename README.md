# 智能家居语音助手

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
4. 安装一下`Microsoft Visual C++ Build Tools`（参考链接：https://blog.csdn.net/nk1610099/article/details/141504899   ），确保安装了组件：
- `MSVC v143 - VS 2022 C++ x64/x86 build tools`
- `Windows 10 SDK`（如果你使用的是 Windows 10，具体版本根据你的需求选择）
- `C++ CMake tools for Windows`

5. **创建一个python=3.9的虚拟环境并安装ffmpeg**：
```bash
conda create -n voice-app python=3.9
conda install -c conda-forge ffmpeg
```
* **ffmpeg要conda-forge装一下**。
* 如果不用conda或者不创建虚拟环境，直接运行的话，**记得要把ffmpeg添加到系统路径**，参考教程https://blog.csdn.net/Natsuago/article/details/143231558   。

### 启动项目

使用提供的批处理文件启动项目：

```bash
run.bat
```


## 1. 项目描述
* 一个智能家居语音交互助手系统，目的是提高家居生活的便捷性和智能化程度。
* 能够识别用户的语音指令，并与家居设备进行交互，实现语音控制家电开关、调节设备参数、查询天气信息等功能



## 2. 目前已实现的功能
- [x] 多种语音、方言的指令识别
- [x] 理解用户的意图和需求
- [x] 语音控制家居设备
- [x] 与多种家居设备兼容，并保证良好的响应速度


## 功能特点

- 实时语音识别和控制
- 支持多种设备类型（灯光、空调等）
- 意图识别
- 设备状态实时显示
- 美观的移动应用界面
- 可配置的系统设置

## 3. 仓库目录结构

```
SmartHomeVoiceAssistant/
├── frontend/                 # React前端应用
│   ├── public/               # 静态资源
│   ├── src/                  # 源代码
│   ├── package.json          # 依赖配置
│   └── README.md             # 前端文档
│
├── backend/                  # Java Maven后端
│   ├── src/                  # 源代码
│   │   ├── main/java/        # Java代码
│   │   └── main/resources/   # 配置资源
│   ├── pom.xml               # Maven配置
│   └── README.md             # 后端文档
│
├── nlp_service/              # 自然语言处理服务
│   ├── app/                  # 主应用代码
│   ├── config/               # 配置文件
│   ├── interfaces/           # 接口定义
│   ├── nlu/                  # 自然语言理解组件
│   │   ├── processors/       # 处理器（包括deepseek、BERT等）
│   │   └── model/            # 模型文件
│   ├── stt/                  # 语音转文本组件
│   ├── tts/                  # 文本转语音组件
│   ├── data/                 # 数据文件
│   ├── start_service.py      # 服务启动脚本
│   └── README.md             # NLP服务文档
│
├── docs/                     # 项目文档
│   ├── design.md             # 设计文档
│   ├── requirement.md        # 需求文档
│   └── member_summary.md     # 成员工作总结
│
├── run.bat                   # 一键启动脚本
├── requirements.txt          # Python依赖
├── docker-compose.yml        # Docker配置
├── Dockerfile                # Docker构建文件
├── INSTALL_CN.md             # 中文安装指南
├── INSTALL_EN.md             # 英文安装指南
├── UPDATELOG.md              # 更新日志
└── README.md                 # 项目主文档
```

## 4. 技术栈

### 前端
- React.js
- Material-UI
- WebSocket API

### 后端
- Java 
- Spring Boot
- Maven
- RESTful API

### NLP服务
- Python 3.9
- FastAPI
- Transformer (BERT)
- LangChain
- DeepSeek (大模型支持)

## 5. 许可证
```
Copyright (c) 2025 Sun Yat-sen University, School of Computer Science and Engineering, Guangzhou, China.

All rights reserved.
```

