import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';

export async function moveFunds(params: {
  userId?: string;
  fromBucketId: string;
  toBucketId: string;
  amount: number;
  description?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('transfer_funds', {
    p_user_id: params.userId ?? getCurrentUserId(),
    p_from_id: params.fromBucketId,
    p_to_id: params.toBucketId,
    p_amount: params.amount,
    p_description: params.description ?? 'Funds moved',
  });

  if (error) throw error;
}

export async function addFunds(params: {
  userId?: string;
  bucketId: string;
  amount: number;
  description?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('add_funds', {
    p_user_id: params.userId ?? getCurrentUserId(),
    p_bucket_id: params.bucketId,
    p_amount: params.amount,
    p_description: params.description ?? 'Funds added',
  });

  if (error) throw error;
}

export async function seedMainBucketBalance(amountCents: number): Promise<void> {
  const userId = getCurrentUserId();
  const { data: main } = await supabase
    .from('buckets')
    .select('id')
    .eq('user_id', userId)
    .eq('is_main', true)
    .single();

  if (!main) return;

  await addFunds({
    userId,
    bucketId: main.id,
    amount: amountCents,
    description: 'Bank account linked',
  });
}

export async function resetAllBucketBalances(): Promise<void> {
  const userId = getCurrentUserId();
  await (supabase.from as any)('buckets')
    .update({ current_amount: 0 })
    .eq('user_id', userId);
}

export async function reconcileBuckets(
  adjustments: Array<{ bucketId: string; amount: number }>,
  userId: string = getCurrentUserId(),
): Promise<void> {
  const results = await Promise.all(
    adjustments
      .filter((adj) => adj.amount > 0)
      .map((adj) =>
        supabase.rpc('reconcile_bucket', {
          p_user_id: userId,
          p_bucket_id: adj.bucketId,
          p_amount: adj.amount,
          p_description: 'Balance adjustment',
        }),
      ),
  );

  const firstError = results.find((r) => r.error);
  if (firstError?.error) throw firstError.error;
}
