import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Wallet, Scales, SlidersHorizontal } from 'phosphor-react-native';
import Animated, { FadeInDown, Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { formatCurrency } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { useCelebration } from '@/contexts/celebration-context';
import { reconcileBuckets } from '@/lib/api/transfers';

// SIMULATION: Replace with actual Plaid getBalance() when ready
const SIMULATED_DECREASE_CENTS = 8500; // $85

type Step = 'checking' | 'choose' | 'custom';

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

  const [step, setStep] = useState<Step>('checking');
  const [deficit, setDeficit] = useState(0);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [applying, setApplying] = useState(false);

  const nonMainBuckets = buckets.filter((b) => !b.isMain).sort((a, b) => a.order - b.order);
  const mainBucket = buckets.find((b) => b.isMain);
  const allBuckets = mainBucket ? [mainBucket, ...nonMainBuckets] : nonMainBuckets;

  const totalAssigned = Object.values(adjustments).reduce((sum, v) => sum + v, 0);
  const remaining = deficit - totalAssigned;

  const progressWidth = useSharedValue(0);
  useEffect(() => {
    if (deficit > 0) progressWidth.value = withTiming(totalAssigned / deficit, { duration: 300 });
  }, [totalAssigned, deficit]);

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
      setStep('choose');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Option 1: Deduct all from Main Bucket
  const handleMainBucketOnly = () => {
    if (!mainBucket || applying) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
    // Fire and forget — updates happen in background
    reconcileBuckets([{ bucketId: mainBucket.id, amount: deficit }])
      .then(() => refresh())
      .then(() => showToast('Buckets updated'))
      .catch(() => {});
  };

  // Option 2: Distribute proportionally across all buckets
  const handleProportional = () => {
    if (applying) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const totalBalance = allBuckets.reduce((s, b) => s + b.currentAmount, 0);
    if (totalBalance === 0) return;

    const entries = allBuckets
      .map((b) => ({
        bucketId: b.id,
        amount: Math.round((b.currentAmount / totalBalance) * deficit),
      }))
      .filter((e) => e.amount > 0);

    const roundingDiff = deficit - entries.reduce((s, e) => s + e.amount, 0);
    if (entries.length > 0 && roundingDiff !== 0) {
      entries[0].amount += roundingDiff;
    }

    router.back();
    // Fire and forget
    reconcileBuckets(entries)
      .then(() => refresh())
      .then(() => showToast('Buckets updated'))
      .catch(() => {});
  };

  // Option 3: Go to custom assignment
  const handleCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAdjustments({});
    setStep('custom');
  };

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

  const handleApplyCustom = async () => {
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

  // ─── Loading ───
  if (step === 'checking') {
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

  // ─── Step: Choose strategy ───
  if (step === 'choose') {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={() => router.back()} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}>
            <Text style={[styles.title, { color: textColor }]}>
              Your balance{'\n'}updated
            </Text>
            <Text style={[styles.subtitle, { color: secondaryColor }]}>
              Your bank balance decreased by{' '}
              <Text style={{ color: textColor, fontFamily: Fonts.semiBold }}>
                {formatCurrency(deficit)}
              </Text>
              . How would you like to adjust?
            </Text>
          </Animated.View>

          {/* Option 1: Main Bucket */}
          <Animated.View entering={FadeInDown.duration(400).delay(150).easing(Easing.out(Easing.cubic))}>
            <Pressable
              onPress={handleMainBucketOnly}
              disabled={applying}
              style={[styles.optionCard, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.optionIcon}>
                <Wallet size={24} color={textColor} weight="fill" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: textColor }]}>Deduct from Main</Text>
                <Text style={[styles.optionDesc, { color: secondaryColor }]}>
                  Remove {formatCurrency(deficit)} from your Main Bucket only. Your savings buckets stay untouched.
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Option 2: Proportional */}
          <Animated.View entering={FadeInDown.duration(400).delay(250).easing(Easing.out(Easing.cubic))}>
            <Pressable
              onPress={handleProportional}
              disabled={applying}
              style={[styles.optionCard, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.optionIcon}>
                <Scales size={24} color={textColor} weight="fill" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: textColor }]}>Split proportionally</Text>
                <Text style={[styles.optionDesc, { color: secondaryColor }]}>
                  Reduce all buckets by their share of the total. Buckets with more saved contribute more.
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Option 3: Custom */}
          <Animated.View entering={FadeInDown.duration(400).delay(350).easing(Easing.out(Easing.cubic))}>
            <Pressable
              onPress={handleCustom}
              style={[styles.optionCard, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.optionIcon}>
                <SlidersHorizontal size={24} color={textColor} weight="fill" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: textColor }]}>Choose manually</Text>
                <Text style={[styles.optionDesc, { color: secondaryColor }]}>
                  Pick exactly how much to deduct from each bucket. Best if you spent from a specific goal.
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>

      </View>
    );
  }

  // ─── Step: Custom assignment ───
  const isComplete = remaining === 0;

  return (
    <Pressable style={[styles.root, { backgroundColor: bgColor }]} onPress={Keyboard.dismiss}>
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => setStep('choose')}
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
        {/* Amount + progress bar header */}
        <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))} style={styles.customHeader}>
          <Text style={[styles.customAmount, { color: textColor }]}>
            {formatCurrency(remaining)}
          </Text>
          <Text style={[styles.customLabel, { color: secondaryColor }]}>
            left to assign
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: surfaceColor }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: '#34C759' }, progressStyle]} />
          </View>
        </Animated.View>

        {/* Bucket list */}
        {allBuckets.map((bucket, index) => {
          const palette = getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor);
          const Icon = bucket.iconType === 'icon' ? getBucketIcon(bucket.icon) : null;
          const adjCents = adjustments[bucket.id] ?? 0;
          const adjText = adjCents > 0 ? (adjCents / 100).toString() : '';

          return (
            <Animated.View
              key={bucket.id}
              entering={FadeInDown.duration(300).delay(100 + index * 50).easing(Easing.out(Easing.cubic))}
            >
              <Pressable
                onPress={() => handleQuickAssign(bucket.id)}
                style={[styles.bucketRow, { backgroundColor: surfaceColor }]}
              >
                <View style={[styles.bucketIcon, { backgroundColor: bucket.isMain ? palette.light : palette.main }]}>
                  {bucket.iconType === 'pixel' ? (
                    <PixelIcon data={JSON.parse(bucket.icon)} size={18} color={palette.cardText} />
                  ) : bucket.iconType === 'emoji' ? (
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
                    {formatCurrency(bucket.currentAmount)}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={handleApplyCustom}
          disabled={!isComplete || applying}
          style={[
            styles.applyButton,
            { backgroundColor: textColor, opacity: isComplete && !applying ? 1 : 0.25 },
          ]}
        >
          <Text style={[
            styles.applyText,
            { color: bgColor },
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontFamily: Fonts.medium },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 40, letterSpacing: 36 * -0.05, marginBottom: 8, marginTop: 8 },
  subtitle: { fontSize: 16, fontFamily: Fonts.regular, lineHeight: 24, marginBottom: 24 },

  // Options
  optionCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(128,128,128,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  optionText: { flex: 1, gap: 4 },
  optionTitle: { fontSize: 16, fontFamily: Fonts.semiBold },
  optionDesc: { fontSize: 14, fontFamily: Fonts.regular, lineHeight: 20 },

  // Custom bucket rows
  bucketRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, marginBottom: 8 },
  bucketIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bucketInfo: { flex: 1, gap: 2 },
  bucketName: { fontSize: 16, fontFamily: Fonts.medium },
  bucketBalance: { fontSize: 13, fontFamily: Fonts.regular },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inputPrefix: { fontSize: 15, fontFamily: Fonts.medium },
  inputBox: { minWidth: 60, height: 40, borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' },
  adjInput: { fontSize: 16, fontFamily: Fonts.medium, textAlign: 'right', padding: 0 },

  // Custom header
  customHeader: { marginBottom: 20 },
  customAmount: { fontSize: 36, fontFamily: Fonts.medium, letterSpacing: 36 * -0.05, marginBottom: 2 },
  customLabel: { fontSize: 14, fontFamily: Fonts.regular, marginBottom: 12 },

  // Progress
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // CTA
  bottomButton: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12 },
  applyButton: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 16, fontFamily: Fonts.bold },
});
