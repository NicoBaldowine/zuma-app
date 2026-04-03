import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ColorScheme } from '@/contexts/theme-context';

type ColorKey = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string; gold?: string; lavender?: string },
  colorName: ColorKey,
) {
  const theme = useColorScheme();

  // Check for explicit override
  const colorFromProps = props[theme as keyof typeof props];
  if (colorFromProps) return colorFromProps;

  // Fall back to palette
  return Colors[theme][colorName];
}
