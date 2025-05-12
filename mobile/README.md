# 智能家居语音助手（移动端）

## 项目简介

本项目为智能家居语音助手的移动端（React Native），用于展示设备状态、模拟语音输入，并调用后端接口。

## 运行步骤

### 1. 安装依赖

在项目根目录（即 mobile 文件夹）下，运行以下命令安装依赖：

```bash
npm install
# 或
yarn install
```

### 2. 启动 Metro 服务器

运行以下命令启动 Metro 服务器（React Native 的 JS 打包服务器）：

```bash
npm start
# 或
yarn start
```

### 3. 运行模拟器或真机

- **Android 模拟器**：  
  确保已安装 Android Studio 并配置好模拟器，然后在 Metro 终端中按 "a" 键（或运行 `npm run android`）启动 Android 模拟器。

- **iOS 模拟器**（仅 macOS）：  
  确保已安装 Xcode，然后在 Metro 终端中按 "i" 键（或运行 `npm run ios`）启动 iOS 模拟器。

- **真机调试**：  
  请确保手机与电脑在同一局域网，并在手机中安装 Expo Go 或调试版 APP，然后通过 Metro 终端提示的地址（例如 exp://192.168.1.2:19000）访问。

### 4. 修改后端地址

- 默认情况下，App.js 中后端地址为 `http://localhost:5000`，仅适用于电脑本地调试。  
- 如果使用模拟器或真机，请将 App.js 中的 `fetch('http://localhost:5000/api/devices')` 修改为你电脑的局域网 IP，例如：  
  ```js
  fetch('http://192.168.1.2:5000/api/devices')
  ```
- 确保后端服务（Flask）已启动，并监听在 `0.0.0.0:5000`，以便外部访问。

## 其他说明

- 本页面通过调用后端 `/api/devices` 接口获取虚拟设备数据，并展示设备状态。
- 页面底部悬浮"语音输入"按钮，点击后弹出 Alert 提示，模拟语音输入接口。
- 如需进一步开发（例如实时刷新、设备控制、语音命令处理等），请参考 React Native 官方文档。 