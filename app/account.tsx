import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import {
  X, UserCircle, Bell,
  Moon, ChatCircle, FileText,
  SignOut, Bank,
} from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemePreference } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Fonts } from '@/constants/theme';
import { hasLinkedAccount } from '@/lib/api/plaid';

type SectionItem = {
  key: string;
  label: string;
  icon: any;
  destructive?: boolean;
  badge?: string;
  badgeColor?: string;
};

const sections: { title: string; items: SectionItem[] }[] = [
  {
    title: 'Profile',
    items: [
      { key: 'profile', label: 'Personal Information', icon: UserCircle },
      { key: 'linked-account', label: 'Bank Account', icon: Bank },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { key: 'notifications', label: 'Notifications', icon: Bell },
      { key: 'appearance', label: 'Appearance', icon: Moon, badge: 'System', badgeColor: 'grey' },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'feedback', label: 'Send Feedback', icon: ChatCircle },
      { key: 'legal', label: 'Terms & Privacy', icon: FileText },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'logout', label: 'Log Out', icon: SignOut },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { preference } = useThemePreference();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const [bankLinked, setBankLinked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      hasLinkedAccount().then(setBankLinked).catch(() => {});
    }, [])
  );
  function handleItem(key: string) {
    if (key === 'profile') { router.push('/personal-info'); return; }
    if (key === 'identity') { router.push('/identity-verification'); return; }
    if (key === 'linked-account') { router.push('/linked-account'); return; }
    if (key === 'notifications') { router.push('/notification-preferences'); return; }
    if (key === 'appearance') { router.push('/appearance'); return; }
    if (key === 'security') { router.push('/security'); return; }
    if (key === 'feedback') { router.push('/feedback'); return; }
    if (key === 'legal') { router.push('/legal'); return; }
    if (key === 'logout') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => { signOut(); } },
      ]);
      return;
    }
  }

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
        <Text style={[styles.title, { color: textColor }]}>Account</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
              {section.title}
            </Text>
            {section.items.map((item) => {
              const Icon = item.icon;
              const color = item.destructive ? '#FF453A' : textColor;
              const badgeText = item.key === 'appearance'
                ? preference.charAt(0).toUpperCase() + preference.slice(1)
                : item.key === 'linked-account'
                  ? (bankLinked ? 'Linked' : 'Not linked')
                  : item.badge;
              const badgeColor = item.key === 'linked-account'
                ? (bankLinked ? 'green' : 'yellow')
                : item.badgeColor;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleItem(item.key)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[
                    styles.iconCircle,
                    { backgroundColor: item.destructive ? 'rgba(255,69,58,0.12)' : surfaceColor },
                  ]}>
                    <Icon size={20} color={color} weight="fill" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={[styles.itemLabel, { color }]}>{item.label}</Text>
                  </View>
                  {badgeText && (
                    <View style={[styles.badge, { backgroundColor: surfaceColor }]}>
                      <Text style={[styles.badgeText, { color: badgeColor === 'green' ? '#34C759' : badgeColor === 'grey' ? secondaryColor : '#E8A317' }]}>{badgeText}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={[styles.version, { color: secondaryColor }]}>
          Zuma v1.0.0
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    marginBottom: 32,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 8,
  },
});
