import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { getBucketPalette } from '@/constants/bucket-colors';
import { Fonts } from '@/constants/theme';
import { calcProgress } from '@/utils/format';
import { getBucketIcon } from '@/utils/bucket-icons';
import { StatsRow, TransactionList, BottomActions } from '@/components/bucket';
import { mockBuckets, mockTransactions } from '@/data/mock';

export default function BucketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const bucket = mockBuckets.find((b) => b.id === id);

  if (!bucket) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Bucket not found</Text>
      </View>
    );
  }

  const palette = getBucketPalette(bucket.colorKey);
  const progress = calcProgress(bucket.currentAmount, bucket.targetAmount);
  const transactions = mockTransactions.filter((t) => t.bucketId === bucket.id);
  const Icon = getBucketIcon(bucket.icon);

  return (
    <View style={[styles.screen, { backgroundColor: palette.dark }]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: palette.main }]}>
          <View style={styles.heroIcon}>
            <Icon size={24} color={palette.cardText} weight="fill" />
          </View>
          <Text style={[styles.heroName, { color: palette.cardText }]}>
            {bucket.name}
          </Text>
          {/* Progress bar inside hero */}
          <View style={[styles.heroProgress, { backgroundColor: palette.cardText, opacity: 0.15 }]}>
            <View
              style={[
                styles.heroProgressFill,
                {
                  backgroundColor: palette.cardText,
                  width: `${Math.min(progress, 100)}%`,
                  opacity: 1,
                },
              ]}
            />
          </View>
        </View>

        {/* Stats */}
        <StatsRow
          currentAmountCents={bucket.currentAmount}
          targetAmountCents={bucket.targetAmount}
          progressPercent={progress}
          textColor={palette.darkText}
          labelColor={`${palette.darkText}99`}
        />

        {/* Transactions */}
        <TransactionList
          transactions={transactions}
          textColor={palette.darkText}
        />
      </ScrollView>

      {/* Bottom CTAs */}
      <BottomActions
        onMore={() => {}}
        onAddFunds={() => {}}
        accentColor={palette.main}
        accentTextColor={palette.cardText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    justifyContent: 'flex-end',
    gap: 12,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: 56,
    fontFamily: Fonts.medium,
    lineHeight: 56 * 0.9,
    letterSpacing: 56 * -0.05,
  },
  heroProgress: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  notFoundText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
});
