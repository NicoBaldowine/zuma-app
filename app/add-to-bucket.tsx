import { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, Pressable, TextInput, Modal,
  InputAccessoryView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, CaretRight } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency } from '@/utils/format';
import { mockBuckets } from '@/data/mock';
import { SheetListItem } from '@/components/shared';
import type { Bucket } from '@/types';

const INPUT_ACCESSORY_ID = 'add-to-bucket-btn';

export default function AddToBucketScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [amount, setAmount] = useState('');
  const [fromPickerVisible, setFromPickerVisible] = useState(false);

  // TODO: get actual target bucket from context/params
  const targetBucket = mockBuckets.find((b) => !b.isMain)!;
  const mainBucket = mockBuckets.find((b) => b.isMain)!;

  const [fromBucketId, setFromBucketId] = useState(mainBucket.id);
  const fromBucket = mockBuckets.find((b) => b.id === fromBucketId)!;

  // Buckets available as "from" source — must have funds and not be the target
  const availableFromBuckets = mockBuckets.filter(
    (b) => b.id !== targetBucket.id && b.currentAmount > 0
  );

  const fromPalette = getBucketPalette(fromBucket.colorKey);
  const targetPalette = getBucketPalette(targetBucket.colorKey);
  const FromIcon = getBucketIcon(fromBucket.icon);
  const TargetIcon = getBucketIcon(targetBucket.icon);

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const isValid = amountCents > 0 && amountCents <= fromBucket.currentAmount;

  const actionButton = (
    <View style={[styles.buttonContainer, { backgroundColor: bgColor }]}>
      <Pressable
        onPress={() => { if (isValid) router.back(); }}
        style={[styles.actionButton, { backgroundColor: isValid ? textColor : surfaceColor }]}
      >
        <Text style={[styles.actionButtonText, { color: isValid ? bgColor : secondaryColor }]}>
          Add funds
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
        {/* From — tappable */}
        <Pressable
          onPress={() => setFromPickerVisible(true)}
          style={[styles.bucketPill, { backgroundColor: surfaceColor }]}
        >
          <View style={[styles.pillIcon, { backgroundColor: fromPalette.main }]}>
            <FromIcon size={14} color={fromPalette.cardText} weight="fill" />
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillLabel, { color: secondaryColor }]}>From</Text>
            <Text style={[styles.pillName, { color: textColor }]}>{fromBucket.name}</Text>
          </View>
          <Text style={[styles.pillBalance, { color: secondaryColor }]}>
            {formatCurrency(fromBucket.currentAmount)}
          </Text>
          <CaretRight size={16} color={secondaryColor} weight="bold" />
        </Pressable>

        {/* To — locked */}
        <View style={[styles.bucketPill, { backgroundColor: surfaceColor }]}>
          <View style={[styles.pillIcon, { backgroundColor: targetPalette.main }]}>
            <TargetIcon size={14} color={targetPalette.cardText} weight="fill" />
          </View>
          <View style={styles.pillInfo}>
            <Text style={[styles.pillLabel, { color: secondaryColor }]}>To</Text>
            <Text style={[styles.pillName, { color: textColor }]}>{targetBucket.name}</Text>
          </View>
          <View style={styles.pillBalanceCol}>
            <Text style={[styles.pillBalanceCurrent, { color: secondaryColor }]}>
              {formatCurrency(targetBucket.currentAmount)}
            </Text>
            <Text style={[styles.pillBalanceTarget, { color: secondaryColor }]}>
              of {formatCurrency(targetBucket.targetAmount)}
            </Text>
          </View>
          <CaretRight size={16} color={`${secondaryColor}40`} weight="bold" />
        </View>
      </View>

      <Pressable style={styles.amountContainer} onPress={() => inputRef.current?.focus()}>
        <Text style={[styles.amountPrefix, { color: textColor }]}>$</Text>
        <TextInput
          ref={inputRef}
          style={[styles.amountInput, { color: textColor }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={secondaryColor}
          autoFocus
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
        />
      </Pressable>

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
        <View style={styles.modalList}>
          {buckets.map((bucket) => {
            const Icon = getBucketIcon(bucket.icon);
            const palette = getBucketPalette(bucket.colorKey);
            const isSelected = bucket.id === selectedId;
            return (
              <SheetListItem
                key={bucket.id}
                icon={Icon}
                label={`${bucket.name}  ·  ${formatCurrency(bucket.currentAmount)}`}
                selected={isSelected}
                onPress={() => onSelect(bucket.id)}
              />
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
  pillLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  pillName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  pillBalance: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  pillBalanceCol: {
    alignItems: 'flex-end',
  },
  pillBalanceCurrent: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  pillBalanceTarget: {
    fontSize: 11,
    fontFamily: Fonts.regular,
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
    paddingHorizontal: 12,
  },
});
