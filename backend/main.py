import os
import subprocess
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from config import settings
from database import db
from auth import get_current_admin

app = FastAPI(title="Telegram Bot Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# --- Dashboard ---
@app.get("/api/stats", dependencies=[Depends(get_current_admin)])
async def get_stats():
    return await db.get_stats()

# --- Users ---
@app.get("/api/users", dependencies=[Depends(get_current_admin)])
async def get_users(query: str = "", limit: int = 50, offset: int = 0):
    return await db.search_users(query, limit, offset)

@app.get("/api/users/{user_id}", dependencies=[Depends(get_current_admin)])
async def get_user(user_id: int):
    user = await db.get_user_details(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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
    try:
        # Note: This requires the user running the FastAPI app to have sudo/systemctl privileges
        # Alternatively, use a flag file that the bot monitors
        subprocess.run(["sudo", "systemctl", "restart", "tgbot"], check=True)
        return {"status": "bot restart triggered"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/broadcast", dependencies=[Depends(get_current_admin)])
async def broadcast_message(message: str = Body(..., embed=True)):
    # In a real app, you'd trigger a task in the bot or a background queue
    # For now, we'll return a placeholder
    return {"status": "broadcast started", "message": message}

# Manual Trigger (Placeholder)
@app.post("/api/system/trigger-parser", dependencies=[Depends(get_current_admin)])
async def trigger_parser():
    return {"status": "parsing cycle triggered"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
