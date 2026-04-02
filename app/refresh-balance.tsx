import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';
import Animated, { FadeInDown, Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { useCelebration } from '@/contexts/celebration-context';
import { reconcileBuckets } from '@/lib/api/transfers';

// SIMULATION: Replace with actual Plaid getBalance() when ready
const SIMULATED_DECREASE_CENTS = 8500; // $85

export default function RefreshBalanceScreen() {
  const router = useRouter();
  const { buckets, wallet, refresh } = useBuckets();
  const { showToast } = useCelebration();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [checking, setChecking] = useState(true);
  const [deficit, setDeficit] = useState(0);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [applying, setApplying] = useState(false);

  const nonMainBuckets = buckets.filter((b) => !b.isMain).sort((a, b) => a.order - b.order);
  const mainBucket = buckets.find((b) => b.isMain);
  const allBuckets = mainBucket ? [mainBucket, ...nonMainBuckets] : nonMainBuckets;

  const totalAssigned = Object.values(adjustments).reduce((sum, v) => sum + v, 0);
  const remaining = deficit - totalAssigned;
  const progress = deficit > 0 ? totalAssigned / deficit : 0;

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressWidth.value * 100, 100)}%`,
  }));

  // Simulate checking bank balance
  useEffect(() => {
    const timer = setTimeout(() => {
      const simulatedDiff = SIMULATED_DECREASE_CENTS;
      if (simulatedDiff <= 0) {
        showToast('Account is up to date');
        router.back();
        return;
      }
      setDeficit(simulatedDiff);
      setChecking(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAssign = useCallback((bucketId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const bucket = allBuckets.find((b) => b.id === bucketId);
    if (!bucket) return;

    const currentAdj = adjustments[bucketId] ?? 0;
    const otherAssigned = totalAssigned - currentAdj;
    const maxForBucket = Math.min(bucket.currentAmount, deficit - otherAssigned);

    setAdjustments((prev) => ({ ...prev, [bucketId]: maxForBucket }));
  }, [adjustments, totalAssigned, deficit, allBuckets]);

  const handleSetAmount = useCallback((bucketId: string, text: string) => {
    const cents = Math.round(parseFloat(text || '0') * 100);
    const bucket = allBuckets.find((b) => b.id === bucketId);
    if (!bucket) return;

    const clamped = Math.min(Math.max(0, cents), bucket.currentAmount);
    setAdjustments((prev) => ({ ...prev, [bucketId]: clamped }));
  }, [allBuckets]);

  const handleApply = async () => {
    if (remaining !== 0 || applying) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplying(true);
    try {
      const entries = Object.entries(adjustments)
        .filter(([_, amount]) => amount > 0)
        .map(([bucketId, amount]) => ({ bucketId, amount }));

      await reconcileBuckets(entries);
      await refresh();
      showToast('Buckets updated');
      router.back();
    } catch (err: any) {
      alert(err.message ?? 'Failed to apply changes');
    } finally {
      setApplying(false);
    }
  };

  if (checking) {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColor} />
          <Text style={[styles.loadingText, { color: secondaryColor }]}>
            Checking your account...
          </Text>
        </View>
      </View>
    );
  }

  const isComplete = remaining === 0;

  return (
    <Pressable style={[styles.root, { backgroundColor: bgColor }]} onPress={Keyboard.dismiss}>
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
        >
          <X size={18} color={secondaryColor} weight="bold" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="interactive"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}>
          <Text style={[styles.title, { color: textColor }]}>
            Your balance{'\n'}updated
          </Text>
          <Text style={[styles.subtitle, { color: secondaryColor }]}>
            You spent outside the app — let's keep your buckets in sync.
          </Text>

          {/* Deficit pill */}
          <View style={styles.deficitRow}>
            <View style={[styles.deficitPill, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.deficitText, { color: textColor }]}>
                -{formatCurrency(deficit)} to assign
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Section label */}
        <Animated.View entering={FadeInDown.duration(400).delay(100).easing(Easing.out(Easing.cubic))}>
          <Text style={[styles.sectionLabel, { color: secondaryColor }]}>REMOVE FROM</Text>
        </Animated.View>

        {/* Bucket list */}
        {allBuckets.map((bucket, index) => {
          const palette = getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor);
          const Icon = bucket.iconType !== 'emoji' ? getBucketIcon(bucket.icon) : null;
          const adjCents = adjustments[bucket.id] ?? 0;
          const adjText = adjCents > 0 ? (adjCents / 100).toString() : '';

          return (
            <Animated.View
              key={bucket.id}
              entering={FadeInDown.duration(300).delay(200 + index * 50).easing(Easing.out(Easing.cubic))}
            >
              <Pressable
                onPress={() => handleQuickAssign(bucket.id)}
                style={[styles.bucketRow, { backgroundColor: surfaceColor }]}
              >
                <View style={[styles.bucketIcon, { backgroundColor: bucket.isMain ? palette.light : palette.main }]}>
                  {bucket.iconType === 'emoji' ? (
                    <Text style={{ fontSize: 16 }}>{bucket.icon}</Text>
                  ) : (
                    Icon && <Icon size={18} color={palette.cardText} weight="fill" />
                  )}
                </View>
                <View style={styles.bucketInfo}>
                  <Text style={[styles.bucketName, { color: textColor }]} numberOfLines={1}>
                    {bucket.name}
                  </Text>
                  <Text style={[styles.bucketBalance, { color: secondaryColor }]}>
                    {formatCurrency(bucket.currentAmount)} saved
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputPrefix, { color: secondaryColor }]}>-$</Text>
                  <View style={[styles.inputBox, { backgroundColor: bgColor }]}>
                    <TextInput
                      style={[styles.adjInput, { color: textColor }]}
                      value={adjText}
                      onChangeText={(t) => handleSetAmount(bucket.id, t)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={`${secondaryColor}40`}
                    />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Still to assign row */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(200 + allBuckets.length * 50).easing(Easing.out(Easing.cubic))}
          style={[styles.stillRow, { backgroundColor: surfaceColor }]}
        >
          <Text style={[styles.stillLabel, { color: secondaryColor }]}>Still to assign</Text>
          <Text style={[styles.stillAmount, { color: isComplete ? '#34C759' : textColor }]}>
            {formatCurrency(remaining)}
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: surfaceColor }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: '#34C759' }, progressStyle]} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={handleApply}
          disabled={!isComplete || applying}
          style={[
            styles.applyButton,
            { backgroundColor: isComplete && !applying ? textColor : surfaceColor },
          ]}
        >
          <Text style={[
            styles.applyText,
            { color: isComplete && !applying ? bgColor : secondaryColor },
          ]}>
            {applying ? 'Updating...' : 'Update buckets'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  // Header
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    marginBottom: 16,
  },
  deficitRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  deficitPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deficitText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },

  // Bucket rows
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  bucketIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketInfo: {
    flex: 1,
    gap: 2,
  },
  bucketName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  bucketBalance: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputPrefix: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  inputBox: {
    minWidth: 60,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  adjInput: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    textAlign: 'right',
    padding: 0,
  },

  // Still to assign
  stillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  stillLabel: {
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  stillAmount: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },

  // Progress
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // CTA
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  applyButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
