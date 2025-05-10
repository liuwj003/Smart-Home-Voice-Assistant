#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Smart Home Voice Assistant System...${NC}"

# 检查Python环境
echo -e "${GREEN}Checking Python environment...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python3 first."
    exit 1
fi

# 检查Node.js环境
echo -e "${GREEN}Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 启动后端服务
echo -e "${GREEN}Starting backend service...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# 在后台启动后端服务
python src/main.py &
BACKEND_PID=$!
echo "Backend service started with PID: $BACKEND_PID"

# 启动前端服务
echo -e "${GREEN}Starting frontend service...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# 在后台启动前端服务
npm start &
FRONTEND_PID=$!
echo "Frontend service started with PID: $FRONTEND_PID"

# 启动语音模块
echo -e "${GREEN}Starting voice module...${NC}"
cd ../voice_module
if [ ! -d "venv" ]; then
    echo "Creating virtual environment for voice module..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# 在后台启动语音模块
python src/recognizer.py &
VOICE_PID=$!
echo "Voice module started with PID: $VOICE_PID"

# 保存PID到文件
echo $BACKEND_PID > ../.backend.pid
echo $FRONTEND_PID > ../.frontend.pid
echo $VOICE_PID > ../.voice.pid

echo -e "${BLUE}All services started successfully!${NC}"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"

# 等待用户输入来停止服务
echo "Press Ctrl+C to stop all services..."
wait

# 清理函数
cleanup() {
    echo -e "${GREEN}Stopping all services...${NC}"
    kill $(cat ../.backend.pid) 2>/dev/null
    kill $(cat ../.frontend.pid) 2>/dev/null
    kill $(cat ../.voice.pid) 2>/dev/null
    rm ../.backend.pid ../.frontend.pid ../.voice.pid 2>/dev/null
    echo "All services stopped."
    exit 0
}

# 注册清理函数
trap cleanup SIGINT SIGTERM

# 保持脚本运行
while true; do
    sleep 1
done 