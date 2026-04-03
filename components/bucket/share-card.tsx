import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

import type { Bucket } from '@/types';
import type { BucketColorPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { getBucketIcon } from '@/utils/bucket-icons';
import { CheckCircle } from 'phosphor-react-native';

export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 640;

type ShareCardProps = {
  bucket: Bucket;
  palette: BucketColorPalette;
  progress: number;
};

export function ShareCard({ bucket, palette, progress }: ShareCardProps) {
  const Icon = bucket.iconType === 'icon' ? getBucketIcon(bucket.icon) : null;
  const isCompleted = progress >= 100;

  return (
    <View style={[styles.outer, { backgroundColor: palette.dark }]}>
      <View style={[styles.card, { backgroundColor: palette.main }]}>
        <View style={[styles.iconCircle, { backgroundColor: palette.cardText + '18' }]}>
          {bucket.iconType === 'pixel' ? (
            <PixelIcon data={JSON.parse(bucket.icon)} size={36} color={palette.cardText} />
          ) : bucket.iconType === 'emoji' ? (
            <Text style={styles.emoji}>{bucket.icon}</Text>
          ) : (
            Icon && <Icon size={36} color={palette.cardText} weight="fill" />
          )}
        </View>

        <Text style={[styles.name, { color: palette.cardText }]} numberOfLines={2}>
          {bucket.name}
        </Text>

        {isCompleted ? (
          <View style={styles.completedRow}>
            <CheckCircle size={24} color={palette.cardText} weight="fill" />
            <Text style={[styles.completedText, { color: palette.cardText }]}>
              Complete!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.progressRow}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: palette.cardText, width: `${progress}%` },
                ]}
              />
              <View style={styles.progressGap} />
              <View style={styles.progressRemainingWrapper}>
                <View style={styles.progressRemaining}>
                  <Image
                    source={require('@/assets/images/achurada.png')}
                    style={styles.hatchedImage}
                    resizeMode="repeat"
                  />
                </View>
              </View>
            </View>
            <Text style={[styles.percent, { color: palette.cardText }]}>
              {Math.round(progress)}%
            </Text>
          </>
        )}
      </View>

      <View style={styles.brandingRow}>
        <Text style={[styles.brandingText, { color: palette.darkText }]}>
          Saving with
        </Text>
        <Image
          source={require('@/assets/images/zumalogo.png')}
          style={[styles.brandingLogo, { tintColor: palette.darkText }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    width: SHARE_CARD_WIDTH - 32,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 24,
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 13,
    width: '100%',
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
  percent: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    letterSpacing: 14 * -0.05,
    marginTop: 10,
    opacity: 0.6,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    letterSpacing: 20 * -0.05,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    opacity: 0.5,
  },
  brandingText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  brandingLogo: {
    width: 60,
    height: 20,
  },
});
