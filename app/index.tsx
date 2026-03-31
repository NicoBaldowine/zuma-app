import { StyleSheet, View, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useRef } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { BalanceDisplay, ActionBar } from '@/components/home';
import { BucketCardStack, BucketCardExpanded, BucketDetailContent, BottomActions, StatsRow } from '@/components/bucket';
import { calcProgress, formatCurrency } from '@/utils/format';
import { mockWallet, mockBuckets } from '@/data/mock';
import type { Bucket } from '@/types';

const TIMING_CONFIG = { duration: 350, easing: Easing.out(Easing.cubic) };
const SCROLL_THRESHOLD = 80; // px scrolled before badge appears

export default function HomeScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const lastBucketRef = useRef<Bucket | null>(null);
  const expanded = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const activeBucket = selectedBucket ?? lastBucketRef.current;
  const activePalette = activeBucket ? getBucketPalette(activeBucket.colorKey) : null;
  const darkBgColor = activePalette?.dark ?? bgColor;

  const handleCardPress = useCallback((bucket: Bucket) => {
    lastBucketRef.current = bucket;
    setSelectedBucket(bucket);
    expanded.value = withTiming(1, TIMING_CONFIG);
  }, [expanded]);

  const clearSelection = useCallback(() => {
    lastBucketRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    setSelectedBucket(null);
    expanded.value = withTiming(0, TIMING_CONFIG, () => {
      runOnJS(clearSelection)();
    });
  }, [expanded, clearSelection]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expanded.value, [0, 1], [0, 1]),
  }));

  const bottomActionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expanded.value, [0.3, 1], [0, 1]),
    transform: [
      { translateY: interpolate(expanded.value, [0.3, 1], [60, 0]) },
    ],
  }));

  // Compact badge appears as you scroll past the header
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD + 20],
          [0.8, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const isDetail = !!selectedBucket;

  return (
    <View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      {/* Background overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: darkBgColor }, overlayStyle]}
        pointerEvents="none"
      />

      {/* Sticky floating X — outside ScrollView */}
      {isDetail && activePalette && (
        <Animated.View
          entering={FadeIn.duration(250).delay(100)}
          style={[styles.stickyClose, { marginTop: 4 }]}
        >
          <Pressable
            onPress={handleClose}
            style={[styles.closeCircle, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
          >
            <X size={18} color={activePalette.darkText} weight="bold" />
          </Pressable>
        </Animated.View>
      )}

      {/* Sticky compact balance badge — shows when scrolled */}
      {!isDetail && (
        <Animated.View style={[styles.stickyBadge, badgeStyle]} pointerEvents="none">
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={styles.badgeBlur}
          >
            <Text style={[styles.badgeText, { color: textColor }]}>
              {formatCurrency(mockWallet.totalBalance)}
            </Text>
          </BlurView>
        </Animated.View>
      )}

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {isDetail && activeBucket && activePalette ? (
          <>
            <View style={styles.closeSpacer} />

            <Animated.View
              entering={FadeInDown.duration(350).easing(Easing.out(Easing.cubic))}
              style={styles.detailBlock}
            >
              <BucketCardExpanded bucket={activeBucket} />
            </Animated.View>

            {!activeBucket.isMain && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(80).easing(Easing.out(Easing.cubic))}
                style={styles.detailBlock}
              >
                <StatsRow
                  currentAmountCents={activeBucket.currentAmount}
                  targetAmountCents={activeBucket.targetAmount}
                  progressPercent={calcProgress(activeBucket.currentAmount, activeBucket.targetAmount)}
                  textColor="#FFFFFF"
                  labelColor="rgba(255,255,255,0.6)"
                  animated
                />
              </Animated.View>
            )}

            <Animated.View
              entering={FadeInDown.duration(400).delay(activeBucket.isMain ? 80 : 160).easing(Easing.out(Easing.cubic))}
              style={styles.detailBlock}
            >
              <BucketDetailContent bucket={activeBucket} />
            </Animated.View>

            <View style={styles.bottomSpacer} />
          </>
        ) : (
          <>
            <BalanceDisplay label="Total Savings" amountCents={mockWallet.totalBalance} />
            <ActionBar
              onNewBucket={() => router.push('/create-bucket')}
              onAddFunds={() => router.push('/add-funds')}
              onAccount={() => router.push('/account')}
              onMore={() => router.push('/home-actions')}
            />
            <BucketCardStack
              buckets={mockBuckets}
              onCardPress={handleCardPress}
            />
          </>
        )}
      </Animated.ScrollView>

      {/* Floating sticky bottom actions */}
      {activePalette && (
        <Animated.View
          style={[
            styles.floatingBottom,
            { paddingBottom: insets.bottom + 8 },
            bottomActionsStyle,
          ]}
          pointerEvents={isDetail ? 'auto' : 'none'}
        >
          {activeBucket?.isMain ? (
            <View style={styles.singleButtonRow}>
              <Pressable
                onPress={() => router.push('/add-funds')}
                style={[styles.fullButton, { backgroundColor: activePalette.main }]}
              >
                <Text style={[styles.fullButtonText, { color: activePalette.cardText }]}>Add funds</Text>
              </Pressable>
            </View>
          ) : (
            <BottomActions
              onMore={() => router.push('/more-actions')}
              onAddFunds={() => router.push('/add-to-bucket')}
              accentColor={activePalette.main}
              accentTextColor={activePalette.cardText}
            />
          )}
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  stickyClose: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
    zIndex: 100,
  },
  closeSpacer: {
    height: 8,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  stickyBadge: {
    alignItems: 'center',
    zIndex: 100,
  },
  badgeBlur: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    letterSpacing: 16 * -0.05,
  },
  detailBlock: {
    marginHorizontal: -12,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 100,
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
  floatingBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
