"""
Run this script once on the server to apply the migration.
It uses asyncpg (already installed) so psql is not needed.

Usage:
    cd ~/telegramminiapp/backend
    python3 migrate.py
"""
import asyncio
import asyncpg
import sys
import os

# Load .env manually (no python-dotenv needed)
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

SQL = """
-- Add expires_at column to subscriptions (safe: does nothing if already exists)
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
"""

async def main():
    print(f"Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Running migration...")
        await conn.execute(SQL)
        print("✅  Migration applied successfully!")

        # Try to add UNIQUE constraint (needed for ON CONFLICT upsert)
        try:
            await conn.execute(
                "ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);"
            )
            print("✅  UNIQUE constraint added on subscriptions.user_id")
        except Exception as e:
            msg = str(e)
            if "already exists" in msg or "already has constraint" in msg:
                print("ℹ️   UNIQUE constraint already exists — skipping")
            else:
                print(f"⚠️   Could not add UNIQUE constraint: {e}")

    finally:
        await conn.close()

asyncio.run(main())
