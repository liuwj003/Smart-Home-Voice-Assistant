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
│   ├── data/              # 数据模型和常量
│   ├── utils/             # 工具函数
│   ├── styles/            # 样式文件
│   └── ...
├── public/                # 静态资源
└── ...
```

## 静态与动态部分划分

### 静态部分

前端的静态部分主要包括：

1. **UI组件展示**：
   - 页面布局 (`Layout.js`)
   - 设备卡片 (`DeviceItem.js`)
   - 场景列表 (`ScenesList.js`)
   - 收藏设备列表 (`FavoritesList.js`)
   - 移动端头部 (`MobileHeader.js`)

2. **样式定义**：
   - CSS样式表 (`MobileApp.css`, `index.css`)
   - 内联样式 (通过MUI的`sx`属性)

3. **常量数据**：
   - 模拟设备数据
   - 静态配置信息

### 动态部分

前端的动态部分负责状态管理和与后端交互：

1. **状态管理**：
   - React状态钩子 (useState, useEffect)
   - 自定义状态管理Hook

2. **API调用服务**：
   - API模块 (`api.js`)，处理与后端的所有通信

3. **命令处理逻辑**：
   - 文本命令处理 (`useTextCommand.js`)
   - 语音命令处理 (`useVoiceCommand.js`)
   - 命令结果处理 (`useCommandResult.js`)

4. **设备控制逻辑**：
   - 设备状态变更
   - 场景切换

## 语音输入处理流程

语音输入处理是一个复杂的流程，涉及前端录音、数据传输和后端处理的多个环节。完整流程如下：

### 1. 前端录音捕获

当用户点击语音输入按钮时，前端执行以下步骤：

```javascript
// 在VoiceInputSection.js中
const handleVoiceCommand = () => {
  // 触发来自useVoiceCommand hook的语音命令处理函数
  onVoiceCommand();
};
```

### 2. 音频数据采集 (VoiceInput.js)

语音命令的核心处理逻辑在`VoiceInput`组件中实现：

1. **请求麦克风权限**：
   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   ```

2. **创建并配置音频录制器**：
   ```javascript
   // 创建音频上下文和录音设备
   const mediaRecorder = new MediaRecorder(stream);
   const audioChunks = [];
   ```

3. **录制音频**：
   ```javascript
   mediaRecorder.addEventListener("dataavailable", event => {
     audioChunks.push(event.data);
   });
   
   // 开始录音
   mediaRecorder.start();
   
   // 设置超时自动停止录音
   setTimeout(() => {
     if (mediaRecorder.state !== 'inactive') {
       mediaRecorder.stop();
     }
   }, recordingTimeout);
   ```

4. **处理录音完成事件**：
   ```javascript
   mediaRecorder.addEventListener("stop", async () => {
     // 创建音频 Blob
     const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
     
     // 创建 FormData 对象，准备发送到后端
     const formData = new FormData();
     formData.append('audio_file', audioBlob, 'recording.webm');
     
     try {
       // 调用API发送音频数据
       const response = await api.sendAudioCommand(formData);
       handleResponse(response);
     } catch (error) {
       // 错误处理
     } finally {
       // 停止所有音频轨道
       stream.getTracks().forEach(track => track.stop());
     }
   });
   ```

### 3. 音频数据发送 (api.js)

录制完成的音频通过`api.js`中的方法发送到后端：

```javascript
sendAudioCommand: async (formData) => {
  // 读取本地语音设置并添加到请求中
  const settings = getVoiceSettings();
  formData.append('settingsJson', JSON.stringify(settings));
  
  // 发送到后端Spring服务
  const response = await api.post('/command/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 1分钟超时
  });
  
  return response.data;
}
```

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

前端收到结果后，使用`useCommandResult`钩子进行处理：

```javascript
const handleCommandResult = useCallback((result) => {
  // 清除旧状态
  clearResult();
  
  // 格式化NLP五元组结果
  const nlpQuintuple = formatNlpQuintuple(result);
  
  // 判断理解是否成功
  const isSuccess = nlpQuintuple && nlpQuintuple.action && nlpQuintuple.object;
  
  // 更新状态
  setIsUnderstandSuccess(isSuccess);
  if (nlpQuintuple) {
    setNlpResult(nlpQuintuple);
  }
  
  // 设置响应文本
  let responseText = result?.responseMessageForTts || result?.deviceActionFeedback || '';
  setResultText(responseText);
  setShowTypingResponse(true);
  
  // 播放TTS音频(如果有)
  if (result?.ttsOutputReference) {
    playTTSAudio(result.ttsOutputReference);
  }
  
  setIsProcessingResponse(false);
}, [clearResult]);
```

## 前端-后端数据流

### 1. 数据发送格式

前端发送到后端的语音命令请求格式：
- **请求方式**: POST
- **Content-Type**: multipart/form-data
- **URL**: /api/command/audio
- **参数**:
  - `audio_file`: 录制的音频文件(WebM格式)
  - `settingsJson`: JSON字符串格式的设置，包括STT、NLU和TTS引擎选择

### 2. 响应数据结构

后端返回的响应数据结构：
```json
{
  "transcribedText": "识别出的文本",
  "nluResult": {
    "action": "打开",
    "entity": "灯",
    "deviceId": "1",
    "location": "卧室",
    "parameter": "50"
  },
  "responseMessageForTts": "好的，正在打开卧室灯",
  "ttsOutputReference": "base64://...",
  "deviceActionFeedback": "灯已打开",
  "error": false,
  "errorMessage": null
}
```

## 实现天气预报查看功能

天气预报查看是一个常见的语音助手功能，需要实现：

1. **天气页面组件**：
   - 使用`MobileWeather.js`创建天气页面
   - 展示当前天气状况和预报信息
   - 提供天气详情和图形化展示

2. **语音命令支持**：
   - 添加"天气"相关意图识别
   - 支持查询特定地点和日期的天气

3. **API扩展**：
   - 在API模块中添加天气数据获取接口
   - 对接天气服务提供商

4. **响应处理**：
   - 针对天气查询意图返回适当的语音反馈
   - 引导用户查看天气详情页面

## 编写自定义前端组件的注意事项

在为智能家居语音助手开发新组件时，请遵循以下原则：

1. **组件拆分原则**：
   - 将UI展示和业务逻辑分离
   - 使用自定义Hook封装业务逻辑
   - 组件应当只负责渲染和事件传递

2. **状态管理**：
   - 使用React状态钩子管理组件状态
   - 对于共享状态，考虑使用Context API
   - 避免组件间的状态耦合

3. **API调用**：
   - 所有后端API调用应通过`services/api.js`进行
   - 避免在组件中直接使用原始fetch或axios
   - 使用try/catch处理API错误

4. **语音处理**：
   - 遵循现有语音处理流程添加新功能
   - 录音相关代码应考虑浏览器兼容性

5. **样式规范**：
   - 优先使用Material-UI的样式系统
   - 自定义样式通过CSS模块或sx属性实现
   - 保持与现有UI风格的一致性

## 总结

智能家居语音助手前端采用模块化、组件化的React架构，将静态UI展示与动态业务逻辑清晰分离。语音输入处理流程涉及前端录音捕获、数据传输和后端处理等多个环节，形成完整的数据闭环。系统通过自定义Hook实现了功能复用，提高了代码可维护性和可扩展性。

## 功能

- 设备状态展示和控制
- 语音命令输入
- 移动应用风格界面
- Spring Boot后端API集成

## 技术栈

- React (Create React App)
- Material-UI
- React Router
- Axios

## 开发和运行

### 前提条件

- Node.js 14+
- npm 或 yarn

### 安装依赖

```bash
# 安装依赖
npm install
# 或
yarn install
```
## 使用指南



### 配置后端API




## 项目结构

