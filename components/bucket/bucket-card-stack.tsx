import { StyleSheet, View } from 'react-native';

import type { Bucket } from '@/types';
import { BucketCard } from './bucket-card';

const CARD_OVERLAP = -47;

type BucketCardStackProps = {
  buckets: Bucket[];
  onCardPress: (bucket: Bucket) => void;
};

export function BucketCardStack({ buckets, onCardPress }: BucketCardStackProps) {
  const sorted = [...buckets].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      {sorted.map((bucket, index) => (
        <View
          key={bucket.id}
          style={[
            styles.cardWrapper,
            { marginTop: index === 0 ? 0 : CARD_OVERLAP },
          ]}
        >
          <BucketCard bucket={bucket} onPress={onCardPress} />
        </View>
      ))}
    </View>
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
