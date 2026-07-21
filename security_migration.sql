-- ================================================================
-- ClubHub Security Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Add token_version to users table
--    Used by authMiddleware to invalidate old JWTs on password change.
--    Default 0 for all existing users.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────────
-- 2. Create password_resets table
--    Stores SHA-256 hashed, expiring, single-use reset tokens.
--    Raw tokens are NEVER stored — only their SHA-256 hash.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by token_hash during reset validation
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash
    ON password_resets (token_hash);

-- Index for cleanup queries (delete expired/used records)
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
    ON password_resets (user_id);

-- ────────────────────────────────────────────────────────────────
-- 3. Enable Row Level Security (RLS) on password_resets
--    RLS is REQUIRED — this table must never be accessible via
--    anon or authenticated Supabase client keys (frontend JS).
--    Only the backend server (using service_role key) can access it.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Allow backend (service_role) full access.
-- service_role bypasses RLS by default in Supabase — no explicit
-- policy needed for it. The policies below DENY everything else.

-- Explicitly deny anon users from reading reset tokens
CREATE POLICY "deny_anon_select" ON password_resets
    FOR SELECT TO anon USING (false);

-- Explicitly deny anon users from inserting reset tokens
CREATE POLICY "deny_anon_insert" ON password_resets
    FOR INSERT TO anon WITH CHECK (false);

-- Explicitly deny authenticated (client-side) users from reading
-- other users' reset tokens via the JS client
CREATE POLICY "deny_authenticated_select" ON password_resets
    FOR SELECT TO authenticated USING (false);

-- Explicitly deny authenticated users from inserting via JS client
CREATE POLICY "deny_authenticated_insert" ON password_resets
    FOR INSERT TO authenticated WITH CHECK (false);

-- ────────────────────────────────────────────────────────────────
-- 4. Optional: Auto-cleanup expired reset tokens (runs daily)
--    Requires pg_cron extension enabled in Supabase (Dashboard →
--    Database → Extensions → pg_cron).
--    If pg_cron is not available, tokens are cleaned up per-request
--    in the /forgot-password route (old tokens deleted before insert).
-- ────────────────────────────────────────────────────────────────
-- SELECT cron.schedule(
--     'cleanup-expired-reset-tokens',
--     '0 3 * * *',  -- runs at 3am daily
--     $$DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE$$
-- );
