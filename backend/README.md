# 智能家居语音助手 - 后端

这是智能家居语音助手的后端服务，使用Spring Boot构建。

## 功能

- 虚拟设备管理API
- 语音命令处理
- 语音转文本 (Speech-to-Text)
- 自然语言理解 (NLU)

## 技术栈

- Java 17
- Spring Boot 3.1
- Lombok
- RESTful API

## 开发

### 前提条件

- Java JDK 17+
- Maven 3.6+
- IDE (推荐使用IntelliJ IDEA或Spring Tool Suite)

### 构建和运行

**方法一：使用Maven**

```bash
# 构建项目
mvn clean package

# 运行应用
java -jar target/voice-assistant-0.0.1-SNAPSHOT.jar
```

**方法二：使用Maven Spring Boot插件**

```bash
mvn spring-boot:run
```

应用默认在端口5000上运行，可以通过`application.yml`文件修改。

### API文档

#### 设备API

- `GET /api/devices` - 获取所有设备
- `GET /api/devices/{id}` - 获取特定设备
- `POST /api/devices/{id}/control` - 控制设备

#### 语音API

- `POST /api/voice/command` - 发送语音命令
- `POST /api/voice/start` - 开始语音监听
- `POST /api/voice/stop` - 停止语音监听
- `GET /api/voice/status` - 获取语音监听状态

## 配置

主要配置在`application.yml`文件中：

```yaml
server:
  port: 5000  # 可以修改服务端口

voice:
  audio:
    silence-threshold: 0.01
    silence-duration: 1.0
    min-speech-duration: 0.5
  stt:
    engine-type: simulated
  nlu:
    engine-type: rule_based
```

## 数据流

1. 客户端发送语音数据到服务器
2. 服务器使用语音识别引擎转换为文本
3. 自然语言理解组件识别意图和实体
4. 返回识别结果给客户端

## 架构

应用采用标准的Spring三层架构：
- Controller层：处理HTTP请求
- Service层：业务逻辑
- Model：数据模型
