import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  X, UserCircle, IdentificationBadge, Bell, ShieldCheck,
  Moon, Globe, Lifebuoy, ChatCircle, FileText, Receipt,
  SignOut, Trash, CaretRight,
} from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

type SectionItem = {
  key: string;
  label: string;
  icon: any;
  destructive?: boolean;
  sublabel?: string;
  badge?: 'warning';
};

const sections: { title: string; items: SectionItem[] }[] = [
  {
    title: 'Profile',
    items: [
      { key: 'profile', label: 'Personal Information', icon: UserCircle },
      { key: 'identity', label: 'Identity Verification', icon: IdentificationBadge, badge: 'warning' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { key: 'notifications', label: 'Notifications', icon: Bell },
      { key: 'appearance', label: 'Appearance', icon: Moon, sublabel: 'Dark' },
      { key: 'language', label: 'Language', icon: Globe, sublabel: 'English' },
    ],
  },
  {
    title: 'Security',
    items: [
      { key: 'security', label: 'Security & Privacy', icon: ShieldCheck },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'help', label: 'Help Center', icon: Lifebuoy },
      { key: 'feedback', label: 'Send Feedback', icon: ChatCircle },
      { key: 'legal', label: 'Legal & Policies', icon: FileText },
      { key: 'statements', label: 'Statements', icon: Receipt },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'logout', label: 'Log Out', icon: SignOut },
      { key: 'delete', label: 'Delete Account', icon: Trash, destructive: true },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  function handleItem(key: string) {
    if (key === 'appearance') {
      router.push('/appearance');
      return;
    }
    if (key === 'logout') {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {} },
      ]);
      return;
    }
    if (key === 'delete') {
      Alert.alert(
        'Delete Account',
        'This action is permanent. All your data, buckets, and savings will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Account', style: 'destructive', onPress: () => {} },
        ],
      );
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
              const sublabel = item.sublabel;
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
                  {item.badge === 'warning' && (
                    <View style={[styles.warningBadge, { backgroundColor: surfaceColor }]}>
                      <Text style={[styles.warningBadgeText, { color: '#E8A317' }]}>Not verified</Text>
                    </View>
                  )}
                  {sublabel && !item.badge && (
                    <Text style={[styles.sublabel, { color: secondaryColor }]}>{sublabel}</Text>
                  )}
                  {!item.destructive && (
                    <CaretRight size={16} color={secondaryColor} weight="bold" />
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
    alignSelf: 'flex-start',
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
  sublabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginRight: 4,
  },
  warningBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 4,
  },
  warningBadgeText: {
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
