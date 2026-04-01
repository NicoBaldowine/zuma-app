export type BucketColorKey = 'lime' | 'orange' | 'lavender' | 'coral' | 'sky' | 'mint' | 'gold' | 'rose' | 'peach' | 'teal' | 'indigo' | 'neutral' | 'custom';

export type Bucket = {
  id: string;
  name: string;
  icon: string; // Phosphor icon name
  colorKey: BucketColorKey;
  currentAmount: number; // cents
  targetAmount: number; // cents
  isMain?: boolean;
  createdAt: string; // ISO 8601
  order: number;
};

export type Wallet = {
  id: string;
  userId: string;
  totalBalance: number; // cents
  unallocatedBalance: number; // cents
};

export type AutoDepositFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type AutoDepositEnd = 'bucket_full' | '3_months' | '6_months' | '1_year' | 'never';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out';

export type Transaction = {
  id: string;
  bucketId: string | null;
  type: TransactionType;
  amount: number; // cents, always positive
  description: string;
  createdAt: string; // ISO 8601
};
