import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapTransactionRow } from './mappers';
import type { Transaction, TransactionType } from '@/types';

export async function fetchTransactionsByBucket(bucketId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('bucket_id', bucketId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTransactionRow);
}

export async function fetchAllTransactions(
  userId: string = getCurrentUserId(),
  opts?: { limit?: number; offset?: number },
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapTransactionRow);
}

export async function createTransaction(params: {
  userId?: string;
  bucketId?: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  relatedBucketId?: string | null;
}): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId ?? getCurrentUserId(),
      bucket_id: params.bucketId ?? null,
      type: params.type,
      amount: params.amount,
      description: params.description,
      related_bucket_id: params.relatedBucketId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTransactionRow(data);
}
