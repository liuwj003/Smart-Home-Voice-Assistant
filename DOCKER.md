# Docker 部署指南

本文档介绍如何使用 Docker 部署智能家居语音助手。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 开发环境部署

### 部署步骤

1. 克隆项目仓库：

```bash
git clone https://github.com/liuwj003/Smart-Home-Voice-Assistant.git
cd SmartHomeVoiceAssistant
```

2. 构建并启动 Docker 容器：

```bash
docker-compose up -d
```

这个命令会构建并启动三个服务：
- NLP Service (语音处理服务): 端口 8000
- Backend (Java 后端): 端口 8080
- Frontend (React 前端): 端口 3000

3. 查看服务日志：

```bash
# 查看所有服务的日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f nlp-service
docker-compose logs -f backend
docker-compose logs -f frontend
```

4. 访问应用：

在浏览器中打开 http://localhost:3000 来访问应用界面。

### 检查服务健康状态

所有服务都配置了健康检查，可以通过以下端点查看：

- NLP Service: http://localhost:8000/health
- Backend: http://localhost:8080/api

### 解决常见问题

1. **无法访问前端应用**：
   - 确保前端容器正在运行：`docker-compose ps`
   - 检查前端日志：`docker-compose logs frontend`
   - 尝试重启前端服务：`docker-compose restart frontend`

2. **后端服务启动失败**：
   - 检查后端日志：`docker-compose logs backend`
   - 确保所有依赖项都已安装：`docker-compose exec backend mvn dependency:tree`

3. **NLP服务无法连接**：
   - 确保ffmpeg已正确安装在容器中
   - 检查NLP服务日志：`docker-compose logs nlp-service`

## 停止服务

停止并移除所有容器：

```bash
docker-compose down
```

如果也想删除持久化的数据卷：

```bash
docker-compose down -v
```

## 重新构建

如果你修改了代码，需要重新构建：

```bash
docker-compose up -d --build
```

## 生产环境部署

要在生产环境部署，建议做以下调整：

1. 修改 `docker-compose.yml`，添加适当的资源限制
2. 为前端构建生产版本（而非开发服务器）
3. 配置 HTTPS 支持和域名
4. 设置环境变量，特别是任何敏感信息
5. 设置持久化存储

### 生产环境部署示例

可以创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  nlp-service:
    # 基本配置与开发环境相同
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
          
  backend:
    # 基本配置与开发环境相同
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
          
  frontend:
    # 修改为生产构建
    command: sh -c "npm install && npm run build && npm install -g serve && serve -s build -l 3000"
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

使用生产配置：

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 在线云平台部署

可以将这些Docker配置用于以下云服务：

1. **阿里云容器服务**：
   - 将镜像推送到阿里云容器镜像服务
   - 使用容器服务Kubernetes版(ACK)部署

2. **腾讯云容器服务**：
   - 将镜像推送到腾讯云容器镜像仓库
   - 使用TKE部署应用

3. **AWS、GCP等其他云平台**：
   - 可使用类似方式部署，只需调整对应的仓库地址和命令

## 部署注意事项

- 默认配置中，Maven依赖数据存储在持久化卷中，但其他应用数据未持久化
- 在生产环境中，建议配置 HTTPS
- 确保设置适当的环境变量，特别是涉及到 API 密钥的部分
- 生产环境请使用更强的密码和安全设置 