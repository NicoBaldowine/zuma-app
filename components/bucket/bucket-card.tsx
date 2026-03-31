import { StyleSheet, Pressable, View, Text, Image } from 'react-native';

import type { Bucket } from '@/types';
import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { formatCurrency, formatPercent, calcProgress } from '@/utils/format';
import { getBucketIcon } from '@/utils/bucket-icons';

type BucketCardProps = {
  bucket: Bucket;
  onPress?: (bucket: Bucket) => void;
};

export function BucketCard({ bucket, onPress }: BucketCardProps) {
  const palette = getBucketPalette(bucket.colorKey);
  const progress = calcProgress(bucket.currentAmount, bucket.targetAmount);
  const Icon = getBucketIcon(bucket.icon);

  const content = (
    <View style={[styles.card, { backgroundColor: palette.main }]}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Icon size={22} color={palette.cardText} weight="fill" />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: palette.cardText }]} numberOfLines={1}>
            {bucket.name}
          </Text>
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
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={() => onPress(bucket)}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 130,
    borderRadius: 30,
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
