import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapVirtualCardRow } from './mappers';
import type { VirtualCard } from '@/types';

function generateCardNumber(): string {
  const groups = Array.from({ length: 4 }, () =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  return groups.join(' ');
}

function generateCVV(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

function generateExpiry(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear() + 3,
  };
}

export async function fetchActiveCardBucketIds(userId: string = getCurrentUserId()): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('virtual_cards')
    .select('bucket_id')
    .eq('user_id', userId)
    .in('status', ['active', 'frozen']);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.bucket_id));
}

export async function fetchCardForBucket(bucketId: string): Promise<VirtualCard | null> {
  const { data, error } = await supabase
    .from('virtual_cards')
    .select('*')
    .eq('bucket_id', bucketId)
    .in('status', ['active', 'frozen'])
    .maybeSingle();

  if (error) throw error;
  return data ? mapVirtualCardRow(data) : null;
}

export async function generateCard(
  bucketId: string,
  spendingLimit: number,
  userId: string = getCurrentUserId(),
): Promise<VirtualCard> {
  const expiry = generateExpiry();

  const { data, error } = await supabase
    .from('virtual_cards')
    .insert({
      user_id: userId,
      bucket_id: bucketId,
      card_number: generateCardNumber(),
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: generateCVV(),
      spending_limit: spendingLimit,
    })
    .select()
    .single();

  if (error) throw error;
  return mapVirtualCardRow(data);
}

export async function freezeCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('virtual_cards')
    .update({ status: 'frozen' })
    .eq('id', cardId);
  if (error) throw error;
}

export async function unfreezeCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('virtual_cards')
    .update({ status: 'active' })
    .eq('id', cardId);
  if (error) throw error;
}

export async function cancelCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('virtual_cards')
    .update({ status: 'cancelled' })
    .eq('id', cardId);
  if (error) throw error;
}
