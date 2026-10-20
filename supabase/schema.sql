-- ============================================================
-- endorphix — Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL Editor or via psql.
-- Requires PostGIS extension (available on Supabase by default).
-- ============================================================


-- ───────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ───────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- fuzzy text search on facility names


-- ───────────────────────────────────────────────────────────
-- 1. ENUMS
-- ───────────────────────────────────────────────────────────

CREATE TYPE sport_category AS ENUM (
  'running', 'cycling', 'swimming', 'yoga', 'crossfit',
  'tennis', 'climbing', 'martial_arts', 'football', 'basketball',
  'gym', 'hiking', 'pilates', 'rowing', 'other'
);

CREATE TYPE activity_type AS ENUM (
  'run', 'cycle', 'swim', 'lift', 'yoga',
  'hike', 'climb', 'court', 'recovery', 'other'
);


-- ───────────────────────────────────────────────────────────
-- 2. USERS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT NOT NULL UNIQUE,
  username           TEXT NOT NULL UNIQUE
                       CHECK (length(username) BETWEEN 3 AND 30),
  avatar_url         TEXT,
  -- PostGIS geography point (SRID 4326 = WGS84)
  location           GEOGRAPHY(POINT, 4326),
  streak_current     INTEGER NOT NULL DEFAULT 0,
  streak_longest     INTEGER NOT NULL DEFAULT 0,
  lifetime_sessions  INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index for fast radius queries on user location
CREATE INDEX IF NOT EXISTS users_location_gist
  ON public.users USING GIST (location);

-- Full-text index on username for search
CREATE INDEX IF NOT EXISTS users_username_trgm
  ON public.users USING GIN (username gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ───────────────────────────────────────────────────────────
-- 3. FACILITIES
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.facilities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  address          TEXT NOT NULL,
  -- PostGIS geography point
  location         GEOGRAPHY(POINT, 4326) NOT NULL,
  primary_sports   sport_category[] NOT NULL DEFAULT '{}',
  secondary_sports sport_category[] NOT NULL DEFAULT '{}',
  rating           NUMERIC(3, 2) NOT NULL DEFAULT 0.00
                     CHECK (rating BETWEEN 0 AND 5),
  review_count     INTEGER NOT NULL DEFAULT 0,
  -- JSONB timetable: { monday: {open, close}, ... }
  timetable        JSONB NOT NULL DEFAULT '{}',
  phone            TEXT,
  website          TEXT,
  -- Array of public image URLs (Google Places / OSM)
  images           TEXT[] NOT NULL DEFAULT '{}',
  google_place_id  TEXT UNIQUE,
  osm_id           TEXT UNIQUE,
  is_live          BOOLEAN NOT NULL DEFAULT FALSE,
  live_count       INTEGER NOT NULL DEFAULT 0,
  price_level      SMALLINT CHECK (price_level BETWEEN 0 AND 4),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary spatial index — essential for ST_DWithin radius queries
CREATE INDEX IF NOT EXISTS facilities_location_gist
  ON public.facilities USING GIST (location);

-- GIN index on sport arrays for efficient ANY(primary_sports) queries
CREATE INDEX IF NOT EXISTS facilities_primary_sports_gin
  ON public.facilities USING GIN (primary_sports);

-- Trgm index for fuzzy name search
CREATE INDEX IF NOT EXISTS facilities_name_trgm
  ON public.facilities USING GIN (name gin_trgm_ops);

-- Composite index for Spark queries (rating DESC)
CREATE INDEX IF NOT EXISTS facilities_rating_idx
  ON public.facilities (rating DESC);

CREATE TRIGGER facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ───────────────────────────────────────────────────────────
-- 4. ENDORPHIN LOGS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.endorphin_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type    activity_type NOT NULL,
  energy_score     SMALLINT NOT NULL
                     CHECK (energy_score BETWEEN 1 AND 100),
  duration_minutes SMALLINT CHECK (duration_minutes > 0),
  facility_id      UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  notes            TEXT,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time-series index — essential for chronological energy wave queries
CREATE INDEX IF NOT EXISTS endorphin_logs_user_time_idx
  ON public.endorphin_logs (user_id, logged_at DESC);

-- BRIN index for large time-series scans
CREATE INDEX IF NOT EXISTS endorphin_logs_logged_at_brin
  ON public.endorphin_logs USING BRIN (logged_at);


-- ───────────────────────────────────────────────────────────
-- 5. POSTGIS FUNCTIONS
-- ───────────────────────────────────────────────────────────

-- 5a. facilities_within_radius
--     Returns facilities within radius_meters of (lat, lng),
--     optionally filtered by sport. Ordered by distance ASC.

CREATE OR REPLACE FUNCTION public.facilities_within_radius(
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  radius_meters  DOUBLE PRECISION,
  sport_filter   TEXT DEFAULT NULL
)
RETURNS TABLE (
  id               UUID,
  name             TEXT,
  description      TEXT,
  address          TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  primary_sports   sport_category[],
  secondary_sports sport_category[],
  rating           NUMERIC,
  review_count     INTEGER,
  timetable        JSONB,
  phone            TEXT,
  website          TEXT,
  images           TEXT[],
  google_place_id  TEXT,
  osm_id           TEXT,
  is_live          BOOLEAN,
  live_count       INTEGER,
  price_level      SMALLINT,
  distance_meters  DOUBLE PRECISION,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  origin GEOGRAPHY;
BEGIN
  origin := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY;

  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.description,
    f.address,
    ST_Y(f.location::GEOMETRY)   AS lat,
    ST_X(f.location::GEOMETRY)   AS lng,
    f.primary_sports,
    f.secondary_sports,
    f.rating,
    f.review_count,
    f.timetable,
    f.phone,
    f.website,
    f.images,
    f.google_place_id,
    f.osm_id,
    f.is_live,
    f.live_count,
    f.price_level,
    ST_Distance(f.location, origin) AS distance_meters,
    f.created_at,
    f.updated_at
  FROM public.facilities f
  WHERE
    ST_DWithin(f.location, origin, radius_meters)
    AND (
      sport_filter IS NULL
      OR sport_filter::sport_category = ANY(f.primary_sports)
      OR sport_filter::sport_category = ANY(f.secondary_sports)
    )
  ORDER BY distance_meters ASC;
END;
$$;


-- 5b. spark_facilities
--     Returns a random selection of top-rated facilities (rating >= min_rating)
--     within radius. Shuffled for "Surprise Me" effect.

CREATE OR REPLACE FUNCTION public.spark_facilities(
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  radius_meters  DOUBLE PRECISION,
  min_rating     DOUBLE PRECISION DEFAULT 4.5
)
RETURNS TABLE (
  id               UUID,
  name             TEXT,
  description      TEXT,
  address          TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  primary_sports   sport_category[],
  secondary_sports sport_category[],
  rating           NUMERIC,
  review_count     INTEGER,
  timetable        JSONB,
  phone            TEXT,
  website          TEXT,
  images           TEXT[],
  google_place_id  TEXT,
  osm_id           TEXT,
  is_live          BOOLEAN,
  live_count       INTEGER,
  price_level      SMALLINT,
  distance_meters  DOUBLE PRECISION,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE  -- VOLATILE because of RANDOM()
AS $$
DECLARE
  origin GEOGRAPHY;
BEGIN
  origin := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY;

  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.description,
    f.address,
    ST_Y(f.location::GEOMETRY)   AS lat,
    ST_X(f.location::GEOMETRY)   AS lng,
    f.primary_sports,
    f.secondary_sports,
    f.rating,
    f.review_count,
    f.timetable,
    f.phone,
    f.website,
    f.images,
    f.google_place_id,
    f.osm_id,
    f.is_live,
    f.live_count,
    f.price_level,
    ST_Distance(f.location, origin) AS distance_meters,
    f.created_at,
    f.updated_at
  FROM public.facilities f
  WHERE
    ST_DWithin(f.location, origin, radius_meters)
    AND f.rating >= min_rating
  ORDER BY RANDOM()
  LIMIT 10;
END;
$$;


-- ───────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorphin_logs ENABLE ROW LEVEL SECURITY;

-- Users: each user can only read/write their own row
CREATE POLICY "users_self_select"  ON public.users
  FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "users_self_update"  ON public.users
  FOR UPDATE  USING (auth.uid() = id);
CREATE POLICY "users_self_insert"  ON public.users
  FOR INSERT  WITH CHECK (auth.uid() = id);

-- Facilities: public read, admin-only write (manage via service role)
CREATE POLICY "facilities_public_read" ON public.facilities
  FOR SELECT USING (true);

-- Endorphin logs: scoped to authenticated owner
CREATE POLICY "logs_owner_select" ON public.endorphin_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_owner_insert" ON public.endorphin_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_owner_update" ON public.endorphin_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logs_owner_delete" ON public.endorphin_logs
  FOR DELETE USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────
-- 7. REALTIME
-- ───────────────────────────────────────────────────────────

-- Enable Supabase Realtime on facilities (for LIVE NOW badges)
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;
-- Enable on endorphin_logs for live energy feed (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.endorphin_logs;


-- ───────────────────────────────────────────────────────────
-- 8. STREAK UPDATE TRIGGER
-- ───────────────────────────────────────────────────────────
-- Auto-increments streak_current and lifetime_sessions on new log

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  last_log_date DATE;
  today_date    DATE;
BEGIN
  today_date := (NEW.logged_at AT TIME ZONE 'UTC')::DATE;

  SELECT (logged_at AT TIME ZONE 'UTC')::DATE
  INTO last_log_date
  FROM public.endorphin_logs
  WHERE user_id = NEW.user_id
    AND id != NEW.id
  ORDER BY logged_at DESC
  LIMIT 1;

  UPDATE public.users
  SET
    lifetime_sessions = lifetime_sessions + 1,
    streak_current = CASE
      -- Same day as last log → no streak change
      WHEN last_log_date = today_date            THEN streak_current
      -- Consecutive day → increment streak
      WHEN last_log_date = today_date - INTERVAL '1 day'
                                                 THEN streak_current + 1
      -- Gap → reset to 1
      ELSE 1
    END,
    streak_longest = GREATEST(
      streak_longest,
      CASE
        WHEN last_log_date = today_date - INTERVAL '1 day'
             THEN streak_current + 1
        ELSE streak_longest
      END
    )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER endorphin_log_streak
  AFTER INSERT ON public.endorphin_logs
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();


-- ───────────────────────────────────────────────────────────
-- DONE
-- ───────────────────────────────────────────────────────────
-- Schema summary:
--   public.users          — athlete profiles with PostGIS location
--   public.facilities     — athletic venues with spatial index
--   public.endorphin_logs — somatic energy time-series
--   facilities_within_radius() — ST_DWithin radius RPC
--   spark_facilities()         — top-rated random Spark RPC
-- ───────────────────────────────────────────────────────────
