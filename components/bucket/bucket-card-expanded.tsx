import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import type { Bucket } from '@/types';
import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { calcProgress } from '@/utils/format';
import { getBucketIcon } from '@/utils/bucket-icons';

type BucketCardExpandedProps = {
  bucket: Bucket;
};

export function BucketCardExpanded({ bucket }: BucketCardExpandedProps) {
  const palette = getBucketPalette(bucket.colorKey);
  const progress = calcProgress(bucket.currentAmount, bucket.targetAmount);
  const Icon = getBucketIcon(bucket.icon);

  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  return (
    <View style={[styles.card, { backgroundColor: palette.main }]}>
      <View style={styles.iconCircle}>
        <Icon size={22} color={palette.cardText} weight="fill" />
      </View>

      <Text style={[styles.name, { color: palette.cardText }]}>
        {bucket.name}
      </Text>

      {!bucket.isMain && (
        <View style={styles.progressRow}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: palette.cardText },
              fillStyle,
            ]}
          />
          <View style={styles.progressGap} />
          <View style={styles.progressRemainingWrapper}>
            <View style={[styles.progressRemaining]}>
              <Image
                source={require('@/assets/images/achurada.png')}
                style={styles.hatchedImage}
                resizeMode="repeat"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    padding: 24,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 13,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6.5,
  },
  progressGap: {
    width: 4,
  },
  progressRemainingWrapper: {
    flex: 1,
    height: '100%',
  },
  progressRemaining: {
    height: '100%',
    borderRadius: 6.5,
    overflow: 'hidden',
  },
  hatchedImage: {
    width: '100%',
    height: '100%',
  },
});
