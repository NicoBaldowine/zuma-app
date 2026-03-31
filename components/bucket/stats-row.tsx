import { StyleSheet, View } from 'react-native';

import { StatItem } from './stat-item';
import { formatCurrency, formatPercent } from '@/utils/format';

type StatsRowProps = {
  currentAmountCents: number;
  targetAmountCents: number;
  progressPercent: number;
  textColor?: string;
  labelColor?: string;
  animated?: boolean;
};

export function StatsRow({
  currentAmountCents,
  targetAmountCents,
  progressPercent,
  textColor,
  labelColor,
  animated = false,
}: StatsRowProps) {
  return (
    <View style={styles.container}>
      <StatItem
        label="Current"
        value={formatCurrency(currentAmountCents)}
        textColor={textColor}
        labelColor={labelColor}
        animateFrom={animated ? 0 : undefined}
        animateTo={animated ? currentAmountCents : undefined}
        formatFn={animated ? (n) => formatCurrency(n) : undefined}
      />
      <StatItem
        label="Goal"
        value={formatCurrency(targetAmountCents)}
        textColor={textColor}
        labelColor={labelColor}
        animateFrom={animated ? 0 : undefined}
        animateTo={animated ? targetAmountCents : undefined}
        formatFn={animated ? (n) => formatCurrency(n) : undefined}
      />
      <StatItem
        label="Progress"
        value={formatPercent(progressPercent)}
        textColor={textColor}
        labelColor={labelColor}
        animateFrom={animated ? 0 : undefined}
        animateTo={animated ? progressPercent : undefined}
        formatFn={animated ? (n) => formatPercent(n) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
});
