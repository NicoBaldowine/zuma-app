import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system' | 'gold' | 'lavender';
export type ColorScheme = 'light' | 'dark' | 'gold' | 'lavender';

type ThemeContextType = {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  colorScheme: ColorScheme;
};

const STORAGE_KEY = 'zuma_theme_preference';
const VALID_PREFS: ThemePreference[] = ['light', 'dark', 'system', 'gold', 'lavender'];

const ThemeContext = createContext<ThemeContextType>({
  preference: 'system',
  setPreference: () => {},
  colorScheme: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value && VALID_PREFS.includes(value as ThemePreference)) {
        setPreferenceState(value as ThemePreference);
      }
      setLoaded(true);
    });
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  let colorScheme: ColorScheme;
  if (preference === 'system') {
    colorScheme = (deviceScheme ?? 'dark') as ColorScheme;
  } else {
    colorScheme = preference;
  }

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ preference, setPreference, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemeContext);
}
