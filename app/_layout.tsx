import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const navTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: Colors.dark.background,
          card: Colors.dark.background,
          text: Colors.dark.text,
          border: Colors.dark.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: Colors.light.background,
          card: Colors.light.background,
          text: Colors.light.text,
          border: Colors.light.border,
        },
      };

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="more-actions"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.45],
            sheetGrabberVisible: true,
            sheetCornerRadius: 30,
            sheetExpandsWhenScrolledToEdge: false,
          }}
        />
        <Stack.Screen
          name="create-bucket"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="edit-bucket"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="virtual-card"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="move-funds"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="auto-deposit"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="edit-auto-deposit"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="withdraw"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="transaction-history"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="statements"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="add-funds"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="add-to-bucket"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="account"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="notification-preferences"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="custom-color"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="appearance"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 30,
          }}
        />
        <Stack.Screen
          name="home-actions"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 30,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
