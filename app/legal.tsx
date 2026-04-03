import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Terms of Service',
    items: [
      {
        heading: 'Acceptance of Terms',
        body: 'By creating an account or using Zuma, you agree to be bound by these Terms of Service. If you do not agree, do not use the app. We may update these terms at any time; continued use after changes constitutes acceptance.',
      },
      {
        heading: 'Eligibility',
        body: 'You must be at least 18 years old and a U.S. resident to use Zuma. By signing up you confirm that all information you provide is accurate and complete.',
      },
      {
        heading: 'What Zuma Is',
        body: 'Zuma is a visual savings wallet that helps you organize money into goal-based buckets. Zuma is not a bank. Funds are held at our partner financial institution and are eligible for FDIC insurance up to $250,000 per depositor.',
      },
      {
        heading: 'Your Account',
        body: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately if you suspect unauthorized access. Zuma is not liable for losses resulting from unauthorized use of your account.',
      },
      {
        heading: 'Prohibited Uses',
        body: 'You may not use Zuma for any illegal activity, money laundering, fraud, or to circumvent any applicable law or regulation. We reserve the right to suspend or terminate your account if we suspect prohibited activity.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'Zuma is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Zuma shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app, including loss of funds due to technical errors, third-party service outages, or unauthorized access.',
      },
      {
        heading: 'Account Termination',
        body: 'You may close your account at any time from Account settings. Zuma may also suspend or terminate your account for violations of these terms. Upon termination, any remaining funds will be returned according to our standard withdrawal process.',
      },
    ],
  },
  {
    title: 'Privacy Policy',
    items: [
      {
        heading: 'Information We Collect',
        body: '\u2022 Account information: full name, email address, phone number, and date of birth (provided during sign-up via Google)\n\u2022 Financial information: bank account details (account name, institution, last 4 digits) obtained through Plaid with your explicit consent\n\u2022 Savings data: buckets, balances, transaction history, and auto-deposit rules you create within the app\n\u2022 Device information: push notification token and device type (iOS/Android) for delivering notifications',
      },
      {
        heading: 'How We Use Your Information',
        body: '\u2022 To provide and maintain Zuma\u2019s core features (buckets, transfers, auto-deposits)\n\u2022 To display your bank balance and account information\n\u2022 To send push notifications you have opted into (goal alerts, deposit confirmations, suggestions)\n\u2022 To verify your identity when required\n\u2022 To detect and prevent fraud or unauthorized activity\n\u2022 To improve the app and develop new features',
      },
      {
        heading: 'What We Do Not Do',
        body: '\u2022 We never sell, rent, or trade your personal data to third parties\n\u2022 We never store your bank login credentials \u2014 these are handled entirely by Plaid\n\u2022 We do not use your data for advertising or share it with ad networks\n\u2022 We do not collect location data, browsing history, or contacts\n\u2022 We do not initiate bank transactions without your explicit action',
      },
      {
        heading: 'Third-Party Services',
        body: 'Zuma relies on the following services, each with their own privacy policies:\n\n\u2022 Plaid \u2014 Secure, read-only bank account linking. Plaid accesses only the data you authorize and does not share it with other parties. See plaid.com/legal\n\u2022 Supabase \u2014 Authentication and encrypted database storage (SOC 2 Type II compliant)\n\u2022 Google \u2014 Sign-in authentication via OAuth\n\u2022 Expo \u2014 Push notification delivery',
      },
      {
        heading: 'Data Retention',
        body: 'We retain your data for as long as your account is active. Transaction history is kept for record-keeping and regulatory purposes. When you delete your account, we remove your personal data within 30 days, except where retention is required by law.',
      },
      {
        heading: 'Your Rights',
        body: 'Depending on your location, you may have the right to:\n\n\u2022 Access the personal data we hold about you\n\u2022 Request correction of inaccurate data\n\u2022 Request deletion of your account and data\n\u2022 Opt out of non-essential notifications\n\u2022 Revoke Plaid bank access at any time\n\nCalifornia residents have additional rights under the CCPA/CPRA. Contact us at support@zuma.app to exercise any of these rights.',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        heading: 'How We Protect Your Data',
        body: '\u2022 All data is encrypted in transit using TLS 1.3\n\u2022 Data at rest is encrypted with AES-256\n\u2022 Authentication sessions are stored securely on your device\n\u2022 Our infrastructure provider (Supabase) is SOC 2 Type II compliant\n\u2022 Bank credentials never touch our servers \u2014 Plaid handles all bank authentication directly',
      },
      {
        heading: 'Your Responsibilities',
        body: 'Keep your device secure and your Google account protected with a strong password and two-factor authentication. Do not share your virtual card details with others. Report any suspicious activity immediately.',
      },
    ],
  },
];

export default function LegalScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: textColor }]}>Terms & Privacy</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.heading} style={styles.item}>
                <Text style={[styles.itemHeading, { color: textColor }]}>{item.heading}</Text>
                <Text style={[styles.itemBody, { color: secondaryColor }]}>{item.body}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={[styles.footer, { color: secondaryColor }]}>
          Last updated: April 2026{'\n'}Zuma Inc. All rights reserved.{'\n'}Questions? Contact support@zuma.app
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    marginBottom: 16,
  },
  item: {
    marginBottom: 18,
  },
  itemHeading: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    marginBottom: 6,
  },
  itemBody: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    lineHeight: 23,
  },
  footer: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
});
