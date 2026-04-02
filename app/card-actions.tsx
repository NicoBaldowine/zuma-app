import { StyleSheet, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trash, ArrowsClockwise } from 'phosphor-react-native';

import { SheetListItem } from '@/components/shared';
import { cancelCard } from '@/lib/api/virtual-cards';
import { useCelebration } from '@/contexts/celebration-context';

export default function CardActionsSheet() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { showToast } = useCelebration();

  function handleDeleteCard() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancel Card',
      'Are you sure you want to cancel this virtual card? This action cannot be undone.',
      [
        { text: 'Keep Card', style: 'cancel' },
        {
          text: 'Cancel Card',
          style: 'destructive',
          onPress: async () => {
            if (!cardId) return;
            try {
              await cancelCard(cardId);
              showToast('Card cancelled');
            } catch (err: any) {
              alert(err.message ?? 'Failed to cancel card');
            }
            router.back();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <SheetListItem
        icon={ArrowsClockwise}
        label="Replace Card"
        onPress={() => { router.back(); }}
      />
      <SheetListItem
        icon={Trash}
        label="Cancel Card"
        onPress={handleDeleteCard}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
});
