import { StyleSheet, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Shuffle, PencilSimple, Trash } from 'phosphor-react-native';

import { SheetListItem } from '@/components/shared';

export default function MoreActionsSheet() {
  const router = useRouter();
  function handleDelete() {
    Alert.alert(
      'Delete Bucket',
      'Are you sure you want to delete this bucket? All savings will be moved back to your main balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => router.back() },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <SheetListItem icon={CreditCard} label="Virtual Card" onPress={() => { router.back(); router.push('/virtual-card'); }} />
      <SheetListItem icon={Shuffle} label="Move Funds" onPress={() => { router.back(); router.push('/move-funds'); }} />
      <SheetListItem icon={PencilSimple} label="Edit Bucket" onPress={() => { router.back(); router.push('/edit-bucket'); }} />
      <SheetListItem icon={Trash} label="Delete Bucket" onPress={handleDelete} destructive />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingHorizontal: 8,
  },
});
