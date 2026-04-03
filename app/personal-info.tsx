import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X } from 'phosphor-react-native';
import { useState, useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z" />
      <Path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z" />
      <Path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z" />
      <Path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z" />
    </Svg>
  );
}
import { fetchProfile } from '@/lib/api/profiles';
import type { Profile } from '@/types';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const fields = [
    { label: 'Name', value: profile?.fullName ?? 'Not added' },
    { label: 'Email', value: profile?.email ?? 'Not added' },
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="always">
        <Text style={[styles.title, { color: textColor }]}>Personal{'\n'}information</Text>

        {/* Google connection banner */}
        <View style={[styles.banner, { backgroundColor: surfaceColor }]}>
          <GoogleLogo size={20} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: textColor }]}>Connected with Google</Text>
            <Text style={[styles.bannerSub, { color: secondaryColor }]}>
              Your name and email are managed by your Google account
            </Text>
          </View>
        </View>

        {/* Info fields */}
        {fields.map((field) => (
          <View key={field.label} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: secondaryColor }]}>{field.label}</Text>
            <Text style={[styles.fieldValue, { color: field.value === 'Not added' ? secondaryColor : textColor }]}>
              {field.value}
            </Text>
          </View>
        ))}

        <View style={styles.deleteSpacer} />

        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(
              'Delete Account',
              'This action is permanent. All your data, buckets, and savings will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Account', style: 'destructive', onPress: () => {} },
              ],
            );
          }}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, flexGrow: 1 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  bannerText: { flex: 1, gap: 2 },
  bannerTitle: { fontSize: 14, fontFamily: Fonts.semiBold },
  bannerSub: { fontSize: 13, fontFamily: Fonts.regular },
  field: {
    paddingVertical: 16,
  },
  fieldLabel: { fontSize: 13, fontFamily: Fonts.regular, marginBottom: 4 },
  fieldValue: { fontSize: 16, fontFamily: Fonts.medium },
  deleteSpacer: {
    flex: 1,
    minHeight: 60,
  },
  deleteButton: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,69,58,0.12)',
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#FF453A',
  },
});
