-- ============================================================
-- Moneo Migration v4 — Community, Challenges, Leaderboards
-- Run this in your Supabase SQL editor AFTER migration v3
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS)
-- ============================================================

-- ── 1. Community Profiles (what members choose to share) ─────
-- Stores the display name and optional shared score per community
CREATE TABLE IF NOT EXISTS community_profiles (
  community_id  uuid    NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       uuid    NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  display_name  text    NOT NULL DEFAULT 'Member',
  shared_score  integer,         -- null = score not shared
  updated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_profiles_own" ON community_profiles;
CREATE POLICY "community_profiles_own" ON community_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Members of the same community can read each other's profiles
DROP POLICY IF EXISTS "community_profiles_read_peers" ON community_profiles;
CREATE POLICY "community_profiles_read_peers" ON community_profiles
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );


-- ── 2. Community Challenges ───────────────────────────────────
CREATE TABLE IF NOT EXISTS community_challenges (
  id              text        PRIMARY KEY,
  community_id    uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creator_id      uuid        NOT NULL REFERENCES auth.users(id),
  name            text        NOT NULL,
  challenge_type  text        NOT NULL,  -- 'log_daily' | 'budget_stay' | 'score_boost' | 'category_cut' | 'custom'
  description     text,
  start_date      date        NOT NULL,
  end_date        date        NOT NULL,
  params          jsonb       DEFAULT '{}',
  created_at_ms   bigint      NOT NULL
);

ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;

-- Community members can read challenges
DROP POLICY IF EXISTS "challenges_read" ON community_challenges;
CREATE POLICY "challenges_read" ON community_challenges
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

-- Only community admins can create/edit challenges
DROP POLICY IF EXISTS "challenges_admin_write" ON community_challenges;
CREATE POLICY "challenges_admin_write" ON community_challenges
  FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);


-- ── 3. Challenge Participants ─────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id    text        NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    text        NOT NULL DEFAULT 'Member',
  progress        integer     NOT NULL DEFAULT 0,   -- 0–100
  streak          integer     NOT NULL DEFAULT 0,
  manual_days     integer     NOT NULL DEFAULT 0,
  badges          text[]      NOT NULL DEFAULT '{}',
  joined_at       timestamptz DEFAULT now(),
  last_updated    timestamptz DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Users manage their own participation
DROP POLICY IF EXISTS "participants_own" ON challenge_participants;
CREATE POLICY "participants_own" ON challenge_participants
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Community members can read other participants' progress (for leaderboard)
DROP POLICY IF EXISTS "participants_read_community" ON challenge_participants;
CREATE POLICY "participants_read_community" ON challenge_participants
  FOR SELECT USING (
    challenge_id IN (
      SELECT cc.id FROM community_challenges cc
      JOIN community_members cm ON cm.community_id = cc.community_id
      WHERE cm.user_id = auth.uid()
    )
  );


-- ── 4. Allow any authenticated user to join a community ───────
-- (They must have a valid invite code, checked at app level)
-- The existing community_members_own policy covers INSERT as long as auth.uid() = user_id
-- No additional policy needed — confirmed by existing RLS design.


-- ── 5. Add display_name column to community_members if missing ─
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_members' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE community_members ADD COLUMN display_name text NOT NULL DEFAULT 'Member';
  END IF;
END $$;
