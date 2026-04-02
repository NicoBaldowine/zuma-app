export type BucketColorKey = 'lime' | 'orange' | 'lavender' | 'coral' | 'sky' | 'mint' | 'gold' | 'rose' | 'peach' | 'teal' | 'indigo' | 'sage' | 'berry' | 'mauve' | 'ocean' | 'lemon' | 'blush' | 'slate' | 'ember' | 'lilac' | 'neutral' | 'custom';

export type Bucket = {
  id: string;
  name: string;
  icon: string; // Phosphor icon name or emoji
  iconType: 'icon' | 'emoji';
  colorKey: BucketColorKey;
  customColor?: string; // hex value when colorKey = 'custom'
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
  | 'transfer_out'
  | 'bucket_created'
  | 'bucket_completed'
  | 'auto_deposit';

export type Transaction = {
  id: string;
  bucketId: string | null;
  type: TransactionType;
  amount: number; // cents, always positive
  description: string;
  relatedBucketId?: string | null;
  createdAt: string; // ISO 8601
};

export type AutoDepositRule = {
  id: string;
  userId: string;
  sourceBucketId: string;
  targetBucketId: string;
  amount: number; // cents
  frequency: AutoDepositFrequency;
  endCondition: AutoDepositEnd;
  isPaused: boolean;
  nextExecutionAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPreferences = {
  id: string;
  userId: string;
  goalReached: boolean;
  deposits: boolean;
  weeklySummary: boolean;
  lowBalance: boolean;
};

export type VirtualCardStatus = 'active' | 'frozen' | 'used' | 'cancelled';

export type VirtualCard = {
  id: string;
  userId: string;
  bucketId: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  spendingLimit: number; // cents
  status: VirtualCardStatus;
  createdAt: string;
};

export type Profile = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  authProvider: string | null;
};
