import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fonts } from '@/constants/theme';
import { BalanceDisplay, ActionBar } from '@/components/home';
import { BucketCardStack } from '@/components/bucket';
import { formatCurrency } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { fetchActiveCardBucketIds } from '@/lib/api/virtual-cards';
import { hasLinkedAccount, getLinkedAccountMask } from '@/lib/api/plaid';
import { CelebrationOverlay } from '@/contexts/celebration-context';
import type { Bucket } from '@/types';

const SCROLL_THRESHOLD = 80;

export default function HomeScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const { buckets, wallet, loading } = useBuckets();

  const [cardBucketIds, setCardBucketIds] = useState<Set<string>>(new Set());
  const [bankLinked, setBankLinked] = useState(false);
  const [accountMask, setAccountMask] = useState<string | undefined>();
  const scrollY = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      hasLinkedAccount().then((linked) => {
        setBankLinked(linked);
        if (linked) getLinkedAccountMask().then(setAccountMask).catch(() => {});
        else setAccountMask(undefined);
      }).catch(() => {});
    }, [])
  );

  useEffect(() => {
    fetchActiveCardBucketIds().then(setCardBucketIds).catch(() => {});
  }, []);

  const handleCardPress = useCallback((bucket: Bucket) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/bucket/[id]', params: { id: bucket.id } });
  }, [router]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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

  return (
    <View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <CelebrationOverlay />
      <StatusBar style={colorScheme === 'dark' || colorScheme === 'gold' ? 'light' : 'dark'} />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <BalanceDisplay
          label="Total Balance"
          amountCents={wallet.totalBalance}
          loading={loading}
          linked={bankLinked}
          accountMask={accountMask}
          onLinkPress={() => router.push('/linked-account')}
          onRefreshPress={() => router.push('/refresh-balance')}
        />
        <ActionBar
          onNewBucket={() => router.push('/new-bucket')}
          onMoveFunds={() => router.push(bankLinked ? '/move-funds' : '/linked-account')}
          onAutoDeposit={() => router.push(bankLinked ? '/auto-deposit' : '/linked-account')}
          onAccount={() => router.push('/account')}
        />
        <BucketCardStack
          buckets={buckets}
          cardBucketIds={cardBucketIds}
          loading={loading}
          onCardPress={handleCardPress}
        />
      </Animated.ScrollView>

      {/* Sticky compact balance badge — shows when scrolled */}
      {!loading && (
        <Animated.View style={[styles.stickyBadge, badgeStyle]} pointerEvents="none">
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' || colorScheme === 'gold' ? 'dark' : 'light'}
            style={styles.badgeBlur}
          >
            <Text style={[styles.badgeText, { color: textColor }]}>
              {formatCurrency(wallet.totalBalance)}
            </Text>
          </BlurView>
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
  stickyBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
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
});
