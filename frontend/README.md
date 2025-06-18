# 智能家居语音助手前端架构文档

## 前端架构概述

智能家居语音助手前端采用React框架开发，采用模块化设计模式，将UI展示和业务逻辑分离，通过自定义hooks实现功能复用。前端包含静态UI组件和动态交互逻辑，提供语音和文本两种控制方式，并与后端进行实时通信。

## 目录结构

```
frontend/
├── src/                    # 源代码目录
│   ├── components/         # UI组件
│   │   ├── mobile/         # 移动端UI组件
│   │   │   ├── DeviceItem.js       # 设备项组件
│   │   │   ├── FavoritesList.js    # 收藏设备列表
│   │   │   ├── MobileHeader.js     # 移动端头部组件
│   │   │   ├── PullToRefresh.js    # 下拉刷新组件
│   │   │   ├── ResponseDisplay.js  # 响应显示组件
│   │   │   ├── ScenesList.js       # 场景列表组件
│   │   │   └── VoiceInputSection.js # 语音输入区组件
│   │   ├── VoiceInput.js   # 语音输入组件
│   │   ├── Layout.js       # 布局组件
│   │   └── ...
│   ├── hooks/             # 自定义Hooks
│   │   ├── useCommandResult.js # 命令结果处理
│   │   ├── useTextCommand.js   # 文本命令处理
│   │   ├── useVoiceCommand.js  # 语音命令处理
│   │   └── ...
│   ├── pages/             # 页面组件
│   │   ├── Home.js             # 主页
│   │   ├── MobilePhoneView.js  # 移动端主视图
│   │   ├── MobileWeather.js    # 移动端天气页面
│   │   └── ...
│   ├── services/          # 服务层
│   │   └── api.js         # API调用服务
│   ├── contexts/          # React上下文
│   ├── data/              # 数据模型、接口
│   ├── styles/            # 样式文件
│   └── ...
├── public/                # 静态资源
└── ...
```

## 语音输入处理流程


### 1. 前端录音捕获（useVoiceCommand.js）

### 2. 音频数据采集 (VoiceInput.js)

语音命令的核心处理逻辑在`VoiceInput`组件中实现：

1. **创建并配置音频录制器**
2. **录制音频**
3. **处理录音完成事件**。

### 3. 音频数据发送 (api.js)

录制完成的音频通过`api.js`中的方法发送到后端。


### 4. 数据处理流程

1. **前端 → 后端 → NLP服务**:
   - 前端将音频文件发送到Spring后端
   - Spring后端转发到NLP服务
   - NLP服务执行语音转文本(STT)和自然语言理解(NLU)

2. **后端处理**:
   - Spring后端接收NLP服务的处理结果
   - 根据理解结果执行设备控制
   - 生成最终响应

3. **结果返回**:
   - 后端将处理结果返回给前端
   - 前端解析结果并更新UI

### 5. 结果处理 (useCommandResult.js)

前端收到结果后，使用`useCommandResult`钩子进行处理。

## 音频文件格式转换与传递路径

```
浏览器麦克风(PCM流) → 前端WebM/Opus编码 → HTTP传输 → 
Spring后端接收(不转换格式) → 直接以WebM格式转发 → 
NLP服务将WebM直接保存为临时文件（保存为.wav格式） → STT模型直接读取 → 
STT识别 → 文本 → NLU处理 → 响应文本 → 
TTS生成(WAV/MP3) → Base64编码 → 返回至Spring后端 → 
返回至前端 → 解码播放
```
