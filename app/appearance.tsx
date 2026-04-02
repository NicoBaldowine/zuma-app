import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sun, Moon, DeviceMobileCamera } from 'phosphor-react-native';

import { useThemePreference, type ThemePreference } from '@/contexts/theme-context';
import { SheetListItem } from '@/components/shared';

export default function AppearanceSheet() {
  const router = useRouter();
  const { preference, setPreference } = useThemePreference();

  function handleSelect(pref: ThemePreference) {
    Haptics.selectionAsync();
    setPreference(pref);
    router.back();
  }

  return (
    <View style={styles.container}>
      <SheetListItem icon={Sun} label="Light" selected={preference === 'light'} onPress={() => handleSelect('light')} />
      <SheetListItem icon={Moon} label="Dark" selected={preference === 'dark'} onPress={() => handleSelect('dark')} />
      <SheetListItem icon={DeviceMobileCamera} label="System" selected={preference === 'system'} onPress={() => handleSelect('system')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 12,
    marginBottom: -16,
  },
});
