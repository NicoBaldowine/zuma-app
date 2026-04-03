import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { getCurrentUserId } from './auth/get-user-id';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permissions, get Expo push token, and save to Supabase.
 * Returns the token string or null if registration fails.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push only works on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // Check / request permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get Expo push token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn('No EAS projectId found — push token registration skipped');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  // Save to Supabase
  try {
    const userId = getCurrentUserId();
    await (supabase.from as any)('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        device_type: Platform.OS,
      },
      { onConflict: 'user_id,expo_push_token' },
    );
  } catch (err) {
    console.warn('Failed to save push token:', err);
  }

  return token;
}

/**
 * Remove push token from Supabase (e.g. on logout).
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const userId = getCurrentUserId();
    await (supabase.from as any)('push_tokens')
      .delete()
      .eq('user_id', userId);
  } catch {}
}
