import { StyleSheet, View, Text } from 'react-native';

import type { Transaction } from '@/types';
import { Fonts } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/format';

type TransactionItemProps = {
  transaction: Transaction;
  textColor?: string;
};

export function TransactionItem({
  transaction,
  textColor = '#FFFFFF',
}: TransactionItemProps) {
  const isPositive =
    transaction.type === 'deposit' || transaction.type === 'transfer_in';
  const sign = isPositive ? '+' : '-';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.description, { color: textColor }]}>
          {transaction.description}
        </Text>
        <Text style={[styles.date, { color: textColor, opacity: 0.5 }]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: textColor }]}>
        {sign}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  date: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
