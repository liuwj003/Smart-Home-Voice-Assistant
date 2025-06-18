# 智能家居语音助手 - 后端

这是智能家居语音助手的后端服务，使用Spring Boot构建。

### 构建和运行

**使用Maven Spring Boot插件**

```bash
mvn spring-boot:run
```

### API文档

#### 设备API

DeviceControl.jar是用于设备控制的独立模块，在8005端口上运行。这个JAR包封装了所有与数据库设备控制相关的逻辑，后端通过HTTP API调用来与之通信，而不是直接在Java代码中实现设备控制功能。

#### 语音API

- `POST /api/command/audio` - 发送音频命令
- `POST /api/command/text` - 发送文本命令
- `GET /api/voice/settings` - 获取语音设置
- `POST /api/voice/settings` - 更新语音设置
- `POST /api/voice/settings/reset` - 重置语音设置为默认值

## 配置

主要配置在`application.yml`文件中：

```yaml

nlp:
  service:
    baseurl: http://localhost:8010  # NLP服务地址
```

## 数据流

### 语音/文本命令处理流程

1. 前端发送请求到`VoiceCommandController`
2. 控制器调用`SmartHomeCommandOrchestrator`进行处理
3. 编排器通过`NlpServiceClient`与NLP服务通信
4. NLP服务处理后返回结果
5. 编排器处理结果并通过`CommandForwardService`将控制命令转发至DeviceControl.jar
6. DeviceControl.jar处理设备控制逻辑并更新数据库中的设备状态
7. 控制器将结果封装为`FrontendResponseDto`返回给前端

### 音频处理数据格式

**发送到后端的请求:**
- 请求类型: `multipart/form-data`
- 参数:
  - `audio_file` 或 `audio`: 音频文件（WebM格式）
  - `settingsJson`: 包含处理设置的JSON字符串

**后端转发到NLP服务:**
- 请求类型: `multipart/form-data`
- 参数:
  - `audio_file`: 未经转换的原始音频文件
  - `settings_json`: 包含处理设置的JSON字符串

**NLP服务返回的响应:**
- JSON格式，包含以下字段:
  - `transcribed_text`: STT识别的文本
  - `nlu_result`: 包含action、entity等信息的NLU结果
  - `response_message_for_tts`: 用于TTS的响应消息
  - `tts_output_reference`: 可选的TTS音频数据引用

## 架构

应用采用标准的Spring三层架构：
- Controller层：处理HTTP请求
- Service层：业务逻辑
- Model：数据模型

### 处理前端语音/文本命令的核心组件

#### 1. 控制器层 (Controller)

1. **VoiceCommandController.java**
   - 主要接口控制器，接收前端的语音和文本命令
   - 路径：`/command/audio` 接收音频文件
   - 路径：`/command/text` 接收文本命令
   - 支持多种参数名（`audio_file` 或 `audio`）
   - 处理`settingsJson`参数，包含各种引擎设置

2. **VoiceController.java**
   - 辅助测试控制器
   - 路径：`/voice/test-audio` 用于直接测试音频处理
   - 路径：`/voice/test-text` 用于直接测试文本处理

3. **SettingsController.java**
   - 管理语音处理相关设置
   - 路径：`/voice/settings` 获取/更新设置
   - 提供默认设置，包括STT、NLU和TTS引擎配置

#### 2. 服务层 (Service)

1. **NlpServiceClient.java**
   - 负责与Python NLP服务通信的客户端
   - 方法：
     - `callProcessAudio()`: 处理音频并转发到NLP服务
     - `callProcessText()`: 处理文本并转发到NLP服务
     - `isNlpServiceHealthy()`: 检查NLP服务是否可用

2. **SmartHomeCommandOrchestrator.java**
   - 协调NLP服务和设备服务的工作流
   - 方法：
     - `orchestrateAudioCommand()`: 编排音频命令处理流程
     - `orchestrateTextCommand()`: 编排文本命令处理流程
     - `processNlpResponse()`: 处理NLP服务响应

3. **CommandForwardService.java**
   - 负责将命令转发至DeviceControl.jar
   - 方法：
     - `forwardCommand()`: 将NLP处理结果转发至设备控制服务

#### 3. 数据传输对象 (DTO)

1. **TextCommandRequestDto.java**
   - 用于接收前端发送的文本命令请求
   - 包含`textInput`和`settings`字段

2. **FrontendResponseDto.java**
   - 统一返回给前端的响应格式
   - 包含`sttText`、`nluResult`、`deviceActionFeedback`等字段
   - 返回`responseMessageForTts`用于语音反馈
   - 可能包含`ttsOutputReference`字段，引用TTS音频数据

### 配置参数

当调用NLP服务时，可以通过`settings`参数配置以下引擎：

1. **STT引擎选项** (`stt_engine`):
   - `placeholder`: 占位引擎，用于测试
   - `whisper`: 使用OpenAI的Whisper模型
   - `dolphin`: 使用Dolphin引擎

2. **NLU引擎选项** (`nlu_engine`):
   - `placeholder`: 占位引擎，用于测试
   - `fine_tuned_bert`: 使用微调过的BERT模型
   - `nlu_orchestrator`: NLU编排器，整合多种处理方式
   - `deepseek`: 使用DeepSeek的NLU模型

3. **TTS引擎选项** (`tts_engine`):
   - `placeholder`: 占位引擎，用于测试
   - `pyttsx3`: 使用pyttsx3库

4. **其他参数**:
   - `tts_enabled`: 是否启用TTS (布尔值)
