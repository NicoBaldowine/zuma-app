import { useThemePreference } from '@/contexts/theme-context';
import type { ColorScheme } from '@/contexts/theme-context';

export function useColorScheme(): ColorScheme {
  const { colorScheme } = useThemePreference();
  return colorScheme;
}
