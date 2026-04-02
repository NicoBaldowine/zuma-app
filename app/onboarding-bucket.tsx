import { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, MagnifyingGlass, Check, CaretDown } from 'phosphor-react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, Easing } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { BucketColors } from '@/constants/bucket-colors';
import { getBucketIcon, BUCKET_ICON_LIST } from '@/utils/bucket-icons';
import { EMOJI_LIST, getEmojiName } from '@/utils/emoji-list';
import { getCustomColor, clearCustomColor, onCustomColorChange } from '@/utils/custom-color-store';
import { formatAmountInput, parseAmountInput } from '@/utils/format';
import { setPendingBucket } from '@/utils/onboarding-store';
import type { BucketColorKey } from '@/types';

const COLOR_KEYS: BucketColorKey[] = [
  'coral', 'ember', 'orange', 'peach', 'gold',
  'lemon', 'lime', 'sage', 'mint', 'teal',
  'sky', 'ocean', 'indigo', 'lavender', 'lilac',
  'berry', 'rose', 'blush', 'mauve', 'slate',
];

const PLACEHOLDER_EXAMPLES = [
  'Trip to Japan',
  'Nintendo Switch 2',
  'New tattoo fund',
  'Concert tickets',
  'Sneaker drop',
  'Festival fund',
  'Birthday party',
  'New MacBook',
  'Coachella 2026',
  'Road trip fund',
  'Skincare haul',
  'PS5 games',
  'Dream apartment',
  'Netflix & chill fund',
  'Starbucks runs',
];

export default function OnboardingBucketScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconType, setIconType] = useState<'icon' | 'emoji'>('icon');
  const [selectedColor, setSelectedColor] = useState<BucketColorKey | null>(null);
  const [customHex, setCustomHex] = useState<string | null>(null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

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

  const isValid = name.trim().length > 0 && amount.trim().length > 0 && selectedIcon && selectedColor;
  const SelectedIconComponent = selectedIcon ? getBucketIcon(selectedIcon) : null;
  const selectedPalette = selectedColor ? BucketColors[selectedColor] : null;
  const displayColor = selectedColor === 'custom' && customHex ? customHex : selectedPalette?.main;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}>
          <Text style={[styles.title, { color: textColor }]}>
            Create your{'\n'}first bucket
          </Text>
          <Text style={[styles.subtitle, { color: secondaryColor }]}>
            A bucket is a visual savings goal. Give it a name, target, and style.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(150).easing(Easing.out(Easing.cubic))}
          style={styles.fields}
        >
          <View style={[styles.field, { backgroundColor: surfaceColor }]}>
            {name.length > 0 && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Bucket name</Text>
            )}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.fieldInput, { color: textColor }]}
                placeholder=""
                value={name}
                onChangeText={setName}
                autoFocus
              />
              {name.length === 0 && (
                <View style={styles.placeholderOverlay} pointerEvents="none">
                  <Text style={[styles.fieldPlaceholderStatic, { color: secondaryColor }]}>
                    Bucket name
                  </Text>
                  <Animated.Text
                    key={placeholderIndex}
                    entering={FadeInUp.duration(300)}
                    exiting={FadeOutDown.duration(300)}
                    style={[styles.fieldPlaceholderExample, { color: `${secondaryColor}60` }]}
                  >
                    e.g. {PLACEHOLDER_EXAMPLES[placeholderIndex]}
                  </Animated.Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.field, { backgroundColor: surfaceColor }]}>
            {amount.length > 0 && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Target amount</Text>
            )}
            <TextInput
              style={[styles.fieldInput, { color: textColor }]}
              placeholder="Target amount"
              placeholderTextColor={secondaryColor}
              value={amount}
              onChangeText={(v) => setAmount(formatAmountInput(v))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.pickersRow}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIconPickerVisible(true); }}
              style={[styles.input, styles.pickerButton, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.pickerInner}>
                {selectedIcon ? (
                  <View style={styles.pickerSelected}>
                    <View style={[styles.pickerIconCircle, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                      {iconType === 'emoji' ? (
                        <Text style={{ fontSize: 18 }}>{selectedIcon}</Text>
                      ) : (
                        SelectedIconComponent && <SelectedIconComponent size={18} color={textColor} weight="fill" />
                      )}
                    </View>
                    <Text style={[styles.pickerLabel, { color: textColor }]} numberOfLines={1}>
                      {iconType === 'emoji' ? getEmojiName(selectedIcon!) : selectedIcon}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.pickerPlaceholder, { color: secondaryColor }]}>Select icon</Text>
                )}
                <CaretDown size={14} color={secondaryColor} weight="bold" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setColorPickerVisible(true); }}
              style={[styles.input, styles.pickerButton, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.pickerInner}>
                {selectedColor ? (
                  <View style={styles.pickerSelected}>
                    <View style={[styles.colorDot, { backgroundColor: displayColor }]} />
                    <Text style={[styles.pickerLabel, { color: textColor }]}>
                      {selectedColor === 'custom' ? 'Custom' : selectedColor}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.pickerPlaceholder, { color: secondaryColor }]}>Select color</Text>
                )}
                <CaretDown size={14} color={secondaryColor} weight="bold" />
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={() => {
            if (!isValid) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Store bucket data for creation after auth
            setPendingBucket({
              name: name.trim(),
              icon: selectedIcon!,
              iconType,
              colorKey: selectedColor!,
              customColor: selectedColor === 'custom' ? customHex ?? undefined : undefined,
              targetAmount: Math.round(parseFloat(parseAmountInput(amount)) * 100),
            });
            router.push('/onboarding-bank');
          }}
          style={[styles.continueButton, { backgroundColor: isValid ? textColor : surfaceColor }]}
        >
          <Text style={[styles.continueButtonText, { color: isValid ? bgColor : secondaryColor }]}>
            Continue
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
    </KeyboardAvoidingView>
  );
}

function IconPickerModal({ visible, onClose, selectedIcon, selectedType, onSelect }: {
  visible: boolean; onClose: () => void; selectedIcon: string | null; selectedType: 'icon' | 'emoji'; onSelect: (icon: string, type: 'icon' | 'emoji') => void;
}) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const [tab, setTab] = useState<'icons' | 'emojis'>(selectedType === 'emoji' ? 'emojis' : 'icons');
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim() || tab !== 'icons') return BUCKET_ICON_LIST;
    const q = search.toLowerCase();
    return BUCKET_ICON_LIST.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, tab]);

  const filteredEmojis = useMemo(() => {
    if (!search.trim() || tab !== 'emojis') return EMOJI_LIST;
    const q = search.toLowerCase();
    return EMOJI_LIST.filter((e) => e.tags.includes(q));
  }, [search, tab]);

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

        <Text style={[styles.modalTitle, { color: textColor }]}>Select icon</Text>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => { setTab('icons'); setSearch(''); }}
            style={[styles.tab, tab === 'icons' && { backgroundColor: textColor }]}
          >
            <Text style={[styles.tabText, { color: tab === 'icons' ? bgColor : secondaryColor }]}>Icons</Text>
          </Pressable>
          <Pressable
            onPress={() => { setTab('emojis'); setSearch(''); }}
            style={[styles.tab, tab === 'emojis' && { backgroundColor: textColor }]}
          >
            <Text style={[styles.tabText, { color: tab === 'emojis' ? bgColor : secondaryColor }]}>Emojis</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: surfaceColor }]}>
          <MagnifyingGlass size={18} color={secondaryColor} weight="bold" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={tab === 'icons' ? 'Search icons...' : 'Search emojis...'}
            placeholderTextColor={secondaryColor}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {tab === 'icons' ? (
          <FlatList
            key="icons-6"
            data={filteredIcons}
            numColumns={6}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.iconGrid}
            columnWrapperStyle={styles.iconRow}
            renderItem={({ item }) => {
              const Icon = item.component;
              const isSelected = selectedType === 'icon' && selectedIcon === item.name;
              return (
                <Pressable
                  onPress={() => onSelect(item.name, 'icon')}
                  style={[styles.emojiOption, isSelected && { backgroundColor: surfaceColor }]}
                >
                  <Icon size={26} color={isSelected ? textColor : secondaryColor} weight="fill" />
                </Pressable>
              );
            }}
          />
        ) : (
          <FlatList
            key="emojis-6"
            data={filteredEmojis}
            numColumns={6}
            keyExtractor={(item) => item.emoji}
            contentContainerStyle={styles.iconGrid}
            columnWrapperStyle={styles.iconRow}
            renderItem={({ item }) => {
              const isSelected = selectedType === 'emoji' && selectedIcon === item.emoji;
              return (
                <Pressable
                  onPress={() => onSelect(item.emoji, 'emoji')}
                  style={[styles.emojiOption, isSelected && { backgroundColor: surfaceColor }]}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
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

          {/* Custom color */}
          <Pressable
            onPress={onCustomPress}
            style={styles.colorItem}
          >
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    marginBottom: 32,
  },
  fields: {
    gap: 12,
  },
  field: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    letterSpacing: 0,
    padding: 0,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldPlaceholderStatic: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  fieldPlaceholderExample: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: Fonts.medium,
    justifyContent: 'center',
  },
  pickersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
  },
  pickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    textTransform: 'capitalize',
  },
  pickerPlaceholder: {
    fontSize: 16,
    fontFamily: Fonts.medium,
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
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  // Modal shared styles
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
});
