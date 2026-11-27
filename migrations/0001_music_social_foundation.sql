-- Prodigy Noted foundational social competition schema.
-- Apply only after taking a database backup and reviewing existing duplicate votes.
-- This migration intentionally does not delete or rewrite legacy data.

DO $
BEGIN
  IF EXISTS (
    SELECT 1
    FROM votes
    WHERE user_id IS NOT NULL AND battle_id IS NOT NULL
    GROUP BY user_id, battle_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate member votes exist. Resolve duplicates before applying votes_user_battle_unique.';
  END IF;
END $;

CREATE UNIQUE INDEX IF NOT EXISTS votes_user_battle_unique ON votes(user_id, battle_id) WHERE user_id IS NOT NULL AND battle_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS artist_profiles (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name varchar(80),
  biography text,
  primary_genre_id varchar REFERENCES genres(id) ON DELETE SET NULL,
  cover_image_url text,
  website_url text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artist_follows (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artist_follows_no_self CHECK (follower_user_id <> artist_user_id),
  CONSTRAINT artist_follows_pair_unique UNIQUE (follower_user_id, artist_user_id)
);
CREATE INDEX IF NOT EXISTS artist_follows_artist_idx ON artist_follows(artist_user_id);

CREATE TABLE IF NOT EXISTS crews (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL,
  slug varchar(80) NOT NULL UNIQUE,
  description text,
  leader_user_id varchar NOT NULL REFERENCES users(id),
  avatar_url text,
  status varchar(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  experience_points integer NOT NULL DEFAULT 0 CHECK (experience_points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id varchar NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(16) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  status varchar(16) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'declined', 'removed')),
  invited_by_user_id varchar REFERENCES users(id),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crew_members_pair_unique UNIQUE (crew_id, user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS crew_one_active_leader_idx
  ON crew_members(crew_id) WHERE role = 'leader' AND status = 'active';
CREATE INDEX IF NOT EXISTS crew_members_user_idx ON crew_members(user_id, status);

CREATE TABLE IF NOT EXISTS battle_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id varchar NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  track_id varchar NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,
  submitted_by_user_id varchar NOT NULL REFERENCES users(id),
  side varchar(1) NOT NULL CHECK (side IN ('A', 'B')),
  duration_snapshot_seconds integer NOT NULL CHECK (duration_snapshot_seconds > 0),
  rights_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT battle_entries_side_unique UNIQUE (battle_id, side),
  CONSTRAINT battle_entries_track_unique UNIQUE (battle_id, track_id)
);
CREATE INDEX IF NOT EXISTS battle_entries_track_idx ON battle_entries(track_id);

CREATE TABLE IF NOT EXISTS battle_vote_assignments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id varchar NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(16) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'qualified', 'voted', 'expired', 'skipped')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT battle_vote_assignment_unique UNIQUE (battle_id, user_id)
);
CREATE INDEX IF NOT EXISTS battle_vote_assignments_user_status_idx ON battle_vote_assignments(user_id, status);

CREATE TABLE IF NOT EXISTS battle_listen_sessions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id varchar NOT NULL REFERENCES battle_vote_assignments(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  battle_id varchar NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  side varchar(1) NOT NULL CHECK (side IN ('A', 'B')),
  duration_snapshot_seconds integer NOT NULL CHECK (duration_snapshot_seconds > 0),
  qualified_listened_seconds integer NOT NULL DEFAULT 0 CHECK (qualified_listened_seconds >= 0),
  session_token_hash varchar NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at timestamptz,
  qualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS battle_listen_sessions_assignment_idx ON battle_listen_sessions(assignment_id, side);

CREATE TABLE IF NOT EXISTS battle_listen_segments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  listen_session_id varchar NOT NULL REFERENCES battle_listen_sessions(id) ON DELETE CASCADE,
  sequence_number integer NOT NULL CHECK (sequence_number > 0),
  media_start_second integer NOT NULL CHECK (media_start_second >= 0),
  media_end_second integer NOT NULL CHECK (media_end_second > media_start_second),
  received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listen_segment_sequence_unique UNIQUE (listen_session_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS user_competition_progress (
  user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  experience_points integer NOT NULL DEFAULT 0 CHECK (experience_points >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_cycles (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  tier varchar(16) NOT NULL CHECK (tier IN ('regular', 'vip')),
  cycle_number integer NOT NULL CHECK (cycle_number > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  required_votes integer NOT NULL CHECK (required_votes IN (1, 3, 5)),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT competition_cycle_tier_number_unique UNIQUE (tier, cycle_number),
  CONSTRAINT competition_cycle_dates_valid CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS seasons (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  season_year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  status varchar(16) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'active', 'completed', 'cancelled')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  rules_version varchar(32) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT season_year_quarter_unique UNIQUE (season_year, quarter),
  CONSTRAINT season_dates_valid CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS season_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id varchar NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  artist_user_id varchar NOT NULL REFERENCES users(id),
  points integer NOT NULL DEFAULT 0,
  placement integer,
  qualified_for_championship boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT season_artist_unique UNIQUE (season_id, artist_user_id)
);
CREATE INDEX IF NOT EXISTS season_entries_ranking_idx ON season_entries(season_id, points DESC);

CREATE TABLE IF NOT EXISTS moderation_cases (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id varchar REFERENCES users(id) ON DELETE SET NULL,
  subject_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type varchar(24) NOT NULL CHECK (target_type IN ('comment', 'track', 'profile', 'message', 'crew', 'battle')),
  target_id varchar NOT NULL,
  reason_code varchar(32) NOT NULL,
  description text,
  status varchar(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'appealed', 'closed')),
  enforcement_action varchar(24) CHECK (enforcement_action IN ('none', 'warning', 'temporary_suspension', 'competition_suspension', 'permanent_ban')),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  moderator_user_id varchar REFERENCES users(id) ON DELETE SET NULL,
  decision_reason text,
  appealed_at timestamptz,
  appeal_decision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS moderation_cases_subject_idx ON moderation_cases(subject_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_cases_status_idx ON moderation_cases(status, created_at);

CREATE TABLE IF NOT EXISTS studio_projects (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crew_id varchar REFERENCES crews(id) ON DELETE SET NULL,
  title varchar(120) NOT NULL,
  project_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility varchar(16) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'crew', 'unlisted')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_projects_owner_updated_idx ON studio_projects(owner_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS studio_project_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id varchar NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(16) NOT NULL CHECK (role IN ('viewer', 'editor', 'producer')),
  invited_by_user_id varchar REFERENCES users(id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT studio_project_member_unique UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id varchar PRIMARY KEY,
  event_type varchar(120) NOT NULL,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payout_ledger_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id),
  source_type varchar(24) NOT NULL CHECK (source_type IN ('prize', 'referral', 'royalty', 'adjustment', 'reversal')),
  source_id varchar NOT NULL,
  amount_cents numeric(18,0) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  status varchar(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'reversed', 'rejected')),
  idempotency_key varchar NOT NULL UNIQUE,
  approved_by_user_id varchar REFERENCES users(id),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payout_ledger_user_status_idx ON payout_ledger_entries(user_id, status, created_at DESC);
