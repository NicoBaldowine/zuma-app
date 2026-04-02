import { StyleSheet, Pressable, View } from 'react-native';
import type { ComponentType } from 'react';
import type { IconProps } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

type ActionButtonProps = {
  icon: ComponentType<IconProps>;
  label: string;
  onPress: () => void;
};

export function ActionButton({ icon: Icon, label, onPress }: ActionButtonProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const iconColor = useThemeColor({}, 'text');
  const textColor = useThemeColor({}, 'text');

  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.circle, { backgroundColor: surfaceColor }]}>
        <Icon size={24} color={iconColor} weight="fill" />
      </View>
      <ThemedText style={[styles.label, { color: textColor, opacity: 0.6 }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});
