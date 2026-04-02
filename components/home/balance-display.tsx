import { StyleSheet, View, Pressable } from 'react-native';
import { LinkSimple, LinkBreak, ArrowsClockwise } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/shared/skeleton';

type BalanceDisplayProps = {
  label: string;
  amountCents: number;
  loading?: boolean;
  linked?: boolean;
  onLinkPress?: () => void;
  onRefreshPress?: () => void;
};

export function BalanceDisplay({ label, amountCents, loading, linked, onLinkPress, onRefreshPress }: BalanceDisplayProps) {
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: textColor, opacity: 0.6 }]}>
          {label}
        </ThemedText>
        {onLinkPress && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLinkPress(); }}
            style={[styles.iconBadge, { backgroundColor: surfaceColor }]}
          >
            {linked ? (
              <LinkSimple size={14} color="#4DD0C8" weight="bold" />
            ) : (
              <LinkBreak size={14} color={textColor} weight="bold" />
            )}
          </Pressable>
        )}
      </View>
      <View style={styles.amountRow}>
        {loading ? (
          <Skeleton width={220} height={52} borderRadius={12} />
        ) : (
          <ThemedText style={[styles.amount, { color: textColor }]}>
            {formatCurrency(amountCents)}
          </ThemedText>
        )}
        {onRefreshPress && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRefreshPress(); }}
            style={[styles.iconBadge, { backgroundColor: surfaceColor }]}
          >
            <ArrowsClockwise size={14} color={textColor} weight="bold" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    lineHeight: 16 * 1.3,
    letterSpacing: 16 * -0.05,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amount: {
    fontSize: 48,
    fontFamily: Fonts.medium,
    lineHeight: 48 * 1.3,
    letterSpacing: 48 * -0.05,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
