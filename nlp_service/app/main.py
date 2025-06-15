import json
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, Any
import uvicorn

from .orchestrator import NLPServiceOrchestrator

logger = logging.getLogger(__name__)

# 初始化FastAPI应用
app = FastAPI(
    title="智能家居语音助手NLP服务",
    description="提供语音识别(STT)、自然语言理解(NLU)和语音合成(TTS)服务",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 文本命令的请求模型
class TextCommandPayload(BaseModel):
    text_input: str
    settings: Optional[Dict[str, Any]] = {}

# 全局变量，存储编排器实例
orchestrator: Optional[NLPServiceOrchestrator] = None

@app.on_event("startup")
async def startup_event():
    """
    在应用启动时初始化编排器
    """
    global orchestrator
    logger.info("正在初始化NLP服务编排器...")
    orchestrator = NLPServiceOrchestrator()
    logger.info("NLP服务编排器初始化完成")

@app.post("/process_audio")
async def process_audio(
    audio_file: UploadFile = File(...),
    settings_json: str = Form(...)
):
    """
    处理上传的音频文件
    
    Args:
        audio_file: 上传的音频文件
        settings_json: JSON字符串形式的设置
        
    Returns:
        处理结果的JSON响应
    """
    try:
        # 解析设置
        settings = json.loads(settings_json)
        logger.info(f"收到 settings: {settings}")

        # 读取音频文件内容
        audio_data = await audio_file.read()
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="音频文件为空")
        
        # 使用编排器处理音频
        result = await orchestrator.handle_audio_input(audio_data, settings)
        
        return result
    except json.JSONDecodeError:
        logger.error("无效的settings_json格式")
        raise HTTPException(status_code=400, detail="无效的settings_json格式")
    except Exception as e:
        logger.error(f"处理音频文件时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理音频文件时出错: {str(e)}")

@app.post("/process_text")
async def process_text(payload: TextCommandPayload):
    """
    处理文本输入
    
    Args:
        payload: 包含文本输入和设置的负载
        
    Returns:
        处理结果的JSON响应
    """
    try:
        # 使用编排器处理文本
        result = await orchestrator.handle_text_input(payload.text_input, payload.settings)
        
        return result
    except Exception as e:
        logger.error(f"处理文本输入时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理文本输入时出错: {str(e)}")

@app.get("/health")
async def health_check():
    """
    健康检查端点
    
    Returns:
        服务状态信息
    """
    return {
        "status": "healthy",
        "service": "nlp_service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8010, reload=True) 