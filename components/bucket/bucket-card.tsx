import React, { useMemo } from 'react';
import { StyleSheet, Pressable, View, Text, Image } from 'react-native';
import { Repeat, CreditCard, Confetti } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { PixelIcon } from '@/components/shared/pixel-icon';

import type { Bucket } from '@/types';
import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { formatCurrency, formatPercent, calcProgress } from '@/utils/format';
import { getBucketIcon } from '@/utils/bucket-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BucketCardProps = {
  bucket: Bucket;
  hasAutoDeposit?: boolean;
  hasVirtualCard?: boolean;
  isLast?: boolean;
  onPress?: (bucket: Bucket) => void;
};

export const BucketCard = React.memo(function BucketCard({ bucket, hasAutoDeposit, hasVirtualCard, isLast, onPress }: BucketCardProps) {
  const colorScheme = useColorScheme();
  const palette = getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor);
  const progress = calcProgress(bucket.currentAmount, bucket.targetAmount);
  const isCompleted = !bucket.isMain && bucket.targetAmount > 0 && bucket.currentAmount >= bucket.targetAmount;
  const Icon = useMemo(() => bucket.iconType === 'icon' ? getBucketIcon(bucket.icon) : null, [bucket.icon, bucket.iconType]);

  const showBadge = hasVirtualCard || hasAutoDeposit || isCompleted;

  const content = (
    <View style={[styles.card, { backgroundColor: palette.main }, isLast && styles.cardLast]}>
      {showBadge && (
        <View style={styles.topBadge}>
          {isCompleted ? (
            <Confetti size={12} color={palette.cardText} weight="fill" />
          ) : hasVirtualCard ? (
            <CreditCard size={12} color={palette.cardText} weight="bold" />
          ) : (
            <Repeat size={12} color={palette.cardText} weight="bold" />
          )}
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          {bucket.iconType === 'pixel' ? (
            <PixelIcon data={JSON.parse(bucket.icon)} size={22} color={palette.cardText} />
          ) : bucket.iconType === 'emoji' ? (
            <Text style={{ fontSize: 20 }}>{bucket.icon}</Text>
          ) : (
            Icon && <Icon size={22} color={palette.cardText} weight="fill" />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: palette.cardText }]} numberOfLines={1}>
            {bucket.name}
          </Text>
          {!hasVirtualCard && (
            <View style={styles.amountRow}>
              <Text style={[styles.amount, { color: palette.cardText }]}>
                {formatCurrency(bucket.currentAmount)}
              </Text>
              {!bucket.isMain && (
                <>
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { color: palette.cardText }]}>
                      {formatPercent(progress)}
                    </Text>
                  </View>
                  <Text style={[styles.target, { color: palette.cardText }]}>
                    {formatCurrency(bucket.targetAmount)}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(bucket); }}>{content}</Pressable>;
  }
  return content;
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 130,
    borderRadius: 30,
  },
  cardLast: {
    paddingBottom: 20,
    minHeight: 88,
  },
  topBadge: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    letterSpacing: 16 * -0.05,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    letterSpacing: 16 * -0.05,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    letterSpacing: 12 * -0.05,
  },
  target: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.medium,
    letterSpacing: 16 * -0.05,
    textAlign: 'right',
    opacity: 0.7,
  },
});
