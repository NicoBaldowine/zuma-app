-- ============================================================
-- Linked Accounts — Bank connection tracking for Plaid
-- ============================================================

create table if not exists linked_accounts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  plaid_item_id       text not null,
  plaid_access_token  text not null,
  account_id          text not null,
  institution_name    text,
  institution_id      text,
  account_name        text,
  account_mask        text,
  account_subtype     text,
  created_at          timestamptz not null default now()
);

alter table linked_accounts disable row level security;

-- reconcile_bucket: deducts from a bucket (for balance refresh flow)
create or replace function reconcile_bucket(
  p_user_id     uuid,
  p_bucket_id   uuid,
  p_amount      bigint,
  p_description text default 'Balance adjustment'
)
returns void
language plpgsql
as $$
begin
  update buckets set current_amount = greatest(current_amount - p_amount, 0), updated_at = now()
   where id = p_bucket_id and user_id = p_user_id;

  insert into transactions (user_id, bucket_id, type, amount, description)
  values (p_user_id, p_bucket_id, 'withdrawal', p_amount, p_description);
end;
$$;
