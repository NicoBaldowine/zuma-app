import { StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';
import { ThemedText } from '@/components/themed-text';

type BalanceDisplayProps = {
  label: string;
  amountCents: number;
};

export function BalanceDisplay({ label, amountCents }: BalanceDisplayProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: textColor, opacity: 0.6 }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.amount, { color: textColor }]}>
        {formatCurrency(amountCents)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    lineHeight: 16 * 1.3,
    letterSpacing: 16 * -0.05,
    marginBottom: 0,
  },
  amount: {
    fontSize: 48,
    fontFamily: Fonts.medium,
    lineHeight: 48 * 1.3,
    letterSpacing: 48 * -0.05,
  },
});
