import { StyleSheet, View, Alert, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CreditCard, Repeat, PencilSimple, Trash, ShareNetwork } from 'phosphor-react-native';

import { SheetListItem } from '@/components/shared';
import { useBuckets } from '@/contexts/buckets-context';
import { useCelebration } from '@/contexts/celebration-context';
import { formatCurrency } from '@/utils/format';

export default function MoreActionsSheet() {
  const router = useRouter();
  const { bucketId, completed } = useLocalSearchParams<{ bucketId: string; completed?: string }>();
  const { buckets, deleteBucket } = useBuckets();
  const { showToast } = useCelebration();
  const bucket = buckets.find((b) => b.id === bucketId);
  const isCompleted = completed === '1';

  function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const name = bucket?.name ?? 'my goal';
    const saved = bucket ? formatCurrency(bucket.currentAmount) : '$0';
    const target = bucket ? formatCurrency(bucket.targetAmount) : '$0';

    const message = isCompleted
      ? `I just completed my "${name}" savings goal with Zuma! 🎉 Saved ${target} — now treating myself. Start saving smarter: https://zuma.app/download`
      : `I'm saving for "${name}" with Zuma — already at ${saved} of ${target}! 💰 Try it out: https://zuma.app/download`;

    Share.share({ message });
  }

  function handleDelete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Bucket',
      'Are you sure you want to delete this bucket? All savings will be moved back to your main balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const name = bucket?.name ?? 'Bucket';
            if (bucketId) {
              try {
                await deleteBucket(bucketId);
                showToast(`${name} deleted`);
              } catch (err: any) {
                alert(err.message ?? 'Failed to delete');
              }
            }
            // Dismiss sheet + bucket detail back to home
            router.dismissAll();
          },
        },
      ],
    );
  }

  if (isCompleted) {
    return (
      <View style={styles.containerCompleted}>
        <SheetListItem icon={CreditCard} label="Virtual Card" onPress={() => { router.back(); router.push({ pathname: '/virtual-card', params: { bucketId } }); }} />
        <SheetListItem icon={PencilSimple} label="Edit Bucket" onPress={() => { router.back(); router.push({ pathname: '/edit-bucket', params: { bucketId, completed: '1' } }); }} />
        <SheetListItem icon={ShareNetwork} label="Share" onPress={handleShare} />
        <SheetListItem icon={Trash} label="Delete Bucket" onPress={handleDelete} destructive />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SheetListItem icon={CreditCard} label="Virtual Card" onPress={() => { router.back(); router.push({ pathname: '/virtual-card', params: { bucketId } }); }} />
      <SheetListItem icon={Repeat} label="Auto-Deposit" onPress={() => { router.back(); router.push({ pathname: '/auto-deposit', params: { bucketId } }); }} />
      <SheetListItem icon={PencilSimple} label="Edit Bucket" onPress={() => { router.back(); router.push({ pathname: '/edit-bucket', params: { bucketId } }); }} />
      <SheetListItem icon={ShareNetwork} label="Share" onPress={handleShare} />
      <SheetListItem icon={Trash} label="Delete Bucket" onPress={handleDelete} destructive />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 12,
    marginBottom: -16,
  },
  containerCompleted: {
    paddingTop: 12,
    paddingHorizontal: 12,
    marginBottom: -16,
  },
});
