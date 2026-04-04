-- ============================================================
-- Enable Row Level Security on all tables
-- Production-ready: each user can only access their own data
-- ============================================================

-- ---------- profiles ----------
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ---------- buckets ----------
alter table buckets enable row level security;

create policy "Users can view own buckets"
  on buckets for select
  using (auth.uid() = user_id);

create policy "Users can insert own buckets"
  on buckets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own buckets"
  on buckets for update
  using (auth.uid() = user_id);

create policy "Users can delete own buckets"
  on buckets for delete
  using (auth.uid() = user_id);

-- ---------- transactions ----------
alter table transactions enable row level security;

create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

-- ---------- auto_deposit_rules ----------
alter table auto_deposit_rules enable row level security;

create policy "Users can view own auto deposit rules"
  on auto_deposit_rules for select
  using (auth.uid() = user_id);

create policy "Users can insert own auto deposit rules"
  on auto_deposit_rules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own auto deposit rules"
  on auto_deposit_rules for update
  using (auth.uid() = user_id);

create policy "Users can delete own auto deposit rules"
  on auto_deposit_rules for delete
  using (auth.uid() = user_id);

-- ---------- notification_preferences ----------
alter table notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

-- ---------- linked_accounts ----------
alter table linked_accounts enable row level security;

create policy "Users can view own linked accounts"
  on linked_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own linked accounts"
  on linked_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own linked accounts"
  on linked_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own linked accounts"
  on linked_accounts for delete
  using (auth.uid() = user_id);

-- ---------- virtual_cards ----------
alter table virtual_cards enable row level security;

create policy "Users can view own virtual cards"
  on virtual_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own virtual cards"
  on virtual_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own virtual cards"
  on virtual_cards for update
  using (auth.uid() = user_id);

-- ---------- Service role bypass ----------
-- Edge functions use the service_role key which bypasses RLS automatically.
-- No additional grants needed for Plaid edge functions.
