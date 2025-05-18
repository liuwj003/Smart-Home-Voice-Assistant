@echo off
REM 设置控制台编码为UTF-8
chcp 65001
echo Smart Home Voice Assistant Setup and Launch

REM Check for requirements.txt file
echo Checking requirements.txt file...
if not exist requirements.txt (
    echo Error: requirements.txt not found in the root directory.
    pause
    exit /b 1
)
echo Using root requirements.txt as the main requirements file.

REM Install dependencies
echo Installing project dependencies...
echo This may take a few minutes depending on your internet connection...

echo Attempting standard installation...
pip install -U openai-whisper
pip install -U dataoceanai-dolphin
pip install -U huggingface_hub
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo Standard installation failed. Trying alternative installation method...
    
    REM Try installing without dependencies resolution first
    echo Installing packages without resolving dependencies...
    pip install -r requirements.txt --no-deps
    
    REM Now try installing key packages separately
    echo Installing core packages individually...
    pip install fastapi==0.115.12
    pip install "uvicorn[standard]"==0.34.2
    pip install python-multipart==0.0.6
    pip install pydantic==2.11.4
    pip install pyyaml==6.0.2
    pip install requests==2.30.0
    pip install numpy
    pip install python-dotenv==1.0.0

    echo.
    echo If you encounter issues running the application, you may need to manually install missing packages.
)

echo Python dependencies installation completed.

echo ======================================
echo Starting the application immediately after Python setup...
echo ======================================

REM Create a marker flag to track whether we got to the program launching stage
echo 1 > startup_flag.txt

REM Start NLP Service
echo Starting NLP Service...
start "NLP Service" cmd /k "cd %~dp0nlp_service && python start_service.py"

REM Wait a few seconds for the NLP service to start
echo Waiting for NLP service to initialize...
timeout /t 5

REM Start Java Maven backend
echo Checking Maven dependencies for backend...
cd %~dp0backend

if not exist target (
    echo Maven target directory not found, installing dependencies...
    call mvn clean install -U
) else (
    echo Maven dependencies already installed, skipping install.
)
echo Starting Java backend...
start "Backend" cmd /k "cd %~dp0backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dfile.encoding=UTF-8"

REM Wait a few seconds for the backend to start
echo Waiting for backend to initialize...
timeout /t 10

REM Start React frontend
echo Starting React frontend...
start "Frontend" cmd /k "cd %~dp0frontend && npm install && npm start"

echo ======================================
echo Application started successfully!
echo NLP Service will run on http://localhost:8000
echo Backend API will run on http://localhost:8080/api
echo Frontend will run on http://localhost:3000
echo ======================================

REM Remove the startup flag
del startup_flag.txt

echo.
echo Press any key to stop all services...
pause > nul

REM Kill all started processes when user presses a key
echo Stopping all services...
taskkill /f /im java.exe > nul 2>&1
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im python.exe > nul 2>&1

echo All services stopped.
exit /b 0

