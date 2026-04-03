-- ============================================================
-- Spend Bucket Waitlist
-- ============================================================

create table if not exists spend_bucket_waitlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table spend_bucket_waitlist disable row level security;
