import { StyleSheet, View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { X } from 'phosphor-react-native';

import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { calcProgress } from '@/utils/format';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BucketCardExpanded, BucketDetailContent, BottomActions, StatsRow, AutoDepositCard, VirtualCardDetail } from '@/components/bucket';
import { useBuckets } from '@/contexts/buckets-context';
import { useAutoDeposits } from '@/contexts/auto-deposits-context';
import { CelebrationOverlay } from '@/contexts/celebration-context';
import { fetchCardForBucket } from '@/lib/api/virtual-cards';
import { hasLinkedAccount } from '@/lib/api/plaid';
import type { VirtualCard } from '@/types';

export default function BucketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { buckets } = useBuckets();
  const { getRuleForBucket } = useAutoDeposits();

  const bucket = buckets.find((b) => b.id === id);
  const palette = bucket ? getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor) : null;

  const [activeCard, setActiveCard] = useState<VirtualCard | null>(null);
  const [bankLinked, setBankLinked] = useState(false);

  const loadCard = useCallback(async (bucketId: string) => {
    try {
      const card = await fetchCardForBucket(bucketId);
      setActiveCard(card);
    } catch {
      setActiveCard(null);
    }
  }, []);

  useEffect(() => {
    if (id) loadCard(id);
  }, [id, buckets, loadCard]);

  useFocusEffect(
    useCallback(() => {
      hasLinkedAccount().then(setBankLinked).catch(() => {});
    }, [])
  );

  if (!bucket || !palette) {
    return (
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <StatusBar style="light" />
      </View>
    );
  }

  const rule = getRuleForBucket(bucket.id);
  const isCompleted = bucket.targetAmount > 0 && bucket.currentAmount >= bucket.targetAmount;
  const isLightBg = (colorScheme === 'light' || colorScheme === 'lavender') && bucket.colorKey === 'neutral';
  const detailTextColor = isLightBg ? '#1A1A1A' : '#FFFFFF';
  const detailLabelColor = isLightBg ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)';
  const detailCardBg = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.22)';

  return (
    <View style={[styles.root, { backgroundColor: palette.dark }]}>
      <CelebrationOverlay />
      <StatusBar style={isLightBg ? 'dark' : 'light'} />

      {/* Close button */}
      <View style={styles.floatingClose}>
        <View style={[styles.closeCircle, { backgroundColor: detailCardBg }]}>
          <BlurView
            intensity={60}
            tint={isLightBg ? 'light' : 'dark'}
            experimentalBlurMethod="dimezisBlurView"
            style={styles.closeBlur}
          />
          <Pressable
            onPress={() => router.back()}
            style={styles.closeInner}
          >
            <X size={18} color={palette.darkText} weight="bold" />
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Virtual card view OR Expanded card */}
        {!bucket.isMain && activeCard ? (
          <Animated.View
            entering={FadeInDown.duration(400).delay(80).easing(Easing.out(Easing.cubic))}
            style={styles.detailBlock}
          >
            <VirtualCardDetail
              card={activeCard}
              bucketName={bucket.name}
              bucketIcon={bucket.icon}
              bucketIconType={bucket.iconType}
              palette={palette}
              onStatusChange={() => loadCard(bucket.id)}
              onMore={() => router.push({ pathname: '/card-actions', params: { cardId: activeCard.id, bucketId: bucket.id } })}
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(350).easing(Easing.out(Easing.cubic))}
            style={styles.detailBlock}
          >
            <BucketCardExpanded bucket={bucket} />
          </Animated.View>
        )}

        {/* Stats + auto-deposit — only when no card */}
        {!activeCard && (
          <>
            {!bucket.isMain && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(80).easing(Easing.out(Easing.cubic))}
                style={styles.detailBlock}
              >
                <StatsRow
                  currentAmountCents={bucket.currentAmount}
                  targetAmountCents={bucket.targetAmount}
                  progressPercent={calcProgress(bucket.currentAmount, bucket.targetAmount)}
                  textColor={detailTextColor}
                  labelColor={detailLabelColor}
                  animated
                />
              </Animated.View>
            )}

            {!bucket.isMain && rule && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(140).easing(Easing.out(Easing.cubic))}
                style={styles.detailBlock}
              >
                <AutoDepositCard
                  frequency={rule.frequency}
                  endCondition={rule.endCondition}
                  amount={String(rule.amount / 100)}
                  colorKey={bucket.colorKey}
                  paused={rule.isPaused}
                  nextExecutionAt={rule.nextExecutionAt}
                  onEdit={() => router.push({ pathname: '/edit-auto-deposit', params: { ruleId: rule.id } })}
                />
              </Animated.View>
            )}
          </>
        )}

        <Animated.View
          entering={FadeInDown.duration(400).delay(activeCard ? 140 : (bucket.isMain ? 80 : 200)).easing(Easing.out(Easing.cubic))}
          style={styles.detailBlock}
        >
          <BucketDetailContent
            bucket={bucket}
            textColor={detailTextColor}
            labelColor={detailLabelColor}
            cardBg={detailCardBg}
          />
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom actions — not shown for main bucket */}
      {!activeCard && !bucket.isMain && (
        <View style={[styles.floatingBottom, { paddingBottom: insets.bottom + 8 }]}>
          {isCompleted ? (
            <BottomActions
              onMore={() => router.push({ pathname: '/more-actions', params: { bucketId: bucket.id, completed: '1' } })}
              onPrimary={() => router.push({ pathname: '/virtual-card', params: { bucketId: bucket.id } })}
              accentColor={palette.main}
              accentTextColor={palette.cardText}
              primaryLabel="Virtual card"
            />
          ) : (
            <BottomActions
              onMore={() => router.push({ pathname: '/more-actions', params: { bucketId: bucket.id } })}
              onPrimary={() => router.push({ pathname: '/add-to-bucket', params: { bucketId: bucket.id } })}
              accentColor={palette.main}
              accentTextColor={palette.cardText}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  floatingClose: {
    position: 'absolute',
    top: 8,
    right: 20,
    zIndex: 100,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  closeInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  detailBlock: {
    marginHorizontal: -12,
    marginBottom: 8,
  },
  floatingBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  singleButtonRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fullButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
