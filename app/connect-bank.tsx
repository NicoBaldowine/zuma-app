import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, ShieldCheck, Eye, Bank, Lightning } from 'phosphor-react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { useBuckets } from '@/contexts/buckets-context';
import { usePlaidLink } from '@/hooks/use-plaid-link';
import { useCelebration } from '@/contexts/celebration-context';

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

export default function AddFundsScreen() {
  const router = useRouter();
  const { mainBucket, addFunds } = useBuckets();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const [simulating, setSimulating] = useState(false);
  const { open: openPlaid, loading: plaidLoading } = usePlaidLink();
  const { showToast } = useCelebration();

  const handleSimulateDeposit = () => {
    Alert.prompt(
      'Simulate Deposit',
      'Enter amount in dollars to deposit to Main Bucket',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deposit',
          onPress: async (value?: string) => {
            const cents = Math.round(parseFloat(value ?? '0') * 100);
            if (cents <= 0 || !mainBucket) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSimulating(true);
            try {
              await addFunds(mainBucket.id, cents, 'Bank deposit');
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to add funds');
            } finally {
              setSimulating(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad',
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
        >
          <X size={18} color={secondaryColor} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.content}>
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

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const result = await openPlaid();
            if (result.success) {
              showToast(`${result.institutionName ?? 'Bank'} connected!`);
              router.back();
            } else if (result.error && result.error !== 'Link cancelled') {
              alert(result.error);
            }
          }}
          disabled={plaidLoading}
          style={[styles.connectButton, { backgroundColor: textColor }]}
        >
          <Text style={[styles.connectText, { color: bgColor }]}>
            {plaidLoading ? 'Connecting...' : 'Connect with Plaid'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSimulateDeposit}
          style={styles.devLink}
        >
          <Lightning size={14} color={secondaryColor} weight="fill" />
          <Text style={[styles.devLinkText, { color: secondaryColor }]}>
            {simulating ? 'Depositing...' : 'Simulate deposit (dev)'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyClose: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 12,
    marginTop: 8,
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
    paddingTop: 12,
    gap: 16,
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
  devLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  devLinkText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
});
