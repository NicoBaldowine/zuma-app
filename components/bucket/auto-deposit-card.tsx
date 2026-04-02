import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Repeat, PencilSimple, Pause } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import type { AutoDepositFrequency, AutoDepositEnd, BucketColorKey } from '@/types';

const FREQUENCY_LABELS: Record<AutoDepositFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};

const END_LABELS: Record<AutoDepositEnd, string> = {
  bucket_full: 'until bucket is full',
  '3_months': 'for 3 months',
  '6_months': 'for 6 months',
  '1_year': 'for 1 year',
  never: 'forever',
};

type AutoDepositCardProps = {
  frequency: AutoDepositFrequency;
  endCondition: AutoDepositEnd;
  amount: string;
  colorKey: BucketColorKey;
  paused?: boolean;
  onEdit: () => void;
};

export function AutoDepositCard({
  frequency,
  endCondition,
  amount,
  colorKey,
  paused = false,
  onEdit,
}: AutoDepositCardProps) {
  const palette = getBucketPalette(colorKey);

  return (
    <View style={[styles.card, { backgroundColor: paused ? 'rgba(255,255,255,0.12)' : palette.main }]}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: paused ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]}>
          {paused ? (
            <Pause size={18} color="#FFFFFF" weight="fill" />
          ) : (
            <Repeat size={18} color={palette.cardText} weight="fill" />
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: paused ? '#FFFFFF' : palette.cardText }]}>
            {paused ? 'Auto-deposit paused' : 'Auto-deposit enabled'}
          </Text>
          <Text style={[styles.subtitle, { color: paused ? 'rgba(255,255,255,0.6)' : palette.cardText, opacity: paused ? 1 : 0.6 }]}>
            ${amount} {FREQUENCY_LABELS[frequency].toLowerCase()} {END_LABELS[endCondition]}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onEdit(); }} style={[styles.editButton, { backgroundColor: paused ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]}>
        <PencilSimple size={16} color={paused ? '#FFFFFF' : palette.cardText} weight="fill" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
