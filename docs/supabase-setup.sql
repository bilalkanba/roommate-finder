-- =====================================================================
-- Supabase SQL setup for Roommate Finder AI
-- =====================================================================
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- to create the profiles table with proper Row Level Security (RLS).
--
-- Important: RLS is MANDATORY on Supabase for any user-facing table.
-- Without it, anyone with the anon key could read/write any row.
-- =====================================================================

-- ===== ENUMS =====
-- We mirror the Python enums as Postgres enums for type safety at DB level

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');

CREATE TYPE lifestyle_level_enum AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');

CREATE TYPE sleep_schedule_enum AS ENUM ('early_bird', 'normal', 'night_owl', 'irregular');

CREATE TYPE social_level_enum AS ENUM ('very_private', 'balanced', 'very_social');

CREATE TYPE smoking_preference_enum AS ENUM ('no_smoking', 'ok_outside', 'indoor_ok');

CREATE TYPE pets_preference_enum AS ENUM ('no_pets', 'has_pet', 'ok_with_pets');


-- ===== PROFILES TABLE =====

CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identity
    full_name       VARCHAR(100) NOT NULL,
    age             INTEGER NOT NULL CHECK (age BETWEEN 18 AND 100),
    gender          gender_enum NOT NULL,
    bio             TEXT,
    photo_url       VARCHAR(500),

    -- Location & budget
    target_city         VARCHAR(100) NOT NULL,
    target_country      VARCHAR(100) NOT NULL,
    budget_min_eur      INTEGER NOT NULL CHECK (budget_min_eur BETWEEN 100 AND 10000),
    budget_max_eur      INTEGER NOT NULL CHECK (budget_max_eur BETWEEN 100 AND 10000),
    move_in_date        DATE NOT NULL,
    lease_duration_months INTEGER NOT NULL CHECK (lease_duration_months BETWEEN 1 AND 60),

    CHECK (budget_max_eur >= budget_min_eur),

    -- 7 matching dimensions
    cleanliness         lifestyle_level_enum NOT NULL,
    sleep_schedule      sleep_schedule_enum NOT NULL,
    social_level        social_level_enum NOT NULL,
    noise_tolerance     lifestyle_level_enum NOT NULL,
    smoking             smoking_preference_enum NOT NULL,
    pets                pets_preference_enum NOT NULL,
    guests_frequency    lifestyle_level_enum NOT NULL,

    -- Extras
    languages_spoken    VARCHAR(10)[] NOT NULL DEFAULT '{}',
    occupation          VARCHAR(100),

    -- State
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast filtering during matching queries
CREATE INDEX idx_profiles_city ON profiles (target_city);
CREATE INDEX idx_profiles_country ON profiles (target_country);
CREATE INDEX idx_profiles_move_in ON profiles (move_in_date);
CREATE INDEX idx_profiles_active ON profiles (is_active) WHERE is_active = TRUE;


-- ===== AUTO-UPDATE updated_at =====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===== ROW LEVEL SECURITY =====
-- This is the most important part. Without RLS, the anon key exposes everything.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Any authenticated user can READ any active profile
-- (needed for the matching feature)
CREATE POLICY "Active profiles are readable by authenticated users"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Policy 2: Users can INSERT their own profile (only one, enforced by UNIQUE on user_id)
CREATE POLICY "Users can create their own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE only their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE only their own profile
-- (though in practice we use soft-delete via is_active=false)
CREATE POLICY "Users can delete their own profile"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Note: the backend uses the SERVICE_ROLE key, which BYPASSES RLS.
-- This is intentional: the backend does its own auth checks via JWT validation.
-- Only the frontend (using the anon key) is subject to these RLS policies.
