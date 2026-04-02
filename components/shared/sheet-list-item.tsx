import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { ComponentType } from 'react';
import type { IconProps } from 'phosphor-react-native';
import { Check } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

type SheetListItemProps = {
  icon: ComponentType<IconProps>;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  selected?: boolean;
  rightElement?: React.ReactNode;
};

export function SheetListItem({
  icon: Icon,
  label,
  onPress,
  destructive = false,
  selected = false,
  rightElement,
}: SheetListItemProps) {
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');

  const color = destructive ? '#FF453A' : textColor;
  const iconBg = destructive ? 'rgba(255,69,58,0.12)' : surfaceColor;

  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Icon size={20} color={color} weight="fill" />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {selected && <Check size={20} color={textColor} weight="bold" />}
      {rightElement}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  label: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.medium,
  },
});
