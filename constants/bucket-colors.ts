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
  neutral: {
    dark: '#111111',
    main: '#1C1C1E',
    light: '#2C2C2E',
    cardText: '#FFFFFF',
    darkText: '#9CA3AF',
  },
};

export function getBucketPalette(colorKey: BucketColorKey): BucketColorPalette {
  return BucketColors[colorKey];
}
