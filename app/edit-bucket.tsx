import { useState } from 'react';
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
import { X, MagnifyingGlass, Check, CaretDown } from 'phosphor-react-native';
import { useMemo } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { BucketColors } from '@/constants/bucket-colors';
import { getBucketIcon, BUCKET_ICON_LIST } from '@/utils/bucket-icons';
import type { BucketColorKey } from '@/types';

const COLOR_KEYS: BucketColorKey[] = [
  'lime', 'gold', 'orange', 'coral', 'rose', 'lavender', 'sky', 'mint',
];

export default function EditBucketScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  // TODO: load actual bucket data
  const [name, setName] = useState('Gibson Electric guitar');
  const [amount, setAmount] = useState('10000');
  const [selectedIcon, setSelectedIcon] = useState<string>('Guitar');
  const [selectedColor, setSelectedColor] = useState<BucketColorKey>('lime');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const isValid = name.trim().length > 0 && amount.trim().length > 0;
  const SelectedIconComponent = getBucketIcon(selectedIcon);
  const selectedPalette = BucketColors[selectedColor];

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
          <TextInput
            style={[styles.input, { backgroundColor: surfaceColor, color: textColor }]}
            placeholder="Bucket name"
            placeholderTextColor={secondaryColor}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: surfaceColor, color: textColor }]}
            placeholder="Target amount"
            placeholderTextColor={secondaryColor}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <View style={styles.pickersRow}>
            <Pressable
              onPress={() => setIconPickerVisible(true)}
              style={[styles.input, styles.pickerButton, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.pickerInner}>
                <View style={styles.pickerSelected}>
                  <View style={[styles.pickerIconCircle, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                    <SelectedIconComponent size={18} color={textColor} weight="fill" />
                  </View>
                  <Text style={[styles.pickerLabel, { color: textColor }]}>{selectedIcon}</Text>
                </View>
                <CaretDown size={14} color={secondaryColor} weight="bold" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => setColorPickerVisible(true)}
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
          onPress={() => { if (isValid) router.back(); }}
          style={[styles.saveButton, { backgroundColor: isValid ? textColor : surfaceColor }]}
        >
          <Text style={[styles.saveButtonText, { color: isValid ? bgColor : secondaryColor }]}>
            Save bucket
          </Text>
        </Pressable>
      </View>

      <IconPickerModal
        visible={iconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        selectedIcon={selectedIcon}
        onSelect={(icon) => { setSelectedIcon(icon); setIconPickerVisible(false); }}
      />
      <ColorPickerModal
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        selectedColor={selectedColor}
        onSelect={(color) => { setSelectedColor(color); setColorPickerVisible(false); }}
      />
    </KeyboardAvoidingView>
  );
}

function IconPickerModal({ visible, onClose, selectedIcon, onSelect }: {
  visible: boolean; onClose: () => void; selectedIcon: string; onSelect: (icon: string) => void;
}) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return BUCKET_ICON_LIST;
    const q = search.toLowerCase();
    return BUCKET_ICON_LIST.filter((i) => i.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={onClose} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>
        <Text style={[styles.modalTitle, { color: textColor }]}>Select icon</Text>
        <View style={[styles.searchBar, { backgroundColor: surfaceColor }]}>
          <MagnifyingGlass size={18} color={secondaryColor} weight="bold" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search icons..."
            placeholderTextColor={secondaryColor}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filtered}
          numColumns={5}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.iconGrid}
          columnWrapperStyle={styles.iconRow}
          renderItem={({ item }) => {
            const Icon = item.component;
            const isSelected = selectedIcon === item.name;
            return (
              <Pressable
                onPress={() => onSelect(item.name)}
                style={[styles.iconOption, { backgroundColor: isSelected ? textColor : surfaceColor }]}
              >
                <Icon size={22} color={isSelected ? bgColor : secondaryColor} weight="fill" />
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

function ColorPickerModal({ visible, onClose, selectedColor, onSelect }: {
  visible: boolean; onClose: () => void; selectedColor: BucketColorKey; onSelect: (color: BucketColorKey) => void;
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
                    isSelected && { borderColor: textColor, borderWidth: 3 },
                  ]}
                >
                  {isSelected && <Check size={20} color={palette.cardText} weight="bold" />}
                </View>
                <Text style={[styles.colorName, { color: textColor }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  fields: { gap: 12 },
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
  iconGrid: { paddingHorizontal: 16, paddingBottom: 40 },
  iconRow: { gap: 10, marginBottom: 10, justifyContent: 'flex-start' },
  iconOption: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 16 },
  colorItem: { alignItems: 'center', gap: 8, width: 72 },
  colorCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorName: { fontSize: 12, fontFamily: Fonts.medium },
});
