-- ClipPilot — Supabase/Postgres schema
-- Source of truth for state + job queue (see docs/02-architecture.md).
-- Apply in the Supabase SQL editor (or `supabase db push`).

-- ───────────────────────── enums ─────────────────────────
do $$ begin
  create type stream_status as enum ('idle','live','offline','reconnecting','error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type monitor_state as enum ('stopped','monitoring','paused');
exception when duplicate_object then null; end $$;

do $$ begin
  -- the clip lifecycle state machine (docs/02-architecture.md §4)
  create type clip_status as enum (
    'detected','clipping','editing','pending_review',
    'approved','queued_for_upload','uploading','published',
    'rejected','failed','dead_letter'
  );
exception when duplicate_object then null; end $$;

-- ───────────────────────── connected YouTube channels ─────────────────────────
create table if not exists accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  channel_id    text not null,                 -- YouTube channel id
  channel_title text,
  thumbnail_url text,
  -- OAuth tokens live ONLY server-side; RLS denies client reads of these columns' table rows except owner.
  refresh_token text,                          -- encrypted at rest by Supabase; never sent to browser
  scopes        text[],
  created_at    timestamptz not null default now(),
  unique (user_id, channel_id)
);

-- ───────────────────────── monitored streams ─────────────────────────
create table if not exists streams (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  url             text not null,
  title           text,
  source_channel  text,
  dest_account_id uuid references accounts(id) on delete set null,  -- where clips publish
  status          stream_status not null default 'idle',
  monitor         monitor_state not null default 'stopped',
  clip_seconds    int not null default 20,     -- 15/20/30/45/custom
  weights         jsonb not null default '{"chat":1.0,"audio":1.0,"scene":0.5,"context":1.0}',
  last_seen_live  timestamptz,
  created_at      timestamptz not null default now()
);

-- ───────────────────────── generated clips ─────────────────────────
create table if not exists clips (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  stream_id       uuid not null references streams(id) on delete cascade,
  status          clip_status not null default 'detected',
  source_url      text,                         -- original stream URL
  source_ts       numeric,                      -- seconds into stream of the moment
  viral_score     numeric,
  signals         jsonb,                        -- {chat, audio, scene, context} breakdown
  title           text,
  description     text,
  hashtags        text[],
  hook            text,
  why_selected    text,
  video_path      text,                         -- Supabase Storage key of the .mp4
  thumb_path      text,
  duration        numeric,
  dedup_key       text,                         -- time+text hash to avoid duplicate clips
  idempotency_key text unique,                  -- prevents double YouTube upload
  youtube_video_id text,
  youtube_url     text,
  error           text,
  retry_count     int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists clips_status_idx  on clips (status);
create index if not exists clips_stream_idx  on clips (stream_id);
create unique index if not exists clips_dedup_idx on clips (stream_id, dedup_key) where dedup_key is not null;

-- ───────────────────────── per-user settings ─────────────────────────
create table if not exists settings (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  publish_mode       text not null default 'approve_first',  -- 'approve_first' | 'auto'
  max_uploads_per_day int not null default 6,
  default_privacy    text not null default 'private',        -- private until Google verification
  default_hashtags   text[] not null default '{"#shorts"}',
  auto_clip_enabled  boolean not null default true,
  auto_publish_enabled boolean not null default false,
  telegram_chat_id   text,
  updated_at         timestamptz not null default now()
);

-- ───────────────────────── worker heartbeat ─────────────────────────
create table if not exists heartbeat (
  worker_id   text primary key,
  last_beat   timestamptz not null default now(),
  info        jsonb
);

-- ───────────────────────── trigger: keep clips.updated_at fresh ─────────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

drop trigger if exists clips_touch on clips;
create trigger clips_touch before update on clips
  for each row execute function touch_updated_at();

-- ───────────────────────── Row-Level Security ─────────────────────────
alter table accounts enable row level security;
alter table streams  enable row level security;
alter table clips    enable row level security;
alter table settings enable row level security;

do $$ begin
  create policy own_accounts on accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy own_streams  on streams  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy own_clips    on clips    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy own_settings on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Note: the worker connects with the service-role key and bypasses RLS by design.
-- The browser/dashboard uses the anon key and is fully constrained by the policies above.
