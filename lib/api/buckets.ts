import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapBucketRow } from './mappers';
import type { Bucket, BucketColorKey } from '@/types';

export async function fetchBuckets(userId: string = getCurrentUserId()): Promise<Bucket[]> {
  const { data, error } = await supabase
    .from('buckets')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapBucketRow);
}

export async function createBucket(params: {
  userId?: string;
  name: string;
  icon: string;
  iconType: 'icon' | 'emoji' | 'pixel';
  colorKey: BucketColorKey;
  customColor?: string;
  targetAmount: number;
}): Promise<Bucket> {
  const userId = params.userId ?? getCurrentUserId();

  // Push all existing non-main buckets down by 1 so the new one goes to the top
  await supabase.rpc('shift_bucket_orders', { p_user_id: userId });

  const { data, error } = await supabase
    .from('buckets')
    .insert({
      user_id: userId,
      name: params.name,
      icon: params.icon,
      icon_type: params.iconType,
      color_key: params.colorKey,
      custom_color: params.customColor ?? null,
      target_amount: params.targetAmount,
      sort_order: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Log bucket_created transaction
  await supabase.from('transactions').insert({
    user_id: userId,
    bucket_id: data.id,
    type: 'bucket_created',
    amount: 0,
    description: `Created "${params.name}"`,
  });

  return mapBucketRow(data);
}

export async function updateBucket(
  id: string,
  params: Partial<{
    name: string;
    icon: string;
    iconType: string;
    colorKey: string;
    customColor: string | null;
    targetAmount: number;
  }>,
): Promise<Bucket> {
  const update: Record<string, unknown> = {};
  if (params.name !== undefined) update.name = params.name;
  if (params.icon !== undefined) update.icon = params.icon;
  if (params.iconType !== undefined) update.icon_type = params.iconType;
  if (params.colorKey !== undefined) update.color_key = params.colorKey;
  if (params.customColor !== undefined) update.custom_color = params.customColor;
  if (params.targetAmount !== undefined) update.target_amount = params.targetAmount;

  const { data, error } = await supabase
    .from('buckets')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapBucketRow(data);
}

export async function deleteBucket(id: string, userId: string = getCurrentUserId()): Promise<void> {
  const { error } = await supabase.rpc('delete_bucket_with_refund', {
    p_user_id: userId,
    p_bucket_id: id,
  });

  if (error) throw error;
}

export async function ensureMainBucket(userId: string = getCurrentUserId()): Promise<string> {
  const { data, error } = await supabase.rpc('ensure_main_bucket', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data as string;
}
