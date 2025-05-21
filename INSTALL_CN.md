# 智能家居语音助手安装指南

本指南提供了在本地机器上设置智能家居语音助手进行开发和测试的分步说明。

## 前提条件

在开始之前，请确保您已安装以下内容：

- **Java JDK 17+** - 后端服务器所需
- **Maven** - 用于Java依赖管理
- **Node.js (14+)和npm** - 用于前端React应用
- **Python 3.9** - 用于NLP服务
- **Microsoft Visual C++ Build Tools**：
  - MSVC v143 - VS 2022 C++ x64/x86 build tools
  - Windows 10 SDK
  - C++ CMake tools for Windows
- **Git** - 用于版本控制

## 安装选项

您可以使用传统方法或使用Docker安装此项目。选择最适合您需求的选项。

### 选项1：传统安装

#### 步骤1：克隆仓库

```bash
git clone https://github.com/your-repo/SmartHomeVoiceAssistant.git
cd SmartHomeVoiceAssistant
```

#### 步骤2：设置Python环境

创建Python虚拟环境并安装依赖项：

```bash
# 创建并激活Conda环境（推荐）
conda create -n voice-app python=3.9
conda activate voice-app
conda install -c conda-forge ffmpeg

# 安装Python依赖项
pip install -U openai-whisper dataoceanai-dolphin huggingface_hub
pip install -r requirements.txt
```

> **注意**：如果不使用Conda，请确保ffmpeg已安装并添加到系统PATH中。

#### 步骤3：设置后端

导航到后端目录并使用Maven构建：

```bash
cd backend
mvn clean install
```

#### 步骤4：设置前端

导航到前端目录并安装依赖项：

```bash
cd ..
cd frontend
npm install
```

#### 步骤5：启动应用程序

您可以使用提供的批处理文件启动所有组件：

```bash
# 从项目根目录
run.bat
```

这将启动：
- 端口8000上的NLP服务
- 端口8080上的Java后端
- 端口3000上的React前端

### 选项2：Docker安装

#### 前提条件

确保您的机器上已安装Docker和Docker Compose。

#### 步骤1：克隆仓库

```bash
git clone https://github.com/your-repo/SmartHomeVoiceAssistant.git
cd SmartHomeVoiceAssistant
```

#### 步骤2：使用Docker Compose启动

```bash
docker-compose up -d
```

这将构建并启动所有必要的容器：
- nlp-service - 端口8000上的NLP处理
- backend - 端口8080上的Java Spring Boot后端
- frontend - 端口3000上的React前端

## 配置

### NLP服务配置

NLP服务的配置可以在以下位置找到：
- `nlp_service/src/config.py`

### 后端配置

后端服务器可以在以下位置配置：
- `backend/src/main/resources/application.yml`

### 前端配置

前端配置位于：
- `frontend/.env`

## 验证

要验证您的安装是否正常工作：

1. 在浏览器中访问`http://localhost:3000`以访问前端界面
2. 测试位于`http://localhost:8080/api`的后端API
3. 检查位于`http://localhost:8000/health`的NLP服务健康状态

## 故障排除

### 常见问题

1. **端口冲突**：确保端口3000、8000和8080没有被其他应用程序使用。

2. **Python依赖项问题**：如果遇到Python依赖项问题，请尝试：
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --ignore-installed
   ```

3. **ffmpeg问题**：确保ffmpeg正确安装并在您的PATH中可用。

4. **Java版本**：确保您使用的是Java 17或更高版本。使用以下命令检查：
   ```bash
   java -version
   ```

5. **内存问题**：对于大型模型，您可能需要分配更多内存：
   ```bash
   # 对于Java后端
   export JAVA_OPTS="-Xmx4g"
   ```

### 获取帮助

如果您遇到此处未涵盖的问题，请：
1. 查看`docs/`目录中的项目文档
2. 查看项目仓库中的现有问题
3. 联系项目维护者寻求帮助

## 其他资源

- 完整文档可在`docs/`目录中找到
- 启动后端后可在`http://localhost:8080/api/docs`访问API文档
- 测试示例可在`tests/`目录中找到