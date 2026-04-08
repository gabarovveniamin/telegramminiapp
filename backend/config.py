import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    BOT_TOKEN: str
    DATABASE_URL: str
    ADMIN_IDS: List[int] = []
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
