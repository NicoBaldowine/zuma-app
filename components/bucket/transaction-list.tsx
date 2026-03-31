import { StyleSheet, View, Text } from 'react-native';

import type { Transaction } from '@/types';
import { Fonts } from '@/constants/theme';
import { TransactionItem } from './transaction-item';

type TransactionListProps = {
  transactions: Transaction[];
  textColor?: string;
};

export function TransactionList({
  transactions,
  textColor = '#FFFFFF',
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
          No transactions yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {transactions.map((txn) => (
        <TransactionItem
          key={txn.id}
          transaction={txn}
          textColor={textColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
});
