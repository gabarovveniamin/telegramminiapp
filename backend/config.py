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
        # Support JSON strings for lists in env variables
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == "ADMIN_IDS" or field_name == "ALLOWED_ORIGINS":
                import json
                try:
                    return json.loads(raw_val)
                except:
                    return [x.strip() for x in raw_val.split(",")]
            return raw_val

settings = Settings()
