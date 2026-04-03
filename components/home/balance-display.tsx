import { StyleSheet, View, Pressable } from 'react-native';
import { LinkSimple, LinkBreak, ArrowsClockwise } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

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
  accountMask?: string;
  onLinkPress?: () => void;
  onRefreshPress?: () => void;
};

export function BalanceDisplay({ label, amountCents, loading, linked, accountMask, onLinkPress, onRefreshPress }: BalanceDisplayProps) {
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');

  if (loading) {
    return (
      <Animated.View exiting={FadeOut.duration(300)} style={styles.container}>
        <Skeleton width={120} height={21} borderRadius={8} style={{ marginBottom: 4 }} />
        <Skeleton width={200} height={62} borderRadius={12} />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: textColor, opacity: 0.6 }]}>
          {label}
        </ThemedText>
        {onLinkPress && (
          linked && accountMask ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLinkPress(); }}
              style={[styles.linkedBadge, { backgroundColor: surfaceColor }]}
            >
              <LinkSimple size={13} color="#4DD0C8" weight="bold" />
              <ThemedText style={[styles.accountMask, { color: textColor }]}>
                **{accountMask}
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLinkPress(); }}
              style={[styles.iconBadge, { backgroundColor: surfaceColor }]}
            >
              <LinkBreak size={14} color={textColor} weight="bold" />
            </Pressable>
          )
        )}
      </View>
      <View style={styles.amountRow}>
        <ThemedText style={[styles.amount, { color: textColor }]}>
          {formatCurrency(amountCents)}
        </ThemedText>
        {onRefreshPress && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRefreshPress(); }}
            style={[styles.iconBadge, { backgroundColor: surfaceColor }]}
          >
            <ArrowsClockwise size={14} color={textColor} weight="bold" />
          </Pressable>
        )}
      </View>
    </Animated.View>
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
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  accountMask: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    opacity: 0.6,
  },
});
