import asyncpg
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone

class Database:
    def __init__(self, pool):
        self.pool = pool

    async def get_stats(self) -> Dict[str, Any]:
        total_users = await self.pool.fetchval("SELECT COUNT(*) FROM users")
        active_premium = await self.pool.fetchval(
            "SELECT COUNT(*) FROM subscriptions WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())"
        )
        print(f"DEBUG_DB: stats -> total={total_users}, premium={active_premium}")
        return {
            "total_users": total_users or 0,
            "active_premium": active_premium or 0,
            "daily_new_users": 0,
            "total_broadcasts": 0
        }

    async def get_users(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        query = "SELECT user_id as id, username, created_at FROM users"
        params = []
        
        if search:
            if search.isdigit():
                query += " WHERE user_id = $1"
                params.append(int(search))
            else:
                query += " WHERE username ILIKE $1"
                params.append(f"%{search}%")
        
        query += " ORDER BY created_at DESC LIMIT 100"
        
        rows = await self.pool.fetch(query, *params)
        print(f"DEBUG_DB: fetched {len(rows)} users (search='{search}')")
        return [dict(r) for r in rows]

    async def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        row = await self.pool.fetchrow("""
            SELECT u.user_id as id, u.username, u.created_at,
                   COALESCE(s.is_active = TRUE AND (s.expires_at IS NULL OR s.expires_at > NOW()), FALSE) as is_premium,
                   s.expires_at as premium_expires_at,
                   EXISTS(SELECT 1 FROM users WHERE user_id = u.user_id AND categories IS NULL) as is_banned
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.user_id
            WHERE u.user_id = $1
        """, user_id)
        if not row:
            return None

        user_data = dict(row)
        user_data['history'] = [
            {"date": user_data['created_at'], "event": "Регистрация"},
        ]
        if user_data['is_premium']:
            user_data['history'].append({"date": datetime.now(), "event": "Premium активен"})

        return user_data

    async def get_all_user_ids(self) -> List[int]:
        rows = await self.pool.fetch("SELECT user_id FROM users")
        return [r['user_id'] for r in rows]

    async def grant_premium(self, user_id: int, days: Optional[int] = None):
        """Grant premium to user. days=None means forever (no expiry)."""
        expires_at = None
        if days is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(days=days)

        try:
            await self.pool.execute("""
                INSERT INTO subscriptions (user_id, is_active, expires_at, activated_at, updated_at)
                VALUES ($1, TRUE, $2, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET 
                    is_active = TRUE,
                    expires_at = EXCLUDED.expires_at,
                    activated_at = COALESCE(subscriptions.activated_at, NOW()),
                    updated_at = NOW()
            """, user_id, expires_at)
        except Exception as e:
            print(f"DEBUG_DB: Error on grant_premium: {e}")

    async def revoke_premium(self, user_id: int):
        """Revoke premium from user."""
        await self.pool.execute("""
            UPDATE subscriptions 
            SET is_active = FALSE, expires_at = NULL, updated_at = NOW() 
            WHERE user_id = $1
        """, user_id)

    async def toggle_premium(self, user_id: int):
        """Legacy toggle — kept for backward compat."""
        exists = await self.pool.fetchval("SELECT 1 FROM subscriptions WHERE user_id = $1", user_id)
        if exists:
            await self.revoke_premium(user_id)
        else:
            await self.grant_premium(user_id)

    async def toggle_ban(self, user_id: int):
        # We don't have is_banned column, but we can store it somewhere or add column
        # For now, let's just log it or you can add the column later
        print(f"DEBUG_DB: Toggle ban for {user_id} - functionality needs specific DB column")

async def get_db_pool():
    import os
    from config import settings
    # Set small pool size to avoid TooManyConnectionsError on limited DB tiers
    return await asyncpg.create_pool(
        settings.DATABASE_URL,
        min_size=1,
        max_size=5
    )
