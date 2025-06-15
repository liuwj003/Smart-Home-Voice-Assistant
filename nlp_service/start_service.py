"""
NLP服务启动脚本
"""
import uvicorn
import os
import logging
import sys

# 设置根日志记录器的级别为INFO
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

# 特别提高应用相关模块的日志级别
logging.getLogger("app").setLevel(logging.INFO)
logging.getLogger("interfaces").setLevel(logging.INFO)
logging.getLogger("nlu").setLevel(logging.INFO)
logging.getLogger("stt").setLevel(logging.INFO)
logging.getLogger("tts").setLevel(logging.INFO)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    host = os.environ.get("NLP_SERVICE_HOST", "0.0.0.0")
    port = int(os.environ.get("NLP_SERVICE_PORT", "8010"))
    logger.info(f"Starting NLP service on {host}:{port}")
    
    # 配置uvicorn使用日志配置
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
        log_config=None,  
        access_log=True
    ) 