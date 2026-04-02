import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Terms of Service',
    content:
      'By using Zuma, you agree to these terms. Zuma provides a visual savings wallet that helps you organize your money into buckets. We do not provide banking services directly. All funds are held at our partner financial institution and are FDIC-insured up to $250,000.\n\nYou must be at least 18 years old to use Zuma. You are responsible for maintaining the security of your account credentials.',
  },
  {
    title: 'Privacy Policy',
    content:
      'We collect only the information necessary to provide our services: your name, email, and bank connection data through Plaid. We never sell your personal data to third parties.\n\nBank credentials are handled entirely by Plaid and are never stored on our servers. We use read-only access to display your balance and do not initiate any transactions on your behalf.',
  },
  {
    title: 'Data & Security',
    content:
      'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your session tokens are stored securely on your device. We use Supabase for authentication and database services, which is SOC 2 Type II compliant.\n\nYou can request deletion of your account and all associated data at any time from the Account settings.',
  },
  {
    title: 'Third-Party Services',
    content:
      'Zuma integrates with the following services:\n\n- Plaid: Secure bank account linking (read-only access)\n- Supabase: Authentication and data storage\n- Google: Sign-in authentication\n\nEach service has its own privacy policy and terms of service.',
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
        <Text style={[styles.title, { color: textColor }]}>Legal & Policies</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: secondaryColor }]}>{section.content}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: secondaryColor }]}>
          Last updated: April 2026{'\n'}Zuma Inc. All rights reserved.
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
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginBottom: 10,
  },
  sectionContent: {
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
