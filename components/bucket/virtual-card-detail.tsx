import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Snowflake, Play, Eye, EyeSlash, DotsThree, AppleLogo } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

import type { VirtualCard } from '@/types';
import type { BucketColorPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';
import { freezeCard, unfreezeCard } from '@/lib/api/virtual-cards';
import { getBucketIcon } from '@/utils/bucket-icons';

type VirtualCardDetailProps = {
  card: VirtualCard;
  bucketName: string;
  bucketIcon: string;
  bucketIconType: 'icon' | 'emoji';
  palette: BucketColorPalette;
  onStatusChange: () => void;
  onMore: () => void;
};

export function VirtualCardDetail({
  card,
  bucketName,
  bucketIcon,
  bucketIconType,
  palette,
  onStatusChange,
  onMore,
}: VirtualCardDetailProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [toggling, setToggling] = useState(false);
  const isFrozen = card.status === 'frozen';
  const BucketIcon = bucketIconType !== 'emoji' ? getBucketIcon(bucketIcon) : null;

  const maskedNumber = card.cardNumber.replace(/\d{4}(?=.*\d{4})/g, '••••');
  const displayNumber = showDetails ? card.cardNumber : maskedNumber;
  const displayCVV = showDetails ? card.cvv : '•••';
  const expiry = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;

  const handleToggleFreeze = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (isFrozen) {
        await unfreezeCard(card.id);
      } else {
        await freezeCard(card.id);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onStatusChange();
    } catch (err: any) {
      alert(err.message ?? 'Failed to update card');
    } finally {
      setToggling(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={[styles.card, { backgroundColor: palette.main }, isFrozen && styles.cardFrozen]}>
        <View style={styles.cardRow}>
          <View style={styles.cardIconCircle}>
            {bucketIconType === 'emoji' ? (
              <Text style={{ fontSize: 14 }}>{bucketIcon}</Text>
            ) : (
              BucketIcon && <BucketIcon size={16} color={palette.cardText} weight="fill" />
            )}
          </View>
          <Text style={[styles.visaText, { color: palette.cardText }]}>VISA</Text>
        </View>

        <Text style={[styles.cardNumberText, { color: palette.cardText }]}>
          {displayNumber}
        </Text>

        <View style={styles.cardRow}>
          <View>
            <Text style={[styles.cardSmallLabel, { color: palette.cardText }]}>EXP</Text>
            <Text style={[styles.cardSmallValue, { color: palette.cardText }]}>{expiry}</Text>
          </View>
          <View>
            <Text style={[styles.cardSmallLabel, { color: palette.cardText }]}>CVV</Text>
            <Text style={[styles.cardSmallValue, { color: palette.cardText }]}>{displayCVV}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.cardSmallLabel, { color: palette.cardText }]}>LIMIT</Text>
            <Text style={[styles.cardSmallValue, { color: palette.cardText }]}>
              {formatCurrency(card.spendingLimit)}
            </Text>
          </View>
        </View>

        {isFrozen && (
          <View style={styles.frozenOverlay}>
            <Snowflake size={32} color="#FFFFFF" weight="fill" />
            <Text style={styles.frozenText}>Card frozen</Text>
          </View>
        )}
      </View>

      {/* Action circles */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDetails(!showDetails); }}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            {showDetails ? (
              <EyeSlash size={22} color="#FFFFFF" weight="fill" />
            ) : (
              <Eye size={22} color="#FFFFFF" weight="fill" />
            )}
          </View>
          <Text style={styles.actionLabel}>{showDetails ? 'Hide' : 'Show'}</Text>
        </Pressable>

        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleToggleFreeze(); }}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            {isFrozen ? (
              <Play size={22} color="#FFFFFF" weight="fill" />
            ) : (
              <Snowflake size={22} color="#FFFFFF" weight="fill" />
            )}
          </View>
          <Text style={styles.actionLabel}>{isFrozen ? 'Unfreeze' : 'Freeze'}</Text>
        </Pressable>

        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMore(); }}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <DotsThree size={22} color="#FFFFFF" weight="bold" />
          </View>
          <Text style={styles.actionLabel}>More</Text>
        </Pressable>
      </View>

      {/* Add to Apple Pay */}
      <Pressable
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={styles.applePayButton}
      >
        <AppleLogo size={18} color="#FFFFFF" weight="fill" />
        <Text style={styles.applePayText}>Add to Apple Pay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    aspectRatio: 1.7,
    justifyContent: 'space-between',
  },
  cardFrozen: {
    opacity: 0.6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  cardNumberText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    letterSpacing: 3,
    textAlign: 'center',
  },
  cardSmallLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    opacity: 0.5,
    letterSpacing: 1,
  },
  cardSmallValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    marginTop: 1,
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frozenText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  applePayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    height: 52,
    borderRadius: 26,
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
});
