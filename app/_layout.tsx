import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect, useSegments } from 'expo-router';
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
import { ThemeProvider as ZumaThemeProvider } from '@/contexts/theme-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { BucketsProvider, useBuckets } from '@/contexts/buckets-context';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { AutoDepositsProvider } from '@/contexts/auto-deposits-context';
import { CelebrationProvider } from '@/contexts/celebration-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

try { SplashScreen.preventAutoHideAsync(); } catch {}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ZumaThemeProvider>
          <RootLayoutGuard />
        </ZumaThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutGuard() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hide?.() ?? SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) return null;

  return (
    <CelebrationProvider>
      <BucketsProvider>
        <TransactionsProvider>
          <AutoDepositsProvider>
            <RootLayoutInner />
          </AutoDepositsProvider>
        </TransactionsProvider>
      </BucketsProvider>
    </CelebrationProvider>
  );
}

function RootLayoutInner() {
  const { session } = useAuth();
  const { savingsBuckets, loading: bucketsLoading } = useBuckets();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  const hasCompletedOnboarding = savingsBuckets.length > 0;
  const onAuthScreen = segments[0] === 'onboarding-auth' || segments[0] === 'onboarding-bucket' || segments[0] === 'onboarding-bank';

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

  if (!session && !onAuthScreen) {
    return <Redirect href="/onboarding-auth" />;
  }

  if (session && segments[0] === 'onboarding-auth') {
    if (bucketsLoading) return null; // wait for buckets to load before deciding
    return <Redirect href={hasCompletedOnboarding ? '/' : '/onboarding-bucket'} />;
  }

  if (session && !hasCompletedOnboarding && !bucketsLoading && !onAuthScreen) {
    return <Redirect href="/onboarding-bucket" />;
  }

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="bucket/[id]"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="onboarding-auth" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding-bucket" />
        <Stack.Screen name="onboarding-bank" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="more-actions"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 30,
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
          name="refresh-balance"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="virtual-card"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="linked-account"
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
          name="transaction-history"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="statements"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="connect-bank"
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
          name="personal-info"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="identity-verification"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="notification-preferences"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="security"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="custom-color"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="feedback"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="legal"
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
          name="card-actions"
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
    </ThemeProvider>
  );
}
