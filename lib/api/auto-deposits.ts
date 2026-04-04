import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';
import { mapAutoDepositRow } from './mappers';
import type { AutoDepositRule, AutoDepositFrequency, AutoDepositEnd } from '@/types';

function computeNextExecution(frequency: AutoDepositFrequency): string {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'biweekly':
      now.setDate(now.getDate() + 14);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
}

export async function fetchAutoDeposits(userId: string = getCurrentUserId()): Promise<AutoDepositRule[]> {
  const { data, error } = await supabase
    .from('auto_deposit_rules')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(mapAutoDepositRow);
}

export async function fetchAutoDepositByTarget(targetBucketId: string): Promise<AutoDepositRule | null> {
  const { data, error } = await supabase
    .from('auto_deposit_rules')
    .select('*')
    .eq('target_bucket_id', targetBucketId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAutoDepositRow(data) : null;
}

export async function createAutoDeposit(params: {
  userId?: string;
  sourceBucketId: string;
  targetBucketId: string;
  amount: number;
  frequency: AutoDepositFrequency;
  endCondition: AutoDepositEnd;
}): Promise<AutoDepositRule> {
  const { data, error } = await supabase
    .from('auto_deposit_rules')
    .insert({
      user_id: params.userId ?? getCurrentUserId(),
      source_bucket_id: params.sourceBucketId,
      target_bucket_id: params.targetBucketId,
      amount: params.amount,
      frequency: params.frequency,
      end_condition: params.endCondition,
      next_execution_at: computeNextExecution(params.frequency),
    })
    .select()
    .single();

  if (error) throw error;
  return mapAutoDepositRow(data);
}

export async function updateAutoDeposit(
  id: string,
  params: Partial<{
    sourceBucketId: string;
    amount: number;
    frequency: AutoDepositFrequency;
    endCondition: AutoDepositEnd;
  }>,
): Promise<AutoDepositRule> {
  const update: Record<string, unknown> = {};
  if (params.sourceBucketId !== undefined) update.source_bucket_id = params.sourceBucketId;
  if (params.amount !== undefined) update.amount = params.amount;
  if (params.frequency !== undefined) {
    update.frequency = params.frequency;
    update.next_execution_at = computeNextExecution(params.frequency);
  }
  if (params.endCondition !== undefined) update.end_condition = params.endCondition;

  const { data, error } = await supabase
    .from('auto_deposit_rules')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapAutoDepositRow(data);
}

export async function deleteAutoDeposit(id: string): Promise<void> {
  const { error } = await supabase
    .from('auto_deposit_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAutoDepositForBucket(targetBucketId: string): Promise<void> {
  const { error } = await supabase
    .from('auto_deposit_rules')
    .delete()
    .eq('target_bucket_id', targetBucketId);

  if (error) throw error;
}

export async function pauseAutoDeposit(id: string, paused: boolean, frequency?: AutoDepositFrequency): Promise<void> {
  const update: Record<string, unknown> = { is_paused: paused };
  if (!paused && frequency) {
    update.next_execution_at = computeNextExecution(frequency);
  }
  const { error } = await supabase
    .from('auto_deposit_rules')
    .update(update)
    .eq('id', id);

  if (error) throw error;
}
