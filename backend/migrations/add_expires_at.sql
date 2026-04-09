-- Migration: add expires_at to subscriptions table
-- Run this ONCE on your database

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add unique constraint on user_id if it doesn't exist 
-- (needed for ON CONFLICT in grant_premium)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'subscriptions_user_id_key'
        AND conrelid = 'subscriptions'::regclass
    ) THEN
        -- Only add if user_id is not already a primary key
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION WHEN others THEN
    NULL; -- already constrained
END;
$$;
