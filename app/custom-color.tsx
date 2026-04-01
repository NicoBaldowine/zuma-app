import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';
import ColorPicker, { Panel1, HueSlider, Preview } from 'reanimated-color-picker';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export default function CustomColorScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const onSelectColor = useCallback(({ hex }: { hex: string }) => {
    setSelectedColor(hex);
  }, []);

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

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Custom color</Text>

        <ColorPicker
          style={styles.picker}
          value={selectedColor}
          onComplete={onSelectColor}
        >
          <Preview style={styles.preview} hideInitialColor />
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.hueSlider} />
        </ColorPicker>

        <Text style={[styles.hexLabel, { color: secondaryColor }]}>
          {selectedColor.toUpperCase()}
        </Text>
      </View>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={() => {
            // TODO: pass color back via params/context
            router.back();
          }}
          style={[styles.selectButton, { backgroundColor: selectedColor }]}
        >
          <Text style={[styles.selectButtonText, { color: '#FFFFFF' }]}>
            Select color
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  content: {
    flex: 1,
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
  picker: {
    gap: 20,
  },
  preview: {
    height: 56,
    borderRadius: 20,
  },
  panel: {
    height: 200,
    borderRadius: 20,
  },
  hueSlider: {
    height: 36,
    borderRadius: 18,
  },
  hexLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginTop: 16,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  selectButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
