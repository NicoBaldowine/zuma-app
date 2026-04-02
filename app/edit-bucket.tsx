import { useState, useMemo, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, MagnifyingGlass, Check, CaretDown } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { BucketColors } from '@/constants/bucket-colors';
import { getBucketIcon, BUCKET_ICON_LIST } from '@/utils/bucket-icons';
import { EMOJI_LIST, getEmojiName } from '@/utils/emoji-list';
import { useBuckets } from '@/contexts/buckets-context';
import { formatAmountInput, parseAmountInput } from '@/utils/format';
import { getCustomColor, clearCustomColor, onCustomColorChange } from '@/utils/custom-color-store';
import type { BucketColorKey } from '@/types';

const COLOR_KEYS: BucketColorKey[] = [
  'coral', 'ember', 'orange', 'peach', 'gold',
  'lemon', 'lime', 'sage', 'mint', 'teal',
  'sky', 'ocean', 'indigo', 'lavender', 'lilac',
  'berry', 'rose', 'blush', 'mauve', 'slate',
];

export default function EditBucketScreen() {
  const router = useRouter();
  const { bucketId, completed } = useLocalSearchParams<{ bucketId: string; completed?: string }>();
  const isCompleted = completed === '1';
  const { buckets, updateBucket } = useBuckets();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const bucket = buckets.find((b) => b.id === bucketId);

  const [name, setName] = useState(bucket?.name ?? '');
  const [amount, setAmount] = useState(bucket ? formatAmountInput(String(bucket.targetAmount / 100)) : '');
  const [selectedIcon, setSelectedIcon] = useState<string>(bucket?.icon ?? 'Wallet');
  const [iconType, setIconType] = useState<'icon' | 'emoji'>(bucket?.iconType ?? 'icon');
  const [selectedColor, setSelectedColor] = useState<BucketColorKey>(bucket?.colorKey ?? 'lime');
  const [customHex, setCustomHex] = useState<string | null>(bucket?.customColor ?? null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const isValid = name.trim().length > 0 && amount.trim().length > 0;
  const SelectedIconComponent = getBucketIcon(selectedIcon);
  const selectedPalette = BucketColors[selectedColor];
  const displayColor = selectedColor === 'custom' && customHex ? customHex : selectedPalette?.main;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        <Text style={[styles.title, { color: textColor }]}>Edit bucket</Text>

        <View style={styles.fields}>
          <View style={[styles.field, { backgroundColor: surfaceColor }, isCompleted && { opacity: 0.4 }]}>
            {name.length > 0 && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Bucket name</Text>
            )}
            <TextInput
              style={[styles.fieldInput, { color: textColor }]}
              placeholder="Bucket name"
              placeholderTextColor={secondaryColor}
              value={name}
              onChangeText={setName}
              editable={!isCompleted}
            />
          </View>
          <View style={[styles.field, { backgroundColor: surfaceColor }, isCompleted && { opacity: 0.4 }]}>
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
              editable={!isCompleted}
            />
          </View>

          <View style={styles.pickersRow}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIconPickerVisible(true); }}
              style={[styles.input, styles.pickerButton, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.pickerInner}>
                <View style={styles.pickerSelected}>
                  <View style={[styles.pickerIconCircle, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                    {iconType === 'emoji' ? (
                      <Text style={{ fontSize: 18 }}>{selectedIcon}</Text>
                    ) : (
                      <SelectedIconComponent size={18} color={textColor} weight="fill" />
                    )}
                  </View>
                  <Text style={[styles.pickerLabel, { color: textColor }]} numberOfLines={1}>
                    {iconType === 'emoji' ? getEmojiName(selectedIcon) : selectedIcon}
                  </Text>
                </View>
                <CaretDown size={14} color={secondaryColor} weight="bold" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setColorPickerVisible(true); }}
              style={[styles.input, styles.pickerButton, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.pickerInner}>
                <View style={styles.pickerSelected}>
                  <View style={[styles.colorDot, { backgroundColor: selectedPalette.main }]} />
                  <Text style={[styles.pickerLabel, { color: textColor }]}>{selectedColor}</Text>
                </View>
                <CaretDown size={14} color={secondaryColor} weight="bold" />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={async () => {
            if (!isValid || saving || !bucketId) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSaving(true);
            try {
              await updateBucket(bucketId, {
                name: name.trim(),
                icon: selectedIcon,
                iconType,
                colorKey: selectedColor,
                customColor: selectedColor === 'custom' ? customHex : null,
                targetAmount: Math.round(parseFloat(parseAmountInput(amount)) * 100),
              });
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to save bucket');
            } finally {
              setSaving(false);
            }
          }}
          style={[styles.saveButton, { backgroundColor: isValid && !saving ? textColor : surfaceColor }]}
        >
          <Text style={[styles.saveButtonText, { color: isValid && !saving ? bgColor : secondaryColor }]}>
            {saving ? 'Saving...' : 'Save bucket'}
          </Text>
        </Pressable>
      </View>

      <IconPickerModal
        visible={iconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        selectedIcon={selectedIcon}
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

function IconPickerModal({ visible, onClose, selectedIcon, onSelect }: {
  visible: boolean; onClose: () => void; selectedIcon: string; onSelect: (icon: string, type: 'icon' | 'emoji') => void;
}) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const [tab, setTab] = useState<'icons' | 'emojis'>('icons');
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
          <Pressable onPress={onClose} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>
        <Text style={[styles.modalTitle, { color: textColor }]}>Select icon</Text>

        <View style={styles.tabRow}>
          <Pressable onPress={() => { setTab('icons'); setSearch(''); }} style={[styles.tab, tab === 'icons' && { backgroundColor: textColor }]}>
            <Text style={[styles.tabText, { color: tab === 'icons' ? bgColor : secondaryColor }]}>Icons</Text>
          </Pressable>
          <Pressable onPress={() => { setTab('emojis'); setSearch(''); }} style={[styles.tab, tab === 'emojis' && { backgroundColor: textColor }]}>
            <Text style={[styles.tabText, { color: tab === 'emojis' ? bgColor : secondaryColor }]}>Emojis</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: surfaceColor }]}>
          <MagnifyingGlass size={18} color={secondaryColor} weight="bold" />
          <TextInput style={[styles.searchInput, { color: textColor }]} placeholder={tab === 'icons' ? 'Search icons...' : 'Search emojis...'} placeholderTextColor={secondaryColor} value={search} onChangeText={setSearch} />
        </View>

        {tab === 'icons' ? (
          <FlatList key="icons-6" data={filteredIcons} numColumns={6} keyExtractor={(item) => item.name} contentContainerStyle={styles.iconGrid} columnWrapperStyle={styles.iconRow}
            renderItem={({ item }) => {
              const Icon = item.component;
              const isSelected = selectedIcon === item.name;
              return (
                <Pressable onPress={() => onSelect(item.name, 'icon')} style={[styles.emojiOption, isSelected && { backgroundColor: surfaceColor }]}>
                  <Icon size={26} color={isSelected ? textColor : secondaryColor} weight="fill" />
                </Pressable>
              );
            }}
          />
        ) : (
          <FlatList key="emojis-6" data={filteredEmojis} numColumns={6} keyExtractor={(item) => item.emoji} contentContainerStyle={styles.iconGrid} columnWrapperStyle={styles.iconRow}
            renderItem={({ item }) => {
              const isSelected = selectedIcon === item.emoji;
              return (
                <Pressable onPress={() => onSelect(item.emoji, 'emoji')} style={[styles.emojiOption, isSelected && { backgroundColor: surfaceColor }]}>
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
  visible: boolean; onClose: () => void; selectedColor: BucketColorKey; onSelect: (color: BucketColorKey) => void; onCustomPress: () => void;
}) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={onClose} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
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
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  fields: { gap: 12 },
  field: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10, minHeight: 56, justifyContent: 'center' },
  fieldLabel: { fontSize: 12, fontFamily: Fonts.regular, marginBottom: 2 },
  fieldInput: { fontSize: 16, fontFamily: Fonts.medium, letterSpacing: 0, padding: 0 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, fontFamily: Fonts.medium, justifyContent: 'center' },
  pickersRow: { flexDirection: 'row', gap: 12 },
  pickerButton: { flex: 1 },
  pickerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerSelected: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickerIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pickerLabel: { fontSize: 14, fontFamily: Fonts.medium, textTransform: 'capitalize' },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  bottomButton: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12 },
  saveButton: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 16, fontFamily: Fonts.bold },
  modalRoot: { flex: 1 },
  modalTitle: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, paddingHorizontal: 20, marginBottom: 20, marginTop: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 16, height: 44, borderRadius: 14, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: Fonts.medium, height: '100%' },
  iconGrid: { paddingHorizontal: 20, paddingBottom: 40 },
  iconRow: { marginBottom: 8, justifyContent: 'space-between' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'flex-start' },
  colorItem: { alignItems: 'center', gap: 6, width: '20%' as any, marginBottom: 14 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'transparent' },
  colorName: { fontSize: 11, fontFamily: Fonts.medium },
  customCircle: { backgroundColor: 'transparent', borderWidth: 2, borderStyle: 'dashed' as any },
  customPlus: { fontSize: 20, fontFamily: Fonts.medium },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 14, fontFamily: Fonts.semiBold },
  emojiOption: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 26 },
});
