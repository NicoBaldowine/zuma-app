import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, Pressable, Modal, TextInput, FlatList, ActivityIndicator,
} from 'react-native';
import { X, MagnifyingGlass, Trash } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { BUCKET_ICON_LIST } from '@/utils/bucket-icons';
import { EMOJI_LIST } from '@/utils/emoji-list';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { fetchCustomIcons, deleteCustomIcon, type CustomIcon } from '@/lib/api/custom-icons';

type IconPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedIcon: string | null;
  selectedType: 'icon' | 'emoji' | 'pixel';
  onSelect: (icon: string, type: 'icon' | 'emoji' | 'pixel') => void;
  onCreateCustom?: () => void;
};

type Tab = 'icons' | 'emojis' | 'create';

export function IconPickerModal({ visible, onClose, selectedIcon, selectedType, onSelect, onCreateCustom }: IconPickerModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  const initialTab: Tab = selectedType === 'emoji' ? 'emojis' : selectedType === 'pixel' ? 'create' : 'icons';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState('');
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [iconsReady, setIconsReady] = useState(false);
  const [emojisReady, setEmojisReady] = useState(false);

  // Load custom icons when modal opens
  useEffect(() => {
    if (visible) {
      setLoadingCustom(true);
      fetchCustomIcons().then(setCustomIcons).catch(() => {}).finally(() => setLoadingCustom(false));
    }
  }, [visible]);

  // Defer rendering of heavy lists so tab switch feels instant
  useEffect(() => {
    if (tab === 'icons' && !iconsReady) {
      requestAnimationFrame(() => setIconsReady(true));
    }
    if (tab === 'emojis' && !emojisReady) {
      requestAnimationFrame(() => setEmojisReady(true));
    }
  }, [tab, iconsReady, emojisReady]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setIconsReady(initialTab === 'icons');
      setEmojisReady(initialTab === 'emojis');
    }
  }, [visible]);

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

  const handleCreateNew = useCallback(() => {
    if (onCreateCustom) {
      onCreateCustom();
    } else {
      onClose();
      setTimeout(() => router.push('/pixel-editor'), 300);
    }
  }, [onClose, onCreateCustom, router]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
        <View style={[styles.stickyClose, { marginTop: 4 }]}>
          <Pressable onPress={onClose} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
            <X size={18} color={secondaryColor} weight="bold" />
          </Pressable>
        </View>

        <Text style={[styles.modalTitle, { color: textColor }]}>Select icon</Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['icons', 'emojis', 'create'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); setSearch(''); }}
              style={[styles.tab, tab === t && { backgroundColor: textColor }]}
            >
              <Text style={[styles.tabText, { color: tab === t ? bgColor : secondaryColor }]}>
                {t === 'icons' ? 'Icons' : t === 'emojis' ? 'Emojis' : 'Create'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Icons tab */}
        {tab === 'icons' && (
          <>
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
            {!iconsReady ? (
              <ActivityIndicator color={secondaryColor} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                key="icons-6"
                data={filteredIcons}
                numColumns={6}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.iconGrid}
                columnWrapperStyle={filteredIcons.length > 0 ? styles.iconRow : undefined}
                maxToRenderPerBatch={12}
                initialNumToRender={24}
                removeClippedSubviews
                renderItem={({ item }) => {
                  const Icon = item.component;
                  const isSelected = selectedType === 'icon' && selectedIcon === item.name;
                  return (
                    <Pressable
                      onPress={() => onSelect(item.name, 'icon')}
                      style={[styles.iconOption, isSelected && { backgroundColor: surfaceColor }]}
                    >
                      <Icon size={26} color={isSelected ? textColor : secondaryColor} weight="fill" />
                    </Pressable>
                  );
                }}
              />
            )}
          </>
        )}

        {/* Emojis tab */}
        {tab === 'emojis' && (
          <>
            <View style={[styles.searchBar, { backgroundColor: surfaceColor }]}>
              <MagnifyingGlass size={18} color={secondaryColor} weight="bold" />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search emojis..."
                placeholderTextColor={secondaryColor}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {!emojisReady ? (
              <ActivityIndicator color={secondaryColor} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                key="emojis-6"
                data={filteredEmojis}
                numColumns={6}
                keyExtractor={(item) => item.emoji}
                contentContainerStyle={styles.iconGrid}
                columnWrapperStyle={styles.iconRow}
                maxToRenderPerBatch={12}
                initialNumToRender={24}
                removeClippedSubviews
                renderItem={({ item }) => {
                  const isSelected = selectedType === 'emoji' && selectedIcon === item.emoji;
                  return (
                    <Pressable
                      onPress={() => onSelect(item.emoji, 'emoji')}
                      style={[styles.iconOption, isSelected && { backgroundColor: surfaceColor }]}
                    >
                      <Text style={styles.emojiText}>{item.emoji}</Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </>
        )}

        {/* Create tab */}
        {tab === 'create' && (
          <View style={{ flex: 1 }}>
            {loadingCustom ? (
              <ActivityIndicator color={secondaryColor} style={{ marginTop: 40 }} />
            ) : customIcons.length > 0 ? (
              <View style={styles.customGrid}>
                {customIcons.map((ci) => {
                  const isSelected = selectedType === 'pixel' && selectedIcon === JSON.stringify(ci.pixelData);
                  return (
                    <Pressable
                      key={ci.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onSelect(JSON.stringify(ci.pixelData), 'pixel');
                      }}
                      onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        deleteCustomIcon(ci.id)
                          .then(() => setCustomIcons((prev) => prev.filter((c) => c.id !== ci.id)))
                          .catch(() => {});
                      }}
                      style={[styles.iconOption, isSelected && { backgroundColor: surfaceColor }]}
                    >
                      <PixelIcon data={ci.pixelData} size={26} color={isSelected ? textColor : secondaryColor} />
                    </Pressable>
                  );
                })}
                <Text style={[styles.hintText, { color: secondaryColor }]}>Long press to delete</Text>
              </View>
            ) : null}

            {/* Floating CTA */}
            <View style={[styles.createButtonContainer, { paddingBottom: insets.bottom + 8 }]}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleCreateNew(); }}
                style={[styles.createButton, { backgroundColor: textColor }]}
              >
                <Text style={[styles.createButtonText, { color: bgColor }]}>Create custom icon</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  modalTitle: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
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
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  // Create tab
  customGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  hintText: {
    width: '100%',
    fontSize: 12,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginTop: 8,
  },
  createButtonContainer: {
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
});
