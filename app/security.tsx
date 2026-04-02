import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Fingerprint, Lock, DeviceMobile, ShieldCheck } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export default function SecurityScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  const [faceId, setFaceId] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const sessions = [
    { device: 'iPhone 15 Pro', location: 'San Francisco, CA', current: true },
    { device: 'MacBook Pro', location: 'San Francisco, CA', current: false },
  ];

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
        <Text style={[styles.title, { color: textColor }]}>Security &{'\n'}privacy</Text>

        {/* Biometric */}
        <Text style={[styles.sectionTitle, { color: secondaryColor }]}>Authentication</Text>

        <View style={styles.toggleRow}>
          <View style={[styles.toggleIcon, { backgroundColor: surfaceColor }]}>
            <Fingerprint size={20} color={textColor} weight="fill" />
          </View>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>Face ID / Touch ID</Text>
            <Text style={[styles.toggleSub, { color: secondaryColor }]}>Unlock the app with biometrics</Text>
          </View>
          <Switch value={faceId} onValueChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFaceId(val); }} trackColor={{ false: surfaceColor, true: textColor }} thumbColor="#FFFFFF" />
        </View>

        <View style={styles.toggleRow}>
          <View style={[styles.toggleIcon, { backgroundColor: surfaceColor }]}>
            <ShieldCheck size={20} color={textColor} weight="fill" />
          </View>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>Two-factor authentication</Text>
            <Text style={[styles.toggleSub, { color: secondaryColor }]}>Extra security for your account</Text>
          </View>
          <Switch value={twoFactor} onValueChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTwoFactor(val); }} trackColor={{ false: surfaceColor, true: textColor }} thumbColor="#FFFFFF" />
        </View>

        <Pressable style={styles.actionRow}>
          <View style={[styles.toggleIcon, { backgroundColor: surfaceColor }]}>
            <Lock size={20} color={textColor} weight="fill" />
          </View>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>Change PIN</Text>
            <Text style={[styles.toggleSub, { color: secondaryColor }]}>Update your 6-digit PIN</Text>
          </View>
        </Pressable>

        {/* Active sessions */}
        <Text style={[styles.sectionTitle, { color: secondaryColor, marginTop: 32 }]}>Active sessions</Text>

        {sessions.map((session, i) => (
          <View key={i} style={styles.sessionRow}>
            <View style={[styles.toggleIcon, { backgroundColor: surfaceColor }]}>
              <DeviceMobile size={20} color={textColor} weight="fill" />
            </View>
            <View style={styles.toggleText}>
              <Text style={[styles.toggleLabel, { color: textColor }]}>
                {session.device} {session.current && '· This device'}
              </Text>
              <Text style={[styles.toggleSub, { color: secondaryColor }]}>{session.location}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  sectionTitle: { fontSize: 11, fontFamily: Fonts.medium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: { fontSize: 16, fontFamily: Fonts.medium },
  toggleSub: { fontSize: 13, fontFamily: Fonts.regular },
});
