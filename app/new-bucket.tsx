import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PiggyBank, CreditCard } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export default function NewBucketSheet() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace('/create-bucket');
        }}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: surfaceColor }]}>
          <PiggyBank size={20} color={textColor} weight="fill" />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.label, { color: textColor }]}>Save bucket</Text>
          <Text style={[styles.desc, { color: secondaryColor }]}>
            Save toward a goal and unlock a virtual card when you're done
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace('/spend-bucket');
        }}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: surfaceColor }]}>
          <CreditCard size={20} color={textColor} weight="fill" />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.label, { color: textColor }]}>Spend bucket</Text>
          <Text style={[styles.desc, { color: secondaryColor }]}>
            Set a monthly budget with a virtual card for everyday spending
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 12,
    marginBottom: -16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 17,
    fontFamily: Fonts.medium,
  },
  desc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 17,
  },
});
