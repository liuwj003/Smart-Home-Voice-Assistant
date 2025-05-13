# 智能家居语音助手 - 前端

这是智能家居语音助手的前端应用，使用React构建。包含Web界面和移动风格界面。

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

### 运行开发服务器

```bash
# 启动开发服务器
npm start
# 或
yarn start
```

应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

这将在 `build` 目录中生成用于生产环境的优化版本。

## 使用指南

### 标准Web界面

访问 [http://localhost:3000](http://localhost:3000) 即可进入标准Web界面，包括：

- 首页：显示设备列表和语音控制
- 天气：查看天气信息（示例页面）
- 设置：配置应用参数

### 移动风格界面

访问 [http://localhost:3000/mobile](http://localhost:3000/mobile) 进入移动应用风格界面，提供：

- 类似手机应用的UI布局
- 设备卡片展示
- 底部语音命令按钮

### 配置后端API

在设置页面中，你可以配置后端API的基础URL，默认为：

```
http://localhost:5000/api
```

修改为你的Spring Boot后端服务实际地址，例如：

```
http://192.168.1.100:5000/api
```

保存后，应用将使用新的API地址与后端通信。

## 项目结构

```
frontend/
├── public/              # 静态文件
├── src/                 # 源代码
│   ├── components/      # 可重用组件
│   ├── pages/           # 页面组件
│   ├── services/        # API服务
│   ├── App.js           # 主应用组件
│   ├── MobileApp.css    # 移动风格CSS
│   └── index.js         # 入口文件
└── package.json         # 项目配置
```