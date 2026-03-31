import { StyleSheet, View } from 'react-native';

import type { Bucket } from '@/types';
import { getBucketPalette } from '@/constants/bucket-colors';
import { TransactionList } from './transaction-list';
import { mockTransactions } from '@/data/mock';

type BucketDetailContentProps = {
  bucket: Bucket;
};

export function BucketDetailContent({ bucket }: BucketDetailContentProps) {
  const palette = getBucketPalette(bucket.colorKey);
  const transactions = mockTransactions.filter((t) => t.bucketId === bucket.id);

  return (
    <View style={[styles.transactionsCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
      <TransactionList
        transactions={transactions}
        textColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  transactionsCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
