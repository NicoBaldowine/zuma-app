import type { BucketColorKey } from '@/types';

export type BucketColorPalette = {
  /** Detail screen full background */
  dark: string;
  /** Card background */
  main: string;
  /** Subtle accent / emoji circle bg */
  light: string;
  /** High-contrast text ON the main card */
  cardText: string;
  /** Accent text/icons on the dark background */
  darkText: string;
};

export const BucketColors: Record<BucketColorKey, BucketColorPalette> = {
  lime: {
    dark: '#1A3A1A',
    main: '#C8F560',
    light: '#EAFFC2',
    cardText: '#1A3A1A',
    darkText: '#C8F560',
  },
  orange: {
    dark: '#3D1A0A',
    main: '#FF9F43',
    light: '#FFE0C2',
    cardText: '#3D1A0A',
    darkText: '#FF9F43',
  },
  lavender: {
    dark: '#2A1F3D',
    main: '#C4B1F0',
    light: '#EDE6FF',
    cardText: '#2A1F3D',
    darkText: '#C4B1F0',
  },
  coral: {
    dark: '#3D1219',
    main: '#FF6B6B',
    light: '#FFD4D4',
    cardText: '#3D1219',
    darkText: '#FF6B6B',
  },
  sky: {
    dark: '#0A2440',
    main: '#5BC0F8',
    light: '#C2EBFF',
    cardText: '#0A2440',
    darkText: '#5BC0F8',
  },
  mint: {
    dark: '#0D3028',
    main: '#6EDCB4',
    light: '#C8F5E4',
    cardText: '#0D3028',
    darkText: '#6EDCB4',
  },
  gold: {
    dark: '#3D2E0A',
    main: '#F5C842',
    light: '#FFF2C2',
    cardText: '#3D2E0A',
    darkText: '#F5C842',
  },
  rose: {
    dark: '#3D0A2A',
    main: '#F06292',
    light: '#FFD4E8',
    cardText: '#3D0A2A',
    darkText: '#F06292',
  },
  peach: {
    dark: '#3D2014',
    main: '#FFB088',
    light: '#FFD8C2',
    cardText: '#3D2014',
    darkText: '#FFB088',
  },
  teal: {
    dark: '#0A2E2E',
    main: '#4DD0C8',
    light: '#B8F0EC',
    cardText: '#0A2E2E',
    darkText: '#4DD0C8',
  },
  indigo: {
    dark: '#1A1A3D',
    main: '#7B7BF0',
    light: '#C8C8FF',
    cardText: '#1A1A3D',
    darkText: '#7B7BF0',
  },
  sage: {
    dark: '#1A2E1A',
    main: '#A8C686',
    light: '#DFF0CC',
    cardText: '#1A2E1A',
    darkText: '#A8C686',
  },
  berry: {
    dark: '#3D0A28',
    main: '#F078AB',
    light: '#FFCCE5',
    cardText: '#3D0A28',
    darkText: '#F078AB',
  },
  mauve: {
    dark: '#2E1A2E',
    main: '#C49DBF',
    light: '#F0DFF0',
    cardText: '#2E1A2E',
    darkText: '#C49DBF',
  },
  ocean: {
    dark: '#0A1A3D',
    main: '#7BA4FF',
    light: '#C2D4FF',
    cardText: '#0A1A3D',
    darkText: '#7BA4FF',
  },
  lemon: {
    dark: '#2E3D0A',
    main: '#E8E048',
    light: '#FFFAC2',
    cardText: '#2E3D0A',
    darkText: '#E8E048',
  },
  blush: {
    dark: '#3D1A24',
    main: '#F8A4B8',
    light: '#FFE0E8',
    cardText: '#3D1A24',
    darkText: '#F8A4B8',
  },
  slate: {
    dark: '#1A2028',
    main: '#8899AA',
    light: '#D0DAE4',
    cardText: '#1A2028',
    darkText: '#8899AA',
  },
  ember: {
    dark: '#3D1208',
    main: '#FF8A6A',
    light: '#FFD0C2',
    cardText: '#3D1208',
    darkText: '#FF8A6A',
  },
  lilac: {
    dark: '#281A3D',
    main: '#B08CDB',
    light: '#E4D4FF',
    cardText: '#281A3D',
    darkText: '#B08CDB',
  },
  custom: {
    dark: '#1C1C1E',
    main: '#B0B0B0',
    light: '#D8D8D8',
    cardText: '#1C1C1E',
    darkText: '#B0B0B0',
  },
  neutral: {
    dark: '#111111',
    main: '#1C1C1E',
    light: '#2C2C2E',
    cardText: '#FFFFFF',
    darkText: '#9CA3AF',
  },
};

const NeutralLight: BucketColorPalette = {
  dark: '#F5F5F5',
  main: '#E8E8E8',
  light: '#D1D1D6',
  cardText: '#1A1A1A',
  darkText: '#6B7280',
};

export function getBucketPalette(colorKey: BucketColorKey, scheme?: 'light' | 'dark', customColor?: string): BucketColorPalette {
  if (colorKey === 'neutral' && scheme === 'light') return NeutralLight;
  if (colorKey === 'custom' && customColor) {
    return {
      dark: '#1C1C1E',
      main: customColor,
      light: customColor + '40',
      cardText: '#1C1C1E',
      darkText: customColor,
    };
  }
  return BucketColors[colorKey];
}
