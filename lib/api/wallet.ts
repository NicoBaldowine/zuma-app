import type { Bucket, Wallet } from '@/types';

export function computeWallet(buckets: Bucket[], userId: string = 'user-1'): Wallet {
  const totalBalance = buckets.reduce((sum, b) => sum + b.currentAmount, 0);
  const mainBucket = buckets.find((b) => b.isMain);
  const unallocatedBalance = mainBucket?.currentAmount ?? 0;

  return {
    id: 'computed',
    userId,
    totalBalance,
    unallocatedBalance,
  };
}
