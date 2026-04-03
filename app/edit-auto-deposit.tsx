import { useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Modal, ScrollView, Keyboard, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X, CaretRight, Check, ArrowDown,
  Clock, CalendarBlank, Target, Repeat, Trash, Pause, Play,
} from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency, formatAmountInput, parseAmountInput } from '@/utils/format';
import { useBuckets } from '@/contexts/buckets-context';
import { useAutoDeposits } from '@/contexts/auto-deposits-context';
import { SheetListItem, FormField, FormSelect } from '@/components/shared';
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

export default function EditAutoDepositScreen() {
  const router = useRouter();
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  const { buckets } = useBuckets();
  const { rules, updateRule, deleteRule, pauseRule } = useAutoDeposits();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const rule = rules.find((r) => r.id === ruleId);
  const mainBucket = buckets.find((b) => b.isMain)!;
  const targetBucket = buckets.find((b) => b.id === rule?.targetBucketId) ?? buckets.find((b) => !b.isMain)!;

  const [fromBucketId, setFromBucketId] = useState(rule?.sourceBucketId ?? mainBucket?.id ?? '');
  const [amount, setAmount] = useState(rule ? formatAmountInput(String(rule.amount / 100)) : '25');
  const [frequency, setFrequency] = useState<AutoDepositFrequency>(rule?.frequency ?? 'daily');
  const [endCondition, setEndCondition] = useState<AutoDepositEnd>(rule?.endCondition ?? 'bucket_full');

  const [isPaused, setIsPaused] = useState(rule?.isPaused ?? false);
  const [fromPickerVisible, setFromPickerVisible] = useState(false);
  const [frequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const fromBucket = buckets.find((b) => b.id === fromBucketId) ?? mainBucket;
  const fromPalette = getBucketPalette(fromBucket.colorKey);
  const targetPalette = getBucketPalette(targetBucket.colorKey);
  const FromIcon = getBucketIcon(fromBucket.icon);
  const TargetIcon = getBucketIcon(targetBucket.icon);

  const availableFromBuckets = buckets.filter(
    (b) => b.id !== targetBucket?.id
  );

  const isValid = amount.trim().length > 0 && parseFloat(parseAmountInput(amount)) > 0;

  function handleDelete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Auto-Deposit',
      'Are you sure? This will stop all future automatic deposits to this bucket. You can set up a new one anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!ruleId) return;
            try {
              await deleteRule(ruleId);
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to delete');
            }
          },
        },
      ],
    );
  }

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
        <Text style={[styles.title, { color: textColor }]}>Edit auto-deposit</Text>

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

        <FormField
          label="Amount"
          value={amount}
          onChangeText={(v) => setAmount(formatAmountInput(v))}
          keyboardType="decimal-pad"
          style={{ marginBottom: 8 }}
        />

        <View style={styles.pickersRow}>
          <FormSelect
            label="Frequency"
            value={FREQUENCY_OPTIONS.find((o) => o.key === frequency)?.label}
            onPress={() => setFrequencyPickerVisible(true)}
            style={{ flex: 1 }}
          />

          <FormSelect
            label="Ends"
            value={END_OPTIONS.find((o) => o.key === endCondition)?.short}
            onPress={() => setEndPickerVisible(true)}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom: Delete + Pause + Save */}
      <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable onPress={handleDelete} style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
          <Trash size={20} color="#FF453A" weight="fill" />
        </Pressable>
        <Pressable
          onPress={async () => {
            if (!ruleId) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            try {
              await pauseRule(ruleId, !isPaused);
              setIsPaused(!isPaused);
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to update');
            }
          }}
          style={[styles.iconButton, { backgroundColor: surfaceColor }]}
        >
          {isPaused ? (
            <Play size={20} color={textColor} weight="fill" />
          ) : (
            <Pause size={20} color={textColor} weight="fill" />
          )}
        </Pressable>
        <Pressable
          onPress={async () => {
            if (!isValid || saving || !ruleId) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSaving(true);
            try {
              await updateRule(ruleId, {
                sourceBucketId: fromBucketId,
                amount: Math.round(parseFloat(parseAmountInput(amount)) * 100),
                frequency,
                endCondition,
              });
              router.back();
            } catch (err: any) {
              alert(err.message ?? 'Failed to save');
            } finally {
              setSaving(false);
            }
          }}
          style={[styles.saveButton, { backgroundColor: textColor, opacity: isValid && !saving ? 1 : 0.25 }]}
        >
          <Text style={[styles.saveButtonText, { color: bgColor }]}>
            {saving ? 'Saving...' : isPaused ? 'Resume' : 'Save changes'}
          </Text>
        </Pressable>
      </View>

      {/* From picker */}
      <BucketPickerModal
        visible={fromPickerVisible}
        onClose={() => setFromPickerVisible(false)}
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

function BucketPickerModal({ visible, onClose, buckets, selectedId, onSelect }: {
  visible: boolean; onClose: () => void; buckets: Bucket[]; selectedId: string; onSelect: (id: string) => void;
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
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 24, marginTop: 8 },
  pills: { gap: 8, marginBottom: 8 },
  bucketPill: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, paddingHorizontal: 16, borderRadius: 20 },
  pillIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillInfo: { flex: 1 },
  pillName: { fontSize: 16, fontFamily: Fonts.medium },
  pillSub: { fontSize: 13, fontFamily: Fonts.regular },
  arrowOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', top: -4, zIndex: 10, pointerEvents: 'none' },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  pickersRow: { flexDirection: 'row', gap: 12 },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  modalRoot: { flex: 1 },
  modalTitle: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, paddingHorizontal: 20, marginBottom: 20, marginTop: 8 },
  modalList: { paddingHorizontal: 12 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  sourceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sourceInfo: { flex: 1, gap: 2 },
  sourceName: { fontSize: 16, fontFamily: Fonts.medium },
  sourceBalance: { fontSize: 13, fontFamily: Fonts.regular },
});
