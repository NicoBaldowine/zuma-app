import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

import type { Bucket } from '@/types';
import { Fonts } from '@/constants/theme';
import { TransactionList } from './transaction-list';
import { useTransactions } from '@/contexts/transactions-context';

type BucketDetailContentProps = {
  bucket: Bucket;
  textColor?: string;
  labelColor?: string;
  cardBg?: string;
};

export function BucketDetailContent({
  bucket,
  textColor = '#FFFFFF',
  labelColor = 'rgba(255,255,255,0.5)',
  cardBg = 'rgba(255,255,255,0.12)',
}: BucketDetailContentProps) {
  const { getTransactions, loadTransactionsForBucket, loadingBucket } = useTransactions();

  useEffect(() => {
    loadTransactionsForBucket(bucket.id);
  }, [bucket.id, bucket.currentAmount, loadTransactionsForBucket]);

  const transactions = getTransactions(bucket.id);
  const isLoading = loadingBucket === bucket.id;

  return (
    <View style={[styles.transactionsCard, { backgroundColor: cardBg }]}>
      <Text style={[styles.sectionTitle, { color: labelColor }]}>ACTIVITY</Text>
      {isLoading && transactions.length === 0 ? (
        <ActivityIndicator color={textColor} style={{ paddingVertical: 20 }} />
      ) : (
        <TransactionList
          transactions={transactions}
          textColor={textColor}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  transactionsCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
});
