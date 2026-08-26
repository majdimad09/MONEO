-- ============================================================
-- Moneo Migration v3 — Stage 1 Feature Additions
-- Run this in your Supabase SQL editor BEFORE deploying
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ── 1. Memberships (Premium) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan        text        NOT NULL DEFAULT 'free',   -- 'free' | 'premium'
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memberships_own" ON memberships;
CREATE POLICY "memberships_own" ON memberships
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 2. Recurring Income ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_income (
  id                 text        PRIMARY KEY,
  user_id            uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text        NOT NULL,
  amount             numeric     NOT NULL,
  frequency          text        NOT NULL DEFAULT 'monthly',  -- 'weekly' | 'biweekly' | 'monthly'
  next_payment_date  date        NOT NULL,
  is_active          boolean     NOT NULL DEFAULT true,
  category           text        NOT NULL DEFAULT 'Salary',
  notes              text,
  created_at_ms      bigint      NOT NULL
);

ALTER TABLE recurring_income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recurring_income_own" ON recurring_income;
CREATE POLICY "recurring_income_own" ON recurring_income
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 3. Score History (future use) ────────────────────────────
CREATE TABLE IF NOT EXISTS score_history (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score       integer     NOT NULL,
  month       text        NOT NULL,   -- 'YYYY-MM'
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_history_own" ON score_history;
CREATE POLICY "score_history_own" ON score_history
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 4. Communities (Stage 2 — created now for architecture) ──
CREATE TABLE IF NOT EXISTS communities (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text        NOT NULL,
  description  text,
  invite_code  text        UNIQUE NOT NULL,
  creator_id   uuid        NOT NULL REFERENCES auth.users(id),
  privacy      text        NOT NULL DEFAULT 'invite',  -- 'public' | 'invite'
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "communities_read" ON communities;
CREATE POLICY "communities_read" ON communities
  FOR SELECT USING (true);  -- anyone can read community names/codes

DROP POLICY IF EXISTS "communities_creator_write" ON communities;
CREATE POLICY "communities_creator_write" ON communities
  FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);


-- ── 5. Community Members ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id  uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text        NOT NULL DEFAULT 'member',  -- 'admin' | 'member'
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_members_own" ON community_members;
CREATE POLICY "community_members_own" ON community_members
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_members_read_same_community" ON community_members;
CREATE POLICY "community_members_read_same_community" ON community_members
  FOR SELECT
  USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );


-- ── 6. Community Privacy Settings ────────────────────────────
CREATE TABLE IF NOT EXISTS community_privacy (
  user_id                  uuid     PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  show_score               boolean  NOT NULL DEFAULT true,
  show_score_improvement   boolean  NOT NULL DEFAULT true,
  show_budget_performance  boolean  NOT NULL DEFAULT false,
  show_streak              boolean  NOT NULL DEFAULT true,
  show_goal_progress       boolean  NOT NULL DEFAULT false,
  show_profile_name        boolean  NOT NULL DEFAULT true,
  appear_on_leaderboards   boolean  NOT NULL DEFAULT true
);

ALTER TABLE community_privacy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_privacy_own" ON community_privacy;
CREATE POLICY "community_privacy_own" ON community_privacy
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
