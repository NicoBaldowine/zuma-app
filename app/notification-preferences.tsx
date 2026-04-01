import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

const categories = [
  { key: 'auto_deposits', label: 'Auto-deposits', description: 'When an auto-deposit is executed' },
  { key: 'goal_reached', label: 'Goal reached', description: 'When a bucket reaches its target' },
  { key: 'weekly_summary', label: 'Weekly summary', description: 'Your savings recap every Monday' },
  { key: 'low_balance', label: 'Low balance', description: 'When your Main Bucket is running low' },
];

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    auto_deposits: true,
    goal_reached: true,
    weekly_summary: true,
    low_balance: true,
  });

  function toggle(key: string) {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>

        {categories.map((cat) => (
          <View key={cat.key} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: textColor }]}>{cat.label}</Text>
              <Text style={[styles.rowDescription, { color: secondaryColor }]}>{cat.description}</Text>
            </View>
            <Switch
              value={enabled[cat.key]}
              onValueChange={() => toggle(cat.key)}
              trackColor={{ false: surfaceColor, true: textColor }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  rowDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
});
