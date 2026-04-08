import os
import signal
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Header, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import Database, get_db_pool
from .config import settings
from .auth import get_current_admin

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

@app.get("/api/stats")
async def get_stats(db: Database = Depends(get_db)):
    return await db.get_stats()

@app.get("/api/users")
async def get_users(db: Database = Depends(get_db)):
    return await db.get_users()

@app.get("/api/users/{user_id}")
async def get_user(user_id: int, db: Database = Depends(get_db)):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@app.post("/api/users/{user_id}/premium")
async def toggle_premium(user_id: int, db: Database = Depends(get_db)):
    await db.toggle_premium(user_id)
    return {"status": "success"}

@app.post("/api/users/{user_id}/ban")
async def toggle_ban(user_id: int, db: Database = Depends(get_db)):
    await db.toggle_ban(user_id)
    return {"status": "success"}

@app.post("/api/system/restart")
async def restart_bot():
    # This will kill the process, systemd picks it up
    os.kill(os.getpid(), signal.SIGTERM)
    return {"status": "restarting"}

@app.post("/api/broadcast")
async def broadcast(data: Dict[str, Any], db: Database = Depends(get_db)):
    message = data.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Сообщение не может быть пустым")
    # Placeholder for actual broadcast logic
    return {"status": "success", "sent_to": 0}
