import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Bank, ShieldCheck, Eye, LinkBreak } from 'phosphor-react-native';
import { useState, useEffect } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth/get-user-id';
import { resetAllBucketBalances } from '@/lib/api/transfers';
import { usePlaidLink } from '@/hooks/use-plaid-link';

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

type LinkedAccount = {
  institutionName: string;
  accountName: string;
  accountMask: string;
  accountSubtype: string;
  connectedDate: string;
};

const FAKE_ACCOUNT: LinkedAccount = {
  institutionName: 'Chase',
  accountName: 'Chase Savings',
  accountMask: '9878',
  accountSubtype: 'savings',
  connectedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
};

export default function LinkedAccountScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const [account, setAccount] = useState<LinkedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Check if already linked in DB
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('linked_accounts')
          .select('institution_name, account_name, account_mask, account_subtype, created_at')
          .eq('user_id', getCurrentUserId())
          .maybeSingle();

        if (data) {
          setAccount({
            institutionName: data.institution_name ?? 'Bank',
            accountName: data.account_name ?? 'Account',
            accountMask: data.account_mask ?? '0000',
            accountSubtype: data.account_subtype ?? 'checking',
            connectedDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Simulate connecting with Plaid
  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnecting(true);

    // Simulate a brief loading delay
    await new Promise((r) => setTimeout(r, 1200));

    // Insert fake linked account into DB + seed balance
    try {
      await (supabase.from as any)('linked_accounts').upsert({
        user_id: getCurrentUserId(),
        institution_name: FAKE_ACCOUNT.institutionName,
        account_name: FAKE_ACCOUNT.accountName,
        account_mask: FAKE_ACCOUNT.accountMask,
        account_subtype: FAKE_ACCOUNT.accountSubtype,
      }, { onConflict: 'user_id' });
      await seedMainBucketBalance(250000); // $2,500
    } catch {}

    setAccount(FAKE_ACCOUNT);
    setConnecting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Unlink account
  const handleUnlink = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Unlink account',
      'Are you sure you want to disconnect your bank account? You can reconnect anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await (supabase.from as any)('linked_accounts')
                .delete()
                .eq('user_id', getCurrentUserId());
              await resetAllBucketBalances();
            } catch {}
            setAccount(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  if (loading) {
    return <View style={[styles.root, { backgroundColor: bgColor }]} />;
  }

  // ─── Connected state ───
  if (account) {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={() => router.back()} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>Linked account</Text>

          {/* Bank card */}
          <View style={[styles.card, { backgroundColor: surfaceColor }]}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(128,128,128,0.12)' }]}>
              <Bank size={22} color={secondaryColor} weight="fill" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: textColor }]}>
                {account.institutionName}
              </Text>
              <Text style={[styles.cardSub, { color: secondaryColor }]}>
                {account.accountSubtype.charAt(0).toUpperCase() + account.accountSubtype.slice(1)} ••{account.accountMask}
              </Text>
            </View>
            <ShieldCheck size={20} color="#34C759" weight="fill" />
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: secondaryColor }]}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={[styles.detailValue, { color: textColor }]}>Connected</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: secondaryColor }]}>Since</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{account.connectedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: secondaryColor }]}>Access</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>Read-only</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: secondaryColor }]}>Provider</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>Plaid</Text>
            </View>
          </View>

          <Text style={[styles.disclaimer, { color: secondaryColor }]}>
            Zuma has read-only access to your account balance. We never initiate transfers or withdraw funds.
          </Text>
        </View>

        {/* Unlink button */}
        <View style={styles.bottom}>
          <Pressable onPress={handleUnlink} style={[styles.unlinkButton, { backgroundColor: surfaceColor }]}>
            <LinkBreak size={18} color={secondaryColor} weight="bold" />
            <Text style={[styles.unlinkText, { color: secondaryColor }]}>Unlink account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Not connected state ───
  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={styles.notConnectedContent}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={() => router.back()} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
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

        <View style={styles.bottom}>
          <Pressable
            onPress={handleConnect}
            disabled={connecting}
            style={[styles.connectButton, { backgroundColor: textColor, opacity: connecting ? 0.7 : 1 }]}
          >
            <Text style={[styles.connectText, { color: bgColor }]}>
              {connecting ? 'Connecting...' : 'Connect with Plaid'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={styles.skipButton}
          >
            <Text style={[styles.skipText, { color: secondaryColor }]}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  content: { flex: 1, paddingHorizontal: 20 },
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
  // Connected state
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    marginBottom: 28,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 17, fontFamily: Fonts.semiBold },
  cardSub: { fontSize: 14, fontFamily: Fonts.regular },
  details: { marginBottom: 24 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 15, fontFamily: Fonts.regular },
  detailValue: { fontSize: 15, fontFamily: Fonts.medium },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  disclaimer: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  unlinkButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  unlinkText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  // Not connected state
  notConnectedContent: { flex: 1 },
  benefits: { gap: 24 },
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
  benefitText: { flex: 1, gap: 4 },
  benefitTitle: { fontSize: 15, fontFamily: Fonts.semiBold },
  benefitDesc: { fontSize: 14, fontFamily: Fonts.regular, lineHeight: 20 },
  bottom: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  connectButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: { fontSize: 16, fontFamily: Fonts.bold },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: 16, fontFamily: Fonts.semiBold },
});
