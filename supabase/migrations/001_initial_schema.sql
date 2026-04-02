-- ============================================================
-- Zuma App — Initial Schema
-- ============================================================
-- NOTE: RLS is disabled during development (no auth yet).
-- MUST enable RLS + add proper policies before production.
-- ============================================================

-- ---------- profiles ----------
create table if not exists profiles (
  id          uuid primary key,  -- will reference auth.users(id) when auth is added
  full_name   text,
  email       text,
  phone       text,
  date_of_birth date,
  avatar_url  text,
  auth_provider text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles disable row level security;

-- ---------- buckets ----------
create table if not exists buckets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  name            text not null,
  icon            text not null default 'Wallet',
  icon_type       text not null default 'icon' check (icon_type in ('icon', 'emoji')),
  color_key       text not null default 'neutral',
  custom_color    text,  -- hex value when color_key = 'custom'
  current_amount  bigint not null default 0,  -- cents
  target_amount   bigint not null default 0,  -- cents
  is_main         boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Only one main bucket per user
create unique index if not exists buckets_one_main_per_user
  on buckets (user_id) where (is_main = true);

create index if not exists buckets_user_order
  on buckets (user_id, sort_order);

alter table buckets disable row level security;

-- ---------- transactions ----------
create table if not exists transactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  bucket_id         uuid references buckets(id) on delete set null,
  type              text not null check (type in (
                      'deposit', 'withdrawal', 'transfer_in', 'transfer_out',
                      'bucket_created', 'auto_deposit'
                    )),
  amount            bigint not null default 0,  -- cents, always positive
  description       text not null default '',
  related_bucket_id uuid references buckets(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists transactions_user_date
  on transactions (user_id, created_at desc);

create index if not exists transactions_bucket_date
  on transactions (bucket_id, created_at desc);

alter table transactions disable row level security;

-- ---------- auto_deposit_rules ----------
create table if not exists auto_deposit_rules (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  source_bucket_id    uuid not null references buckets(id) on delete cascade,
  target_bucket_id    uuid not null references buckets(id) on delete cascade,
  amount              bigint not null,  -- cents
  frequency           text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  end_condition       text not null check (end_condition in ('bucket_full', '3_months', '6_months', '1_year', 'never')),
  is_paused           boolean not null default false,
  next_execution_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- One auto-deposit rule per target bucket
create unique index if not exists auto_deposit_one_per_target
  on auto_deposit_rules (target_bucket_id);

alter table auto_deposit_rules disable row level security;

-- ---------- notification_preferences ----------
create table if not exists notification_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references profiles(id) on delete cascade,
  goal_reached    boolean not null default true,
  deposits        boolean not null default true,
  weekly_summary  boolean not null default true,
  low_balance     boolean not null default true,
  updated_at      timestamptz not null default now()
);

alter table notification_preferences disable row level security;

-- ============================================================
-- Database Functions
-- ============================================================

-- ensure_main_bucket: creates the Main Bucket if it doesn't exist
create or replace function ensure_main_bucket(p_user_id uuid)
returns uuid
language plpgsql
as $$
declare
  v_bucket_id uuid;
begin
  select id into v_bucket_id
    from buckets
   where user_id = p_user_id and is_main = true;

  if v_bucket_id is null then
    insert into buckets (user_id, name, icon, icon_type, color_key, is_main, sort_order, target_amount)
    values (p_user_id, 'Main Bucket', 'Wallet', 'icon', 'neutral', true, -1, 0)
    returning id into v_bucket_id;
  end if;

  return v_bucket_id;
end;
$$;

-- transfer_funds: atomically moves money between two buckets + logs transactions
create or replace function transfer_funds(
  p_user_id     uuid,
  p_from_id     uuid,
  p_to_id       uuid,
  p_amount      bigint,
  p_description text default 'Funds moved'
)
returns void
language plpgsql
as $$
declare
  v_from_balance bigint;
  v_from_name    text;
  v_to_name      text;
begin
  -- Lock rows to prevent concurrent modification
  select current_amount, name into v_from_balance, v_from_name
    from buckets where id = p_from_id for update;

  select name into v_to_name
    from buckets where id = p_to_id for update;

  if v_from_balance < p_amount then
    raise exception 'Insufficient funds: have % cents, need %', v_from_balance, p_amount;
  end if;

  -- Update balances
  update buckets set current_amount = current_amount - p_amount, updated_at = now()
   where id = p_from_id;

  update buckets set current_amount = current_amount + p_amount, updated_at = now()
   where id = p_to_id;

  -- Log transfer_out on source
  insert into transactions (user_id, bucket_id, type, amount, description, related_bucket_id)
  values (p_user_id, p_from_id, 'transfer_out', p_amount,
          'Moved to ' || v_to_name, p_to_id);

  -- Log transfer_in on destination
  insert into transactions (user_id, bucket_id, type, amount, description, related_bucket_id)
  values (p_user_id, p_to_id, 'transfer_in', p_amount,
          'Moved from ' || v_from_name, p_from_id);
end;
$$;

-- add_funds: deposits to a bucket (external deposit simulation) + logs transaction
create or replace function add_funds(
  p_user_id     uuid,
  p_bucket_id   uuid,
  p_amount      bigint,
  p_description text default 'Funds added'
)
returns void
language plpgsql
as $$
begin
  update buckets set current_amount = current_amount + p_amount, updated_at = now()
   where id = p_bucket_id and user_id = p_user_id;

  insert into transactions (user_id, bucket_id, type, amount, description)
  values (p_user_id, p_bucket_id, 'deposit', p_amount, p_description);
end;
$$;

-- shift_bucket_orders: pushes all non-main buckets down by 1 so new ones go to the top
create or replace function shift_bucket_orders(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  update buckets
     set sort_order = sort_order + 1
   where user_id = p_user_id and is_main = false;
end;
$$;

-- ---------- virtual_cards ----------
create table if not exists virtual_cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  bucket_id       uuid not null references buckets(id) on delete cascade,
  card_number     text not null,
  expiry_month    integer not null,
  expiry_year     integer not null,
  cvv             text not null,
  spending_limit  bigint not null,
  status          text not null default 'active' check (status in ('active', 'frozen', 'used', 'cancelled')),
  created_at      timestamptz not null default now()
);

create unique index if not exists virtual_cards_one_per_bucket
  on virtual_cards (bucket_id) where status in ('active', 'frozen');

alter table virtual_cards disable row level security;

-- delete_bucket_with_refund: returns funds to main bucket and deletes the bucket
create or replace function delete_bucket_with_refund(p_user_id uuid, p_bucket_id uuid)
returns void
language plpgsql
as $$
declare
  v_amount bigint;
  v_name text;
  v_main_id uuid;
begin
  select current_amount, name into v_amount, v_name
    from buckets where id = p_bucket_id and user_id = p_user_id and is_main = false
    for update;

  if not found then
    raise exception 'Bucket not found or is main bucket';
  end if;

  select id into v_main_id
    from buckets where user_id = p_user_id and is_main = true
    for update;

  if v_amount > 0 then
    update buckets set current_amount = current_amount + v_amount, updated_at = now()
     where id = v_main_id;

    insert into transactions (user_id, bucket_id, type, amount, description, related_bucket_id)
    values (p_user_id, v_main_id, 'transfer_in', v_amount,
            'Returned from ' || v_name, p_bucket_id);
  end if;

  delete from buckets where id = p_bucket_id;
end;
$$;

-- ============================================================
-- Enable realtime on buckets table
-- ============================================================
alter publication supabase_realtime add table buckets;
