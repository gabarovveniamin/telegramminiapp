import asyncpg
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from config import settings

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=2,
                max_size=10,
                command_timeout=60,
            )
            logger.info("Database connection pool created.")

    async def disconnect(self):
        if self._pool:
            await self._pool.close()
            self._pool = None

    @property
    def pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database not connected.")
        return self._pool

    # --- Stats ---
    async def get_stats(self) -> Dict[str, Any]:
        total_users = await self.pool.fetchval("SELECT COUNT(*) FROM users")
        active_premium = await self.pool.fetchval("SELECT COUNT(*) FROM subscriptions")
        # We'll use a placeholder for these if they don't exist in DB yet
        return {
            "total_users": total_users or 0,
            "active_premium": active_premium or 0,
            "daily_new_users": 0,
            "total_broadcasts": 0
        }

    # --- User Management ---
    async def get_users(self):
        # We use username as first_name because your DB doesn't have first_name column
        rows = await self.pool.fetch("""
            SELECT user_id as id, username, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 100
        """)
        return [dict(r) for r in rows]

    async def get_user(self, user_id: int):
        row = await self.pool.fetchrow("""
            SELECT u.user_id as id, u.username, u.created_at, 
                   EXISTS(SELECT 1 FROM subscriptions s WHERE s.user_id = u.user_id) as is_premium
            FROM users u WHERE u.user_id = $1
        """, user_id)
        return dict(row) if row else None

    async def search_users(self, query: str = "", limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        sql = """
            SELECT u.user_id as id, u.username, u.created_at, u.discount_threshold, 
                   s.is_active, s.expires_at, s.stars_paid
            FROM users u
            LEFT JOIN subscriptions s ON u.user_id = s.user_id
            WHERE ($1 = '' OR u.username ILIKE '%' || $1 || '%' OR u.user_id::TEXT LIKE '%' || $1 || '%')
            ORDER BY u.created_at DESC
            LIMIT $2 OFFSET $3
        """
        rows = await self.pool.fetch(sql, query, limit, offset)
        return [dict(row) for row in rows]

    async def get_user_details(self, user_id: int) -> Optional[Dict[str, Any]]:
        row = await self.pool.fetchrow("""
            SELECT u.*, s.is_active, s.expires_at, s.stars_paid, s.activated_at
            FROM users u
            LEFT JOIN subscriptions s ON u.user_id = s.user_id
            WHERE u.user_id = $1
        """, user_id)
        if not row: return None
        
        # Get tracked items
        items = await self.pool.fetch("SELECT * FROM tracked_items WHERE user_id = $1", user_id)
        # Get referrals
        referrals = await self.pool.fetch("SELECT r.*, u.username FROM referrals r LEFT JOIN users u ON r.referred_id = u.user_id WHERE r.referrer_id = $1", user_id)
        
        data = dict(row)
        data["tracked_items"] = [dict(i) for i in items]
        data["referrals"] = [dict(r) for r in referrals]
        return data

    async def toggle_premium(self, user_id: int, days: Optional[int] = None):
        """If days is provided, add that many days. If None, it's permanent."""
        if days:
            await self.pool.execute("""
                INSERT INTO subscriptions (user_id, is_active, expires_at, activated_at, updated_at)
                VALUES ($1, TRUE, NOW() + ($2 || ' days')::INTERVAL, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    is_active = TRUE,
                    expires_at = GREATEST(subscriptions.expires_at, NOW()) + ($2 || ' days')::INTERVAL,
                    updated_at = NOW()
            """, user_id, str(days))
        else:
            await self.pool.execute("""
                INSERT INTO subscriptions (user_id, is_active, expires_at, activated_at, updated_at)
                VALUES ($1, TRUE, NULL, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    is_active = TRUE,
                    expires_at = NULL,
                    updated_at = NOW()
            """, user_id)

    async def deactivate_premium(self, user_id: int):
        await self.pool.execute("UPDATE subscriptions SET is_active = FALSE, expires_at = NOW() WHERE user_id = $1", user_id)

db = Database()
