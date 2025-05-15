from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 基本设置
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # 数据库设置
    DATABASE_URL: str = "sqlite:///./smart_home.db"
    
    # 安全设置
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 语音识别设置
    VOICE_MODEL_PATH: Optional[str] = None
    
    # 天气API设置
    WEATHER_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings() 