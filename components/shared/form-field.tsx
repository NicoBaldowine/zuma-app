import React from 'react';
import { View, TextInput, Text, StyleSheet, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  customPlaceholder?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  autoFocus,
  customPlaceholder,
  style,
}: FormFieldProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const hasValue = value.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }, style]}>
      {hasValue && (
        <Text style={[styles.label, { color: secondaryColor }]}>{label}</Text>
      )}
      <View style={customPlaceholder ? styles.inputWrapper : undefined}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={customPlaceholder ? '' : label}
          placeholderTextColor={secondaryColor}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
        />
        {customPlaceholder && !hasValue && (
          <View style={styles.placeholderOverlay} pointerEvents="none">
            {customPlaceholder}
          </View>
        )}
      </View>
    </View>
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
  input: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    letterSpacing: 0,
    padding: 0,
  },
  inputWrapper: {
    position: 'relative',
  },
  placeholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
