import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, DeviceMobileCamera } from 'phosphor-react-native';

import { SheetListItem } from '@/components/shared';

export default function AppearanceSheet() {
  const router = useRouter();
  const selected: string = 'dark';

  return (
    <View style={styles.container}>
      <SheetListItem icon={Sun} label="Light" selected={selected === 'light'} onPress={() => router.back()} />
      <SheetListItem icon={Moon} label="Dark" selected={selected === 'dark'} onPress={() => router.back()} />
      <SheetListItem icon={DeviceMobileCamera} label="System" selected={selected === 'system'} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingHorizontal: 8,
  },
});
