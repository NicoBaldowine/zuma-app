import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapProfileRow } from './mappers';
import type { Profile } from '@/types';

export async function fetchProfile(userId: string = getCurrentUserId()): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfileRow(data) : null;
}

export async function updateProfile(
  userId: string = getCurrentUserId(),
  params: Partial<Omit<Profile, 'id'>>,
): Promise<Profile> {
  const update: Record<string, unknown> = {};
  if (params.fullName !== undefined) update.full_name = params.fullName;
  if (params.email !== undefined) update.email = params.email;
  if (params.phone !== undefined) update.phone = params.phone;
  if (params.dateOfBirth !== undefined) update.date_of_birth = params.dateOfBirth;
  if (params.avatarUrl !== undefined) update.avatar_url = params.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapProfileRow(data);
}
