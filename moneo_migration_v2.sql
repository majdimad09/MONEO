-- Moneo v2 migration: add age, status, language, onboarded to profiles
-- Run this in your Supabase SQL editor before deploying the new app.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age      integer,
  ADD COLUMN IF NOT EXISTS status   text    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS language text    NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;
