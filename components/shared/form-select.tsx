import React from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

type FormSelectProps = {
  label: string;
  value?: string | null;
  onPress: () => void;
  selectedIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FormSelect({
  label,
  value,
  onPress,
  selectedIcon,
  style,
}: FormSelectProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const hasValue = !!value;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: surfaceColor }, style]}
    >
      <View style={styles.row}>
        {hasValue ? (
          <View style={styles.selectedContent}>
            {selectedIcon}
            <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>
              {value}
            </Text>
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: secondaryColor }]}>{label}</Text>
        )}
        <CaretDown size={14} color={secondaryColor} weight="bold" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
