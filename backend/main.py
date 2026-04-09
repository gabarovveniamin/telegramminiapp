import os
import signal
import httpx
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Header, HTTPException, Depends, Body, APIRouter, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import Database, get_db_pool
from config import settings
from auth import get_current_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    pool = await get_db_pool()
    app.state.db = Database(pool)
    yield
    # Shutdown
    await pool.close()

app = FastAPI(title="TG Admin API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    return app.state.db

# API Router protected by get_current_admin
router = APIRouter(prefix="/api", dependencies=[Depends(get_current_admin)])

@router.get("/stats")
async def get_stats(db: Database = Depends(get_db)):
    return await db.get_stats()

@router.get("/users")
async def get_users(search: Optional[str] = None, db: Database = Depends(get_db)):
    return await db.get_users(search)

@router.get("/users/{user_id}")
async def get_user(user_id: int, db: Database = Depends(get_db)):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.post("/users/{user_id}/premium/grant")
async def grant_premium(
    user_id: int,
    data: Dict[str, Any] = Body(default={}),
    db: Database = Depends(get_db)
):
    """Grant premium. Body: {days: int | null}  —  null/missing = forever."""
    days = data.get("days")  # None means forever
    await db.grant_premium(user_id, days)
    return {"status": "success", "days": days}

@router.post("/users/{user_id}/premium/revoke")
async def revoke_premium(user_id: int, db: Database = Depends(get_db)):
    await db.revoke_premium(user_id)
    return {"status": "success"}

# Legacy toggle endpoint kept for backward compat
@router.post("/users/{user_id}/premium")
async def toggle_premium(user_id: int, db: Database = Depends(get_db)):
    await db.toggle_premium(user_id)
    return {"status": "success"}

@router.post("/users/{user_id}/ban")
async def toggle_ban(user_id: int, db: Database = Depends(get_db)):
    await db.toggle_ban(user_id)
    return {"status": "success"}

@router.post("/system/restart")
async def restart_bot():
    # This will kill the current process, and systemd will restart it
    os.kill(os.getpid(), signal.SIGTERM)
    return {"status": "restarting"}

async def send_telegram_broadcast(message: str, db: Database):
    user_ids = await db.get_all_user_ids()
    bot_token = settings.BOT_TOKEN
    base_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    async with httpx.AsyncClient() as client:
        for user_id in user_ids:
            try:
                await client.post(base_url, json={
                    "chat_id": user_id,
                    "text": message,
                    "parse_mode": "HTML"
                }, timeout=5.0)
            except Exception as e:
                print(f"Failed to send to {user_id}: {e}")

@router.post("/broadcast")
async def broadcast(
    background_tasks: BackgroundTasks, 
    data: Dict[str, Any], 
    db: Database = Depends(get_db)
):
    message = data.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Сообщение не может быть пустым")
    background_tasks.add_task(send_telegram_broadcast, message, db)
    return {"status": "success", "message": "Рассылка запущена"}

@router.get("/system/logs")
async def get_logs():
    import subprocess
    try:
        result = subprocess.run(
            ["journalctl", "-u", "tgadmin", "-n", "100", "--no-pager"], 
            capture_output=True, text=True
        )
        return {"logs": result.stdout}
    except Exception as e:
        return {"logs": f"Error fetching logs: {str(e)}"}

@router.get("/config")
async def get_config():
    # Placeholder for dynamic config
    return {
        "subscription_price_1_star": 50,
        "subscription_price_3_stars": 120,
        "maintenance_mode": False
    }

app.include_router(router)
