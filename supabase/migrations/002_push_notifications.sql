-- Push tokens: store Expo push tokens per user/device
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  expo_push_token text not null,
  device_type text default 'ios',
  created_at timestamptz default now(),
  unique (user_id, expo_push_token)
);

-- Notifications queue: inserts here trigger the send-push edge function via DB webhook
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  data jsonb default '{}',
  sent boolean default false,
  created_at timestamptz default now()
);

-- Add bucket_suggestions preference column
alter table notification_preferences
  add column if not exists bucket_suggestions boolean default true;

-- Trigger: when a bucket reaches its goal, queue a push notification
create or replace function notify_bucket_goal_reached()
returns trigger as $$
declare
  prefs record;
begin
  -- Only fire when current_amount crosses the target threshold
  if NEW.target_amount > 0
     and NEW.current_amount >= NEW.target_amount
     and (OLD.current_amount is null or OLD.current_amount < OLD.target_amount)
  then
    -- Check if user has goal_reached notifications enabled
    select goal_reached into prefs
    from notification_preferences
    where user_id = NEW.user_id;

    -- Default to true if no preferences row
    if prefs is null or prefs.goal_reached = true then
      insert into notifications (user_id, title, body, data)
      values (
        NEW.user_id,
        'Goal reached! 🎉',
        format('Your "%s" bucket just hit its %s goal!', NEW.name,
          case
            when NEW.target_amount >= 100 then '$' || (NEW.target_amount / 100)::text
            else '$' || round(NEW.target_amount / 100.0, 2)::text
          end
        ),
        jsonb_build_object('bucketId', NEW.id, 'type', 'goal_reached')
      );
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_bucket_goal_reached
  after update on buckets
  for each row
  execute function notify_bucket_goal_reached();
