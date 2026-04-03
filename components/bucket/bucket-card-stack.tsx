import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { Bucket } from '@/types';
import { BucketCard } from './bucket-card';
import { Skeleton } from '@/components/shared/skeleton';
import { useAutoDeposits } from '@/contexts/auto-deposits-context';

const CARD_OVERLAP = -47;
const SKELETON_COUNT = 3;

type BucketCardStackProps = {
  buckets: Bucket[];
  cardBucketIds?: Set<string>;
  loading?: boolean;
  onCardPress: (bucket: Bucket) => void;
};

export function BucketCardStack({ buckets, cardBucketIds, loading, onCardPress }: BucketCardStackProps) {
  const sorted = useMemo(() => [...buckets].sort((a, b) => a.order - b.order), [buckets]);
  const { getRuleForBucket } = useAutoDeposits();

  if (loading) {
    return (
      <Animated.View exiting={FadeOut.duration(300)} style={styles.container}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.cardWrapper,
              { marginTop: i === 0 ? 0 : CARD_OVERLAP },
            ]}
          >
            <Skeleton width="100%" height={i === SKELETON_COUNT - 1 ? 88 : 130} borderRadius={30} />
          </View>
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {sorted.map((bucket, index) => (
        <View
          key={bucket.id}
          style={[
            styles.cardWrapper,
            { marginTop: index === 0 ? 0 : CARD_OVERLAP },
          ]}
        >
          <BucketCard
            bucket={bucket}
            hasAutoDeposit={!bucket.isMain && !!getRuleForBucket(bucket.id)}
            hasVirtualCard={cardBucketIds?.has(bucket.id)}
            isLast={index === sorted.length - 1}
            onPress={onCardPress}
          />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -12,
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
