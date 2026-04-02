import { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, Pressable, TextInput, Modal,
  InputAccessoryView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, CaretRight, Check, ArrowDown } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency, formatAmountInput, parseAmountInput } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { hasLinkedAccount } from '@/lib/api/plaid';
import type { Bucket } from '@/types';

const INPUT_ACCESSORY_ID = 'move-funds-btn';

export default function MoveFundsScreen() {
  const router = useRouter();

  // Redirect to bank connection if no account linked
  useState(() => {
    hasLinkedAccount().then((linked) => {
      if (!linked) router.replace('/linked-account');
    }).catch(() => {});
  });
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { buckets, moveFunds } = useBuckets();

  const mainBucket = buckets.find((b) => b.isMain)!;
  const firstOther = buckets.find((b) => !b.isMain)!;

  const [amount, setAmount] = useState('');
  const [fromBucketId, setFromBucketId] = useState(mainBucket?.id ?? '');
  const [toBucketId, setToBucketId] = useState(firstOther?.id ?? '');
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);
  const [saving, setSaving] = useState(false);

  const fromBucket = buckets.find((b) => b.id === fromBucketId) ?? mainBucket;
  const toBucket = buckets.find((b) => b.id === toBucketId) ?? firstOther;

  const fromPalette = getBucketPalette(fromBucket.colorKey);
  const toPalette = getBucketPalette(toBucket.colorKey);
  const FromIcon = getBucketIcon(fromBucket.icon);
  const ToIcon = getBucketIcon(toBucket.icon);

  const availableBuckets = buckets.filter((b) => {
    if (pickerTarget === 'from') return b.id !== toBucketId && b.currentAmount > 0;
    if (pickerTarget === 'to') return b.id !== fromBucketId;
    return false;
  });

  const amountCents = Math.round(parseFloat(parseAmountInput(amount) || '0') * 100);
  const isValid = amountCents > 0 && amountCents <= (fromBucket?.currentAmount ?? 0) && fromBucketId !== toBucketId;

  const actionButton = (
    <View style={[styles.buttonContainer, { backgroundColor: bgColor }]}>
      <Pressable
        onPress={async () => {
          if (!isValid || saving) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSaving(true);
          try {
            await moveFunds(fromBucketId, toBucketId, amountCents);
            router.back();
          } catch (err: any) {
            alert(err.message ?? 'Failed to move funds');
          } finally {
            setSaving(false);
          }
        }}
        style={[styles.actionButton, { backgroundColor: isValid && !saving ? textColor : surfaceColor }]}
      >
        <Text style={[styles.actionButtonText, { color: isValid && !saving ? bgColor : secondaryColor }]}>
          {saving ? 'Moving...' : 'Move funds'}
        </Text>
      </Pressable>
    </View>
  );

  const formatSub = (bucket: Bucket) => {
    if (bucket.isMain) return formatCurrency(bucket.currentAmount);
    return `${formatCurrency(bucket.currentAmount)} of ${formatCurrency(bucket.targetAmount)}`;
  };

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
          onPress={() => setPickerTarget('from')}
          style={[styles.bucketPill, { backgroundColor: surfaceColor }]}
        >
          <View style={[styles.pillIcon, { backgroundColor: fromBucket.isMain ? fromPalette.light : fromPalette.main }]}>
            <FromIcon size={14} color={fromPalette.cardText} weight="fill" />
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillName, { color: textColor }]}>{fromBucket.name}</Text>
            <Text style={[styles.pillSub, { color: secondaryColor }]}>{formatSub(fromBucket)}</Text>
          </View>
          <CaretRight size={16} color={secondaryColor} weight="bold" />
        </Pressable>

        <Pressable
          onPress={() => setPickerTarget('to')}
          style={[styles.bucketPill, { backgroundColor: surfaceColor }]}
        >
          <View style={[styles.pillIcon, { backgroundColor: toBucket.isMain ? toPalette.light : toPalette.main }]}>
            <ToIcon size={14} color={toPalette.cardText} weight="fill" />
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillName, { color: textColor }]}>{toBucket.name}</Text>
            <Text style={[styles.pillSub, { color: secondaryColor }]}>{formatSub(toBucket)}</Text>
          </View>
          <CaretRight size={16} color={secondaryColor} weight="bold" />
        </Pressable>

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

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          {actionButton}
        </InputAccessoryView>
      )}

      {Platform.OS !== 'ios' && (
        <View style={[styles.fallbackBottom, { paddingBottom: insets.bottom + 8 }]}>
          {actionButton}
        </View>
      )}

      <BucketPickerModal
        visible={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'from' ? 'Select source' : 'Select destination'}
        buckets={availableBuckets}
        selectedId={pickerTarget === 'from' ? fromBucketId : toBucketId}
        onSelect={(id) => {
          if (pickerTarget === 'from') setFromBucketId(id);
          else setToBucketId(id);
          setPickerTarget(null);
        }}
      />
    </View>
  );
}

function BucketPickerModal({ visible, onClose, title, buckets, selectedId, onSelect }: {
  visible: boolean;
  onClose: () => void;
  title: string;
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
        <Text style={[styles.modalTitle, { color: textColor }]}>{title}</Text>
        <View style={styles.modalList}>
          {buckets.map((bucket) => {
            const Icon = getBucketIcon(bucket.icon);
            const palette = getBucketPalette(bucket.colorKey);
            const isSelected = bucket.id === selectedId;
            return (
              <Pressable
                key={bucket.id}
                onPress={() => onSelect(bucket.id)}
                style={({ pressed }) => [styles.sourceItem, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.sourceIcon, { backgroundColor: bucket.isMain ? palette.light : palette.main }]}>
                  <Icon size={18} color={palette.cardText} weight="fill" />
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
        </View>
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
    paddingVertical: 14,
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
  pillName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  pillSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  arrowOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: 10,
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
    paddingHorizontal: 20,
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
