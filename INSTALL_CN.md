# 智能家居语音助手安装指南

## 准备工作

1. 确保已安装Java JDK 17+
2. 确保已安装Maven
3. 确保已安装Node.js和npm
4. 安装一下`Microsoft Visual C++ Build Tools`（参考链接：https://blog.csdn.net/nk1610099/article/details/141504899 ），确保安装了组件：
- `MSVC v143 - VS 2022 C++ x64/x86 build tools`
- `Windows 10 SDK`（如果你使用的是 Windows 10，具体版本根据你的需求选择）
- `C++ CMake tools for Windows`

5. **创建一个python=3.9的虚拟环境并安装ffmpeg**：
```bash
conda create -n voice-app python=3.9
conda install -c conda-forge ffmpeg
```
* 其中**ffmpeg要conda-forge装一下**。
* 如果不用conda或者不创建虚拟环境，直接运行的话，**记得要把ffmpeg添加到系统路径**，参考教程https://blog.csdn.net/Natsuago/article/details/143231558。

## 启动项目

使用提供的批处理文件启动项目：

```bash
run.bat
```
