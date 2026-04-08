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

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure ADMIN_IDS is a list of ints even if passed as a string/json
        if isinstance(self.ADMIN_IDS, str):
            import json
            try:
                self.ADMIN_IDS = json.loads(self.ADMIN_IDS)
            except:
                self.ADMIN_IDS = [int(x.strip()) for x in self.ADMIN_IDS.split(",") if x.strip()]
        
        print(f"DEBUG: Loaded ADMIN_IDS: {self.ADMIN_IDS} (type: {type(self.ADMIN_IDS)})")

settings = Settings()
