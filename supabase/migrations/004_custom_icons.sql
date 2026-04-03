-- ============================================================
-- Custom Pixel Icons
-- ============================================================

-- ---------- custom_icons ----------
create table if not exists custom_icons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  pixel_data  jsonb not null,        -- 16x16 grid as 2D array of 0/1
  name        text not null default 'Custom',
  created_at  timestamptz not null default now()
);

create index if not exists custom_icons_user
  on custom_icons (user_id, created_at desc);

alter table custom_icons disable row level security;

-- Allow 'pixel' as an icon_type on buckets
alter table buckets drop constraint if exists buckets_icon_type_check;
alter table buckets add constraint buckets_icon_type_check
  check (icon_type in ('icon', 'emoji', 'pixel'));
