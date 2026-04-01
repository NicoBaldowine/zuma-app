import { useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, TextInput, Modal, ScrollView, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X, CaretRight, CaretDown, Check, ArrowDown,
  Clock, CalendarBlank, Target, Repeat,
} from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency } from '@/utils/format';
import { mockBuckets } from '@/data/mock';
import { SheetListItem } from '@/components/shared';
import type { Bucket, AutoDepositFrequency, AutoDepositEnd } from '@/types';

const FREQUENCY_OPTIONS: { key: AutoDepositFrequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const END_OPTIONS: { key: AutoDepositEnd; label: string; short: string; icon: any }[] = [
  { key: 'bucket_full', label: 'When bucket is full', short: 'Bucket is full', icon: Target },
  { key: '3_months', label: 'After 3 months', short: '3 months', icon: CalendarBlank },
  { key: '6_months', label: 'After 6 months', short: '6 months', icon: CalendarBlank },
  { key: '1_year', label: 'After 1 year', short: '1 year', icon: CalendarBlank },
  { key: 'never', label: 'Never', short: 'Never', icon: Repeat },
];

export default function AutoDepositScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const mainBucket = mockBuckets.find((b) => b.isMain)!;
  const targetBucket = mockBuckets.find((b) => !b.isMain)!;

  const [fromBucketId, setFromBucketId] = useState(mainBucket.id);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<AutoDepositFrequency | null>(null);
  const [endCondition, setEndCondition] = useState<AutoDepositEnd | null>(null);

  const [fromPickerVisible, setFromPickerVisible] = useState(false);
  const [frequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);

  const fromBucket = mockBuckets.find((b) => b.id === fromBucketId)!;
  const fromPalette = getBucketPalette(fromBucket.colorKey);
  const targetPalette = getBucketPalette(targetBucket.colorKey);
  const FromIcon = getBucketIcon(fromBucket.icon);
  const TargetIcon = getBucketIcon(targetBucket.icon);

  const availableFromBuckets = mockBuckets.filter(
    (b) => b.id !== targetBucket.id && b.currentAmount > 0
  );

  const isValid = amount.trim().length > 0 && parseFloat(amount) > 0 && frequency && endCondition;

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
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.title, { color: textColor }]}>Auto-deposit</Text>

        {/* From / To pills */}
        <View style={styles.pills}>
          <Pressable
            onPress={() => setFromPickerVisible(true)}
            style={[styles.bucketPill, { backgroundColor: surfaceColor }]}
          >
            <View style={[styles.pillIcon, { backgroundColor: fromBucket.isMain ? fromPalette.light : fromPalette.main }]}>
              <FromIcon size={14} color={fromPalette.cardText} weight="fill" />
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
              <TargetIcon size={14} color={targetPalette.cardText} weight="fill" />
            </View>
            <View style={styles.pillInfo}>
              <Text style={[styles.pillName, { color: textColor }]}>{targetBucket.name}</Text>
              <Text style={[styles.pillSub, { color: secondaryColor }]}>
                {formatCurrency(targetBucket.currentAmount)} of {formatCurrency(targetBucket.targetAmount)}
              </Text>
            </View>
            <CaretRight size={16} color={`${secondaryColor}40`} weight="bold" />
          </View>

          <View style={styles.arrowOverlay}>
            <View style={[styles.arrowCircle, { backgroundColor: surfaceColor, borderColor: bgColor }]}>
              <ArrowDown size={16} color={secondaryColor} weight="bold" />
            </View>
          </View>
        </View>

        {/* Amount */}
        <View style={[styles.field, { backgroundColor: surfaceColor }]}>
          {amount.length > 0 && (
            <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Amount</Text>
          )}
          <TextInput
            style={[styles.fieldInput, { color: textColor }]}
            placeholder="Amount"
            placeholderTextColor={secondaryColor}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Frequency & End dropdowns */}
        <View style={styles.pickersRow}>
          <Pressable
            onPress={() => setFrequencyPickerVisible(true)}
            style={[styles.field, styles.pickerButton, { backgroundColor: surfaceColor }]}
          >
            {frequency && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Frequency</Text>
            )}
            <View style={styles.pickerInner}>
              <Text style={[styles.fieldValue, { color: frequency ? textColor : secondaryColor }]}>
                {frequency ? FREQUENCY_OPTIONS.find((o) => o.key === frequency)?.label : 'Frequency'}
              </Text>
              <CaretDown size={14} color={secondaryColor} weight="bold" />
            </View>
          </Pressable>

          <Pressable
            onPress={() => setEndPickerVisible(true)}
            style={[styles.field, styles.pickerButton, { backgroundColor: surfaceColor }]}
          >
            {endCondition && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Ends</Text>
            )}
            <View style={styles.pickerInner}>
              <Text style={[styles.fieldValue, { color: endCondition ? textColor : secondaryColor }]}>
                {endCondition ? END_OPTIONS.find((o) => o.key === endCondition)?.short : 'Ends'}
              </Text>
              <CaretDown size={14} color={secondaryColor} weight="bold" />
            </View>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action button */}
      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={() => { if (isValid) router.back(); }}
          style={[styles.actionButton, { backgroundColor: isValid ? textColor : surfaceColor }]}
        >
          <Text style={[styles.actionButtonText, { color: isValid ? bgColor : secondaryColor }]}>
            Set up auto-deposit
          </Text>
        </Pressable>
      </View>

      {/* From picker */}
      <BucketPickerModal
        visible={fromPickerVisible}
        onClose={() => setFromPickerVisible(false)}
        title="Select source"
        buckets={availableFromBuckets}
        selectedId={fromBucketId}
        onSelect={(id) => { setFromBucketId(id); setFromPickerVisible(false); }}
      />

      {/* Frequency picker */}
      <Modal visible={frequencyPickerVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFrequencyPickerVisible(false)}>
        <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
          <View style={[styles.stickyClose, { marginTop: 4 }]}>
            <Pressable onPress={() => setFrequencyPickerVisible(false)} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
              <X size={18} color={secondaryColor} weight="bold" />
            </Pressable>
          </View>
          <Text style={[styles.modalTitle, { color: textColor }]}>Frequency</Text>
          <View style={styles.modalList}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <SheetListItem
                key={opt.key}
                icon={Clock}
                label={opt.label}
                selected={frequency === opt.key}
                onPress={() => { setFrequency(opt.key); setFrequencyPickerVisible(false); }}
              />
            ))}
          </View>
        </View>
      </Modal>

      {/* End condition picker */}
      <Modal visible={endPickerVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEndPickerVisible(false)}>
        <View style={[styles.modalRoot, { backgroundColor: bgColor }]}>
          <View style={[styles.stickyClose, { marginTop: 4 }]}>
            <Pressable onPress={() => setEndPickerVisible(false)} style={[styles.closeCircle, { backgroundColor: surfaceColor }]}>
              <X size={18} color={secondaryColor} weight="bold" />
            </Pressable>
          </View>
          <Text style={[styles.modalTitle, { color: textColor }]}>Ends</Text>
          <View style={styles.modalList}>
            {END_OPTIONS.map((opt) => (
              <SheetListItem
                key={opt.key}
                icon={opt.icon}
                label={opt.label}
                selected={endCondition === opt.key}
                onPress={() => { setEndCondition(opt.key); setEndPickerVisible(false); }}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BucketPickerModal({ visible, onClose, title, buckets, selectedId, onSelect }: {
  visible: boolean; onClose: () => void; title: string; buckets: Bucket[]; selectedId: string; onSelect: (id: string) => void;
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
                  <Text style={[styles.sourceBalance, { color: secondaryColor }]}>{formatCurrency(bucket.currentAmount)}</Text>
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
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 24, marginTop: 8 },
  pills: { gap: 8, marginBottom: 8 },
  bucketPill: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20 },
  pillIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillInfo: { flex: 1 },
  pillName: { fontSize: 16, fontFamily: Fonts.medium },
  pillSub: { fontSize: 13, fontFamily: Fonts.regular },
  arrowOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', top: 10, zIndex: 10, pointerEvents: 'none' },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  field: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: 8,
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
  fieldValue: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  pickersRow: { flexDirection: 'row', gap: 12 },
  pickerButton: { flex: 1 },
  pickerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomButton: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12 },
  actionButton: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: 16, fontFamily: Fonts.bold },
  modalRoot: { flex: 1 },
  modalTitle: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, paddingHorizontal: 20, marginBottom: 20, marginTop: 8 },
  modalList: { paddingHorizontal: 12 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  sourceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sourceInfo: { flex: 1, gap: 2 },
  sourceName: { fontSize: 16, fontFamily: Fonts.medium },
  sourceBalance: { fontSize: 13, fontFamily: Fonts.regular },
});
