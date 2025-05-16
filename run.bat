@echo off
rem 启动Java Maven后端
start cmd /k "cd backend && mvn spring-boot:run"

rem 等待几秒让后端启动
timeout /t 5

rem 启动React前端
start cmd /k "cd frontend && npm install && npm start"

echo 应用正在启动中...
echo 后端API将在 http://localhost:8080/api 上运行
echo 前端将在 http://localhost:3000 上运行