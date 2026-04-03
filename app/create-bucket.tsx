import { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'phosphor-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { BucketColors } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { getEmojiName } from '@/utils/emoji-list';
import { IconPickerModal } from '@/components/shared/icon-picker-modal';
import { FormField, FormSelect } from '@/components/shared';
import { getCustomColor, clearCustomColor, onCustomColorChange } from '@/utils/custom-color-store';
import { getPixelIcon, clearPixelIcon, onPixelIconChange } from '@/utils/pixel-icon-store';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { formatAmountInput, parseAmountInput } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import type { BucketColorKey } from '@/types';

const PLACEHOLDER_EXAMPLES = [
  'Trip to Japan', 'Nintendo Switch 2', 'New tattoo fund', 'Concert tickets',
  'Sneaker drop', 'Festival fund', 'Birthday party', 'New MacBook',
  'Coachella 2026', 'Road trip fund', 'Skincare haul', 'PS5 games',
  'Dream apartment', 'Netflix & chill fund', 'Starbucks runs',
];

const COLOR_KEYS: BucketColorKey[] = [
  'coral', 'ember', 'orange', 'peach', 'gold',
  'lemon', 'lime', 'sage', 'mint', 'teal',
  'sky', 'ocean', 'indigo', 'lavender', 'lilac',
  'berry', 'rose', 'blush', 'mauve', 'slate',
  'clay', 'denim', 'olive', 'wine', 'sand',
];

export default function CreateBucketScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconType, setIconType] = useState<'icon' | 'emoji' | 'pixel'>('icon');
  const [selectedColor, setSelectedColor] = useState<BucketColorKey | null>(null);
  const [customHex, setCustomHex] = useState<string | null>(null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const { createBucket } = useBuckets();

  // Cycle through placeholder examples
  const [placeholderIndex, setPlaceholderIndex] = useState(
    () => Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)
  );

  useEffect(() => {
    if (name.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 1700);
    return () => clearInterval(interval);
  }, [name]);

  // Listen for custom color selection
  useEffect(() => {
    return onCustomColorChange(() => {
      const hex = getCustomColor();
      if (hex) {
        setCustomHex(hex);
        setSelectedColor('custom');
        clearCustomColor();
      }
    });
  }, []);

  // Listen for pixel icon creation
  useEffect(() => {
    return onPixelIconChange(() => {
      const data = getPixelIcon();
      if (data) {
        setSelectedIcon(JSON.stringify(data));
        setIconType('pixel');
        setIconPickerVisible(false);
        clearPixelIcon();
      }
    });
  }, []);

  const isValid = name.trim().length > 0 && amount.trim().length > 0 && selectedIcon && selectedColor;
  const SelectedIconComponent = selectedIcon ? getBucketIcon(selectedIcon) : null;
  const selectedPalette = selectedColor ? BucketColors[selectedColor] : null;
  const displayColor = selectedColor === 'custom' && customHex ? customHex : selectedPalette?.main;

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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: textColor }]}>
          Create bucket
        </Text>

        <View style={styles.fields}>
          <FormField
            label="Bucket name"
            value={name}
            onChangeText={setName}
            autoFocus
            customPlaceholder={
              <>
                <Text style={[styles.placeholderStatic, { color: secondaryColor }]}>
                  Bucket name
                </Text>
                <Animated.Text
                  key={placeholderIndex}
                  entering={FadeInUp.duration(300)}
                  exiting={FadeOutDown.duration(300)}
                  style={[styles.placeholderExample, { color: `${secondaryColor}60` }]}
                >
                  e.g. {PLACEHOLDER_EXAMPLES[placeholderIndex]}
                </Animated.Text>
              </>
            }
          />
          <FormField
            label="Target amount"
            value={amount}
            onChangeText={(v) => setAmount(formatAmountInput(v))}
            keyboardType="numeric"
          />

          <View style={styles.pickersRow}>
            <FormSelect
              label="Select icon"
              value={selectedIcon ? (iconType === 'pixel' ? 'Custom' : iconType === 'emoji' ? getEmojiName(selectedIcon) : selectedIcon) : null}
              onPress={() => setIconPickerVisible(true)}
              style={{ flex: 1 }}
              selectedIcon={
                selectedIcon ? (
                  <View style={[styles.pickerIconCircle, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                    {iconType === 'pixel' ? (
                      <PixelIcon data={JSON.parse(selectedIcon)} size={18} color={textColor} />
                    ) : iconType === 'emoji' ? (
                      <Text style={{ fontSize: 18 }}>{selectedIcon}</Text>
                    ) : (
                      SelectedIconComponent && <SelectedIconComponent size={18} color={textColor} weight="fill" />
                    )}
                  </View>
                ) : undefined
              }
            />

            <FormSelect
              label="Select color"
              value={selectedColor ? (selectedColor === 'custom' ? 'Custom' : selectedColor) : null}
              onPress={() => setColorPickerVisible(true)}
              style={{ flex: 1 }}
              selectedIcon={
                selectedColor ? (
                  <View style={[styles.colorDot, { backgroundColor: displayColor }]} />
                ) : undefined
              }
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={async () => {
            if (!isValid || saving) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSaving(true);
            try {
              await createBucket({
                name: name.trim(),
                icon: selectedIcon!,
                iconType,
                colorKey: selectedColor!,
                customColor: selectedColor === 'custom' ? customHex ?? undefined : undefined,
                targetAmount: Math.round(parseFloat(parseAmountInput(amount)) * 100),
              });
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to create bucket');
            } finally {
              setSaving(false);
            }
          }}
          style={[styles.createButton, { backgroundColor: textColor, opacity: isValid && !saving ? 1 : 0.25 }]}
        >
          <Text style={[styles.createButtonText, { color: bgColor }]}>
            {saving ? 'Creating...' : 'Create bucket'}
          </Text>
        </Pressable>
      </View>

      <IconPickerModal
        visible={iconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        selectedIcon={selectedIcon}
        selectedType={iconType}
        onSelect={(icon, type) => { Haptics.selectionAsync(); setSelectedIcon(icon); setIconType(type); setIconPickerVisible(false); }}
      />
      <ColorPickerModal
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        selectedColor={selectedColor}
        onSelect={(color) => { Haptics.selectionAsync(); setSelectedColor(color); setColorPickerVisible(false); }}
        onCustomPress={() => {
          setColorPickerVisible(false);
          setTimeout(() => router.push('/custom-color'), 350);
        }}
      />
    </View>
  );
}

function ColorPickerModal({ visible, onClose, selectedColor, onSelect, onCustomPress }: {
  visible: boolean; onClose: () => void; selectedColor: BucketColorKey | null; onSelect: (color: BucketColorKey) => void; onCustomPress: () => void;
}) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable
            onPress={onClose}
            style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
          >
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>

        <Text style={[styles.modalTitle, { color: textColor }]}>Select color</Text>

        <View style={styles.colorGrid}>
          {COLOR_KEYS.map((key) => {
            const palette = BucketColors[key];
            const isSelected = selectedColor === key;
            return (
              <Pressable key={key} onPress={() => onSelect(key)} style={styles.colorItem}>
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: palette.main },
                    isSelected && { borderColor: textColor, borderWidth: 2.5 },
                  ]}
                >
                  {isSelected && <Check size={16} color={palette.cardText} weight="bold" />}
                </View>
                <Text style={[styles.colorName, { color: isSelected ? textColor : secondaryColor }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            );
          })}

          <Pressable onPress={onCustomPress} style={styles.colorItem}>
            <View style={[styles.colorCircle, styles.customCircle, { borderColor: secondaryColor }]}>
              <Text style={[styles.customPlus, { color: secondaryColor }]}>+</Text>
            </View>
            <Text style={[styles.colorName, { color: secondaryColor }]}>Custom</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  fields: {
    gap: 12,
  },
  placeholderStatic: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  placeholderExample: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  pickersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  createButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  // Modal shared styles
  modalRoot: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.medium,
    height: '100%',
  },
  iconGrid: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconRow: {
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  colorItem: {
    alignItems: 'center',
    gap: 6,
    width: '20%',
    marginBottom: 14,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  colorName: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  customCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  customPlus: {
    fontSize: 20,
    fontFamily: Fonts.medium,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
});
