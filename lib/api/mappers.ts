import type { Bucket, Transaction, AutoDepositRule, NotificationPreferences, Profile, VirtualCard, BucketColorKey, TransactionType, AutoDepositFrequency, AutoDepositEnd, VirtualCardStatus } from '@/types';
import type { Database } from '../database.types';

type BucketRow = Database['public']['Tables']['buckets']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type AutoDepositRow = Database['public']['Tables']['auto_deposit_rules']['Row'];
type NotifRow = Database['public']['Tables']['notification_preferences']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type VirtualCardRow = Database['public']['Tables']['virtual_cards']['Row'];

export function mapBucketRow(row: BucketRow): Bucket {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    iconType: row.icon_type as 'icon' | 'emoji' | 'pixel',
    colorKey: row.color_key as BucketColorKey,
    customColor: row.custom_color ?? undefined,
    currentAmount: row.current_amount,
    targetAmount: row.target_amount,
    isMain: row.is_main,
    createdAt: row.created_at,
    order: row.sort_order,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    bucketId: row.bucket_id,
    type: row.type as TransactionType,
    amount: row.amount,
    description: row.description,
    relatedBucketId: row.related_bucket_id,
    createdAt: row.created_at,
  };
}

export function mapAutoDepositRow(row: AutoDepositRow): AutoDepositRule {
  return {
    id: row.id,
    userId: row.user_id,
    sourceBucketId: row.source_bucket_id,
    targetBucketId: row.target_bucket_id,
    amount: row.amount,
    frequency: row.frequency as AutoDepositFrequency,
    endCondition: row.end_condition as AutoDepositEnd,
    isPaused: row.is_paused,
    nextExecutionAt: row.next_execution_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotificationPrefsRow(row: NotifRow): NotificationPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    goalReached: row.goal_reached,
    bucketSuggestions: (row as any).bucket_suggestions ?? true,
    deposits: row.deposits,
    weeklySummary: row.weekly_summary,
    lowBalance: row.low_balance,
    autoDepositPaused: (row as any).auto_deposit_paused ?? true,
  };
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    avatarUrl: row.avatar_url,
    authProvider: row.auth_provider,
  };
}

export function mapVirtualCardRow(row: VirtualCardRow): VirtualCard {
  return {
    id: row.id,
    userId: row.user_id,
    bucketId: row.bucket_id,
    cardNumber: row.card_number,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    cvv: row.cvv,
    spendingLimit: row.spending_limit,
    status: row.status as VirtualCardStatus,
    createdAt: row.created_at,
  };
}
