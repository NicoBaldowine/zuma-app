import { useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { X, Export } from 'phosphor-react-native';

import { useBuckets } from '@/contexts/buckets-context';
import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { calcProgress } from '@/utils/format';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShareCard, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT } from '@/components/bucket/share-card';

export default function SharePreviewScreen() {
  const router = useRouter();
  const { bucketId } = useLocalSearchParams<{ bucketId: string }>();
  const { buckets } = useBuckets();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const bucket = buckets.find((b) => b.id === bucketId);
  if (!bucket) return null;

  const palette = getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor);
  const progress = calcProgress(bucket.currentAmount, bucket.targetAmount);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      }
    } catch {
      // User cancelled or sharing failed silently
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.dark }]}>
      <Pressable
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <X size={20} color={palette.darkText} weight="bold" />
      </Pressable>

      <View style={styles.cardContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}
        >
          <ShareCard bucket={bucket} palette={palette} progress={progress} />
        </ViewShot>
      </View>

      <Pressable
        style={[styles.shareButton, { backgroundColor: palette.main }]}
        onPress={handleShare}
        disabled={sharing}
      >
        <Export size={20} color={palette.cardText} weight="bold" />
        <Text style={[styles.shareButtonText, { color: palette.cardText }]}>
          {sharing ? 'Sharing...' : 'Share'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    height: 56,
    borderRadius: 28,
    marginTop: 32,
  },
  shareButtonText: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    letterSpacing: 17 * -0.03,
  },
});
