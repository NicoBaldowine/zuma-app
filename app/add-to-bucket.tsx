import { useState, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, Pressable, TextInput, Modal,
  InputAccessoryView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, CaretRight, Check, ArrowDown } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency, formatAmountInput, parseAmountInput } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { SheetListItem } from '@/components/shared';
import { PixelIcon } from '@/components/shared/pixel-icon';
import type { Bucket } from '@/types';

const INPUT_ACCESSORY_ID = 'add-to-bucket-btn';

export default function AddToBucketScreen() {
  const router = useRouter();
  const { bucketId } = useLocalSearchParams<{ bucketId: string }>();
  const { buckets, moveFunds } = useBuckets();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [amount, setAmount] = useState('');
  const [fromPickerVisible, setFromPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const targetBucket = buckets.find((b) => b.id === bucketId) ?? buckets.find((b) => !b.isMain)!;
  const mainBucket = buckets.find((b) => b.isMain)!;

  const [fromBucketId, setFromBucketId] = useState(mainBucket?.id ?? '');
  const fromBucket = buckets.find((b) => b.id === fromBucketId) ?? mainBucket;

  const availableFromBuckets = buckets.filter(
    (b) => b.id !== targetBucket?.id
  );

  const fromPalette = getBucketPalette(fromBucket.colorKey);
  const targetPalette = getBucketPalette(targetBucket.colorKey);
  const FromIcon = fromBucket.iconType === 'icon' ? getBucketIcon(fromBucket.icon) : null;
  const TargetIcon = targetBucket.iconType === 'icon' ? getBucketIcon(targetBucket.icon) : null;

  const amountCents = Math.round(parseFloat(parseAmountInput(amount) || '0') * 100);
  const isValid = amountCents > 0 && amountCents <= fromBucket.currentAmount;

  const actionButton = (
    <View style={[styles.buttonContainer, { backgroundColor: bgColor }]}>
      <Pressable
        onPress={async () => {
          if (!isValid || saving || !targetBucket) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSaving(true);
          try {
            await moveFunds(fromBucketId, targetBucket.id, amountCents);
            router.back();
          } catch (err: any) {
            alert(err.message ?? 'Failed to add funds');
          } finally {
            setSaving(false);
          }
        }}
        style={[styles.actionButton, { backgroundColor: textColor, opacity: isValid && !saving ? 1 : 0.25 }]}
      >
        <Text style={[styles.actionButtonText, { color: bgColor }]}>
          {saving ? 'Adding...' : 'Add funds'}
        </Text>
      </Pressable>
    </View>
  );

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

      <View style={styles.pills}>
        <Pressable
          onPress={() => setFromPickerVisible(true)}
          style={[styles.bucketPill, { backgroundColor: surfaceColor }]}
        >
          <View style={[styles.pillIcon, { backgroundColor: fromBucket.isMain ? fromPalette.light : fromPalette.main }]}>
            {fromBucket.iconType === 'pixel' ? (
              <PixelIcon data={JSON.parse(fromBucket.icon)} size={14} color={fromPalette.cardText} />
            ) : fromBucket.iconType === 'emoji' ? (
              <Text style={{ fontSize: 14 }}>{fromBucket.icon}</Text>
            ) : (
              FromIcon && <FromIcon size={14} color={fromPalette.cardText} weight="fill" />
            )}
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillName, { color: textColor }]}>{fromBucket.name}</Text>
            <Text style={[styles.pillSub, { color: secondaryColor }]}>
              {formatCurrency(fromBucket.currentAmount)}
            </Text>
          </View>
          <CaretRight size={16} color={secondaryColor} weight="bold" />
        </Pressable>

        <View style={[styles.bucketPill, { backgroundColor: surfaceColor }]}>
          <View style={[styles.pillIcon, { backgroundColor: targetBucket.isMain ? targetPalette.light : targetPalette.main }]}>
            {targetBucket.iconType === 'pixel' ? (
              <PixelIcon data={JSON.parse(targetBucket.icon)} size={14} color={targetPalette.cardText} />
            ) : targetBucket.iconType === 'emoji' ? (
              <Text style={{ fontSize: 14 }}>{targetBucket.icon}</Text>
            ) : (
              TargetIcon && <TargetIcon size={14} color={targetPalette.cardText} weight="fill" />
            )}
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillName, { color: textColor }]}>{targetBucket.name}</Text>
            <Text style={[styles.pillSub, { color: secondaryColor }]}>
              {formatCurrency(targetBucket.currentAmount)} of {formatCurrency(targetBucket.targetAmount)}
            </Text>
          </View>
          <CaretRight size={16} color={`${secondaryColor}40`} weight="bold" />
        </View>

        {/* Arrow overlay — absolute, centered between pills */}
        <View style={styles.arrowOverlay}>
          <View style={[styles.arrowCircle, { backgroundColor: surfaceColor, borderColor: bgColor }]}>
            <ArrowDown size={16} color={secondaryColor} weight="bold" />
          </View>
        </View>
      </View>

      <Pressable style={styles.amountContainer} onPress={() => inputRef.current?.focus()}>
        <Text style={[styles.amountPrefix, { color: textColor }]}>$</Text>
        <TextInput
          ref={inputRef}
          style={[styles.amountInput, { color: textColor }]}
          value={amount}
          onChangeText={(v) => setAmount(formatAmountInput(v))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={secondaryColor}
          autoFocus
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
        />
      </Pressable>

      <View style={styles.maxRow}>
        <Pressable
          onPress={() => setAmount(formatAmountInput((fromBucket.currentAmount / 100).toString()))}
          style={[styles.maxButton, { backgroundColor: surfaceColor }]}
        >
          <Text style={[styles.maxText, { color: secondaryColor }]}>Max</Text>
        </Pressable>
      </View>

      {/* iOS: button sticks above keyboard natively */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          {actionButton}
        </InputAccessoryView>
      )}

      {/* Fallback for non-keyboard state or Android */}
      {Platform.OS !== 'ios' && (
        <View style={[styles.fallbackBottom, { paddingBottom: insets.bottom + 8 }]}>
          {actionButton}
        </View>
      )}

      {/* From bucket picker */}
      <FromPickerModal
        visible={fromPickerVisible}
        onClose={() => setFromPickerVisible(false)}
        buckets={availableFromBuckets}
        selectedId={fromBucketId}
        onSelect={(id) => { setFromBucketId(id); setFromPickerVisible(false); }}
      />
    </View>
  );
}

function FromPickerModal({ visible, onClose, buckets, selectedId, onSelect }: {
  visible: boolean;
  onClose: () => void;
  buckets: Bucket[];
  selectedId: string;
  onSelect: (id: string) => void;
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
        <Text style={[styles.modalTitle, { color: textColor }]}>Select source</Text>
        <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
          {buckets.map((bucket) => {
            const Icon = bucket.iconType === 'icon' ? getBucketIcon(bucket.icon) : null;
            const palette = getBucketPalette(bucket.colorKey);
            const isSelected = bucket.id === selectedId;
            return (
              <Pressable
                key={bucket.id}
                onPress={() => onSelect(bucket.id)}
                style={({ pressed }) => [styles.sourceItem, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.sourceIcon, { backgroundColor: bucket.isMain ? palette.light : palette.main }]}>
                  {bucket.iconType === 'pixel' ? (
                    <PixelIcon data={JSON.parse(bucket.icon)} size={18} color={palette.cardText} />
                  ) : bucket.iconType === 'emoji' ? (
                    <Text style={{ fontSize: 18 }}>{bucket.icon}</Text>
                  ) : (
                    Icon && <Icon size={18} color={palette.cardText} weight="fill" />
                  )}
                </View>
                <View style={styles.sourceInfo}>
                  <Text style={[styles.sourceName, { color: textColor }]}>{bucket.name}</Text>
                  <Text style={[styles.sourceBalance, { color: secondaryColor }]}>
                    {formatCurrency(bucket.currentAmount)}
                  </Text>
                </View>
                {isSelected && <Check size={20} color={textColor} weight="bold" />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  pills: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  bucketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 64,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInfo: {
    flex: 1,
  },
  arrowOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: 16,
    zIndex: 10,
    pointerEvents: 'none',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  pillName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  pillSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  maxRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  maxButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  maxText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  amountPrefix: {
    fontSize: 56,
    fontFamily: Fonts.medium,
    letterSpacing: 56 * -0.05,
  },
  amountInput: {
    fontSize: 56,
    fontFamily: Fonts.medium,
    letterSpacing: 56 * -0.05,
    minWidth: 40,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  fallbackBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalRoot: { flex: 1 },
  modalTitle: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalListContent: {
    paddingBottom: 40,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceInfo: {
    flex: 1,
    gap: 2,
  },
  sourceName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  sourceBalance: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
});
