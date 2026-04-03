import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapNotificationPrefsRow } from './mappers';
import type { NotificationPreferences } from '@/types';

const DEFAULTS: Omit<NotificationPreferences, 'id' | 'userId'> = {
  goalReached: true,
  bucketSuggestions: true,
  deposits: true,
  weeklySummary: true,
  lowBalance: true,
  autoDepositPaused: true,
};

export async function fetchNotificationPreferences(
  userId: string = getCurrentUserId(),
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    // Create default row
    const { data: created, error: createErr } = await supabase
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createErr) throw createErr;
    return mapNotificationPrefsRow(created);
  }

  return mapNotificationPrefsRow(data);
}

export async function updateNotificationPreferences(
  userId: string = getCurrentUserId(),
  prefs: Partial<Omit<NotificationPreferences, 'id' | 'userId'>>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (prefs.goalReached !== undefined) update.goal_reached = prefs.goalReached;
  if (prefs.bucketSuggestions !== undefined) update.bucket_suggestions = prefs.bucketSuggestions;
  if (prefs.deposits !== undefined) update.deposits = prefs.deposits;
  if (prefs.weeklySummary !== undefined) update.weekly_summary = prefs.weeklySummary;
  if (prefs.lowBalance !== undefined) update.low_balance = prefs.lowBalance;
  if (prefs.autoDepositPaused !== undefined) update.auto_deposit_paused = prefs.autoDepositPaused;

  const { error } = await supabase
    .from('notification_preferences')
    .update(update)
    .eq('user_id', userId);

  if (error) throw error;
}
