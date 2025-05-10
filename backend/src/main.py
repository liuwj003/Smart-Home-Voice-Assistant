import os
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from backend.src.routers import devices, weather, voice
from backend.src.config import settings

app = FastAPI(
    title="Smart Home Voice Assistant API",
    description="Backend API for Smart Home Voice Assistant System",
    version="0.1.0"
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Home Voice Assistant API"}

@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "version": "0.1.0"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "backend.src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    ) 