import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException, Depends
from config import settings

def validate_webapp_data(init_data: str) -> dict:
    """ Validates data received from Telegram Mini App. """
    if not init_data:
        raise HTTPException(status_code=401, detail="Missing initData")

    vals = dict(parse_qsl(init_data))
    if "hash" not in vals:
        raise HTTPException(status_code=401, detail="Missing hash")

    data_hash = vals.pop("hash")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(vals.items()))

    secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
    hmac_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if hmac_hash != data_hash:
        raise HTTPException(status_code=401, detail="Invalid data signature")

    user_data = json.loads(vals.get("user", "{}"))
    return user_data

async def get_current_admin(init_data: str = Header(None, alias="X-TG-Data")):
    user = validate_webapp_data(init_data)
    user_id = user.get("id")
    
    if user_id not in settings.ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Access denied: Not an administrator")
    
    return user
