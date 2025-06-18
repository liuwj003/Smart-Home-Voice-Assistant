# Smart Home Voice Assistant Installation Guide

## Preparation

1. Ensure Java JDK 17+ is installed
2. Ensure Maven is installed
3. Ensure Node.js and npm are installed
4. Install `Microsoft Visual C++ Build Tools` (reference link: https://blog.csdn.net/nk1610099/article/details/141504899), make sure the following components are installed:
- `MSVC v143 - VS 2022 C++ x64/x86 build tools`
- `Windows 10 SDK` (if you are using Windows 10, choose the specific version according to your needs)
- `C++ CMake tools for Windows`

5. **Create a Python 3.9 virtual environment and install ffmpeg**:
```bash
conda create -n voice-app python=3.9
conda install -c conda-forge ffmpeg
```
* **ffmpeg must be installed from conda-forge**.
* If you don't use conda or don't create a virtual environment, **remember to add ffmpeg to your system PATH**, reference tutorial: https://blog.csdn.net/Natsuago/article/details/143231558.

## Starting the Project

Use the provided batch file to start the project:

```bash
run.bat
```
