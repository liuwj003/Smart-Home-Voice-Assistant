# 智能家居语音交互助手系统

---
### 1. 项目描述
* 一个智能家居语音交互助手系统，目的是提高家居生活的便捷性和智能化程度。
* 能够识别用户的语音指令，并与家居设备进行交互，实现语音控制家电开关、调节设备参数、查询天气信息等功能

---
### 2. 目前已实现的功能
- [ ] 多种语音、方言的指令识别
- [ ] 理解用户的意图和需求
- [ ] 语音控制家居设备
- [ ] 语音播报家具情况
- [ ] 语音播报天气情况
- [ ] 语音提醒
- [ ] 与多种家居设备兼容，并保证良好的响应速度

### 3. 项目组织架构说明

```
SmartHomeVoiceAssistant/
├── frontend/                      # 前端Web界面（模拟控制面板）
│   ├── public/
│   ├── src/
│   │   ├── components/            # 控件组件（开关、温控、显示卡片等）
│   │   ├── pages/                 # 主界面（首页/天气/设置）
│   │   ├── services/              # 与后端交互的API
│   ├── package.json
│   └── README.md

├── backend/                       # 后端服务（API接口 + 仿真设备状态管理）
│   ├── src/
│   │   ├── controllers/           # 接收API请求（如 /device/on /weather）
│   │   ├── models/                # 模拟设备状态对象（如 Light, AC）
│   │   ├── services/              # 核心逻辑（如状态变更、天气获取）
│   │   ├── simulators/            # 仿真器：模拟设备行为和反馈
│   │   └── config/                # 配置项（如设备列表、天气API密钥等）
│   ├── requirements.txt
│   └── README.md

├── voice_module/                  # 语音处理模块（本地语音识别 + 指令映射）
│   ├── src/
│   │   ├── recognizer.py          # 识别语音输入
│   │   ├── nlp/                   # 自然语言处理
│   │   ├── models/                # 语音识别模型（如Whisper）
│   │   └── mock_microphone.py     # 模拟麦克风输入（如直接读音频文件）
│   └── README.md

├── tests/                         # 测试代码与用例
│   ├── unit/                      # 单元测试（如设备状态转换）
│   ├── integration/               # 接口集成测试
│   └── test_report.md             # 测试用例与结果说明

├── docs/                          # 文档
│   ├── img/                       # 用在文档里的各种图片（如UML图）
│   ├── requirement.md             # 需求分析文档
│   ├── design.md                  # 软件设计文档
│   ├── test_plan.md               # 测试计划
│   ├── project_plan.md            # 项目计划与进度
│   └── member_summary.md          # 成员分工与个人总结

├── demo/                          # 运行截图或演示视频
│   ├── video/
│   └── screenshots/

├── scripts/                       # 脚本（部署、启动、初始化模拟数据）
│   └── start_all.sh

├── .gitignore
├── INSTALL_CN.md                  # 中文安装说明
├── INSTALL_EN.md                  # 英文安装说明
├── LICENSE.md                     # 许可证
├── CHANGELOG.md                   # 项目更新日志
└── README.md                      # 项目总览

```

### 4. 技术栈说明


### 5. 开发环境要求


### 6. 快速开始

详细的安装和运行说明请参考：
- [中文安装说明](INSTALL_CN.md)
- [English Installation Guide](INSTALL_EN.md)

### 7. 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 8. 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE.md](LICENSE.md) 文件
