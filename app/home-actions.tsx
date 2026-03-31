import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowsLeftRight, HandWithdraw, ClockCounterClockwise, Receipt } from 'phosphor-react-native';

import { SheetListItem } from '@/components/shared';

export default function HomeActionsSheet() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SheetListItem icon={ArrowsLeftRight} label="Move Funds" onPress={() => { router.back(); router.push('/move-funds'); }} />
      <SheetListItem icon={HandWithdraw} label="Withdraw" onPress={() => { router.back(); router.push('/withdraw'); }} />
      <SheetListItem icon={ClockCounterClockwise} label="Transaction History" onPress={() => { router.back(); router.push('/transaction-history'); }} />
      <SheetListItem icon={Receipt} label="Statements" onPress={() => { router.back(); router.push('/statements'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingHorizontal: 8,
  },
});
