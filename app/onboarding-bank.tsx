import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ShieldCheck, Eye, Bank, ArrowLeft } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { usePlaidLink } from '@/hooks/use-plaid-link';
import { completeOnboarding, getPendingBucket, clearPendingBucket } from '@/utils/onboarding-store';
import { useBuckets } from '@/contexts/buckets-context';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Bank-level security',
    description: 'We use Plaid to securely connect your bank. Your credentials are never stored on our servers.',
  },
  {
    icon: Eye,
    title: 'Read-only access',
    description: 'Zuma mirrors your bank balance to track savings across buckets. We never withdraw or move money from your bank account.',
  },
  {
    icon: Bank,
    title: 'Your bank, your control',
    description: 'Disconnect anytime from settings. Your bank data is encrypted and only used to power your savings goals.',
  },
];

export default function OnboardingBankScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const insets = useSafeAreaInsets();

  const { open: openPlaid, loading: plaidLoading } = usePlaidLink();
  const { createBucket } = useBuckets();

  const handleFinish = async () => {
    // Create the pending bucket from onboarding
    const pending = getPendingBucket();
    if (pending) {
      try {
        await createBucket(pending);
        clearPendingBucket();
      } catch (err: any) {
        console.warn('Failed to create onboarding bucket:', err.message);
      }
    }
    completeOnboarding();
    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.content}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={[styles.backCircle, { backgroundColor: surfaceColor }]}
        >
          <ArrowLeft size={18} color={secondaryColor} weight="bold" />
        </Pressable>

        <Text style={[styles.title, { color: textColor }]}>
          Connect your{'\n'}bank account
        </Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          Link your bank to start funding your buckets and tracking your savings in real time.
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <View key={benefit.title} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: surfaceColor }]}>
                  <Icon size={22} color={textColor} weight="fill" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={[styles.benefitTitle, { color: textColor }]}>{benefit.title}</Text>
                  <Text style={[styles.benefitDesc, { color: secondaryColor }]}>{benefit.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const result = await openPlaid();
            if (result.success) {
              handleFinish();
            } else if (result.error && result.error !== 'Link cancelled') {
              alert(result.error);
            }
          }}
          disabled={plaidLoading}
          style={[styles.connectButton, { backgroundColor: textColor, opacity: plaidLoading ? 0.7 : 1 }]}
        >
          <Text style={[styles.connectText, { color: bgColor }]}>
            {plaidLoading ? 'Connecting...' : 'Connect with Plaid'}
          </Text>
        </Pressable>

        <Pressable
          onPress={async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await handleFinish(); }}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, { color: secondaryColor }]}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  step: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    marginBottom: 36,
  },
  benefits: {
    gap: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    gap: 4,
  },
  benefitTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  benefitDesc: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  bottom: {
    paddingHorizontal: 20,
    gap: 12,
  },
  connectButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
