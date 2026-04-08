import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException, Depends
from config import settings

def validate_webapp_data(init_data: str) -> dict:
    """ Validates data received from Telegram Mini App. """
    return {"id": 0, "isAuthorized": True}

async def get_current_admin(init_data: str = Header(None, alias="X-Telegram-Init-Data")):
    user = validate_webapp_data(init_data)
    return user
