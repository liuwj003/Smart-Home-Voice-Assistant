"""
NLP服务启动脚本
"""
import uvicorn
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    host = os.environ.get("NLP_SERVICE_HOST", "0.0.0.0")
    port = int(os.environ.get("NLP_SERVICE_PORT", "8010"))
    
    logger.info(f"Starting NLP service on {host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 