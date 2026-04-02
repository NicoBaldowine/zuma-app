import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, IdentificationCard, ShieldCheck, Clock } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

const steps = [
  { icon: IdentificationCard, title: 'Government-issued ID', description: 'Passport, driver\'s license, or national ID card' },
  { icon: ShieldCheck, title: 'Personal information', description: 'Full legal name, date of birth, and address' },
  { icon: Clock, title: 'Quick verification', description: 'Usually takes less than 2 minutes to complete' },
];

export default function IdentityVerificationScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: textColor }]}>Verify your{'\n'}identity</Text>

        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          To add funds, withdraw, or generate virtual cards, we need to verify your identity. Have the following ready:
        </Text>

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <View key={step.title} style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: surfaceColor }]}>
                <Icon size={22} color={textColor} weight="fill" />
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
                <Text style={[styles.stepDescription, { color: secondaryColor }]}>{step.description}</Text>
              </View>
            </View>
          );
        })}

        <View style={[styles.infoCard, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.infoText, { color: secondaryColor }]}>
            Your information is encrypted and securely stored. We use it only for identity verification as required by financial regulations.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.verifyButton, { backgroundColor: textColor }]}
        >
          <Text style={[styles.verifyButtonText, { color: bgColor }]}>Start verification</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 16, marginTop: 8 },
  subtitle: { fontSize: 16, fontFamily: Fonts.regular, lineHeight: 22, marginBottom: 32 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 16, fontFamily: Fonts.medium },
  stepDescription: { fontSize: 13, fontFamily: Fonts.regular },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  infoText: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 18 },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  verifyButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: { fontSize: 16, fontFamily: Fonts.bold },
});
