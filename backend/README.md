# 智能家居语音助手 - 后端

这是智能家居语音助手的后端服务，使用Spring Boot构建。

## 功能

- 虚拟设备管理API
- NLP服务调用

## 技术栈


## 开发

### 前提条件

- Java JDK 17+
- Maven 3.6+

### 构建和运行

**方法一：使用Maven**


**方法二：使用Maven Spring Boot插件**

```bash
mvn spring-boot:run
```


### API文档
* 参考示例，有待实际开发。

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

```

## 数据流


## 架构

应用采用标准的Spring三层架构：
- Controller层：处理HTTP请求
- Service层：业务逻辑
- Model：数据模型
