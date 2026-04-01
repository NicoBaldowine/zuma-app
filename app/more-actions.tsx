import { StyleSheet, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Repeat, PencilSimple, Trash } from 'phosphor-react-native';

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
      <SheetListItem icon={Repeat} label="Auto-Deposit" onPress={() => { router.back(); router.push('/auto-deposit'); }} />
      <SheetListItem icon={PencilSimple} label="Edit Bucket" onPress={() => { router.back(); router.push('/edit-bucket'); }} />
      <SheetListItem icon={Trash} label="Delete Bucket" onPress={handleDelete} destructive />
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
