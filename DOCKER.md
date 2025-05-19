# Docker 部署指南

本文档介绍如何使用 Docker 部署智能家居语音助手。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 部署步骤

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

## 停止服务

停止并移除所有容器：

```bash
docker-compose down
```

## 重新构建

如果你修改了代码，需要重新构建：

```bash
docker-compose up -d --build
```

## 部署到在线平台

要部署到在线平台 (.io 站点等)，可以考虑以下选项：

1. 使用 Docker 托管服务，如 Google Cloud Run、AWS ECS 或 Azure Container Instances
2. 使用 Kubernetes 部署到云平台
3. 使用 PaaS 服务，如 Heroku、Render 或 DigitalOcean App Platform

### 部署到 GitHub Pages (仅前端)

如果仅部署前端界面，可以修改前端代码以使用在线托管的后端 API，然后将前端部署到 GitHub Pages。

## 注意事项

- 默认配置中，数据存储在容器内，容器删除后数据会丢失。如需持久化存储，请添加额外的数据卷配置
- 在生产环境中，建议配置 HTTPS
- 请确保设置适当的环境变量，特别是涉及到 API 密钥的部分 