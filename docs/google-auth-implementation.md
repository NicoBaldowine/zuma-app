# Google Auth Implementation Guide (Expo + Supabase)

Reference implementation from Zuma app. Copy this pattern for any Expo Router + Supabase project.

---

## Architecture Overview

```
User taps "Continue with Google"
  → signInWithGoogle() calls Supabase OAuth
  → expo-web-browser opens Google login
  → User authenticates
  → OAuth redirect returns tokens in URL fragment
  → Tokens stored in Supabase session (AsyncStorage)
  → AuthProvider detects session change via onAuthStateChange
  → Navigation guards redirect to appropriate screen
```

**Key**: Google OAuth credentials (Client ID/Secret) are configured in **Supabase Dashboard** (Authentication > Providers > Google), NOT in app code. The app never touches Google credentials directly.

---

## 1. Dependencies

```json
{
  "@supabase/supabase-js": "^2.101.1",
  "expo-auth-session": "~7.0.10",
  "expo-web-browser": "~15.0.10",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

---

## 2. Supabase Client (`lib/supabase.ts`)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // important for React Native
  },
});
```

---

## 3. Google Sign-In Function (`lib/auth/google.ts`)

```typescript
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = AuthSession.makeRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const fragment = new URLSearchParams(result.url.split('#')[1]);
    const accessToken = fragment.get('access_token');
    const refreshToken = fragment.get('refresh_token');

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }
}
```

**Why this works:**
- `skipBrowserRedirect: true` — prevents Supabase from auto-redirecting (we handle it manually)
- `makeRedirectUri()` — generates the correct deep link for your app scheme (e.g. `zumaapp://`)
- Tokens come back in the URL **fragment** (`#`), not query params (`?`)
- `setSession()` stores the tokens and triggers `onAuthStateChange`

---

## 4. Auth Context (`contexts/auth-context.tsx`)

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## 5. Navigation Guards (`app/_layout.tsx`)

```typescript
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutGuard />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutGuard() {
  const { loading } = useAuth();
  if (loading) return null; // wait for session restore
  return <RootLayoutInner />;
}

function RootLayoutInner() {
  const { session } = useAuth();
  const segments = useSegments();

  const onAuthScreen = segments[0] === 'onboarding-auth';

  // Not logged in → force to auth screen
  if (!session && !onAuthScreen) {
    return <Redirect href="/onboarding-auth" />;
  }

  // Logged in but still on auth screen → go to app
  if (session && onAuthScreen) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="onboarding-auth"
        options={{ gestureEnabled: false }} // prevent swipe back
      />
    </Stack>
  );
}
```

**Key pattern**: `loading` state prevents flash of wrong screen on app launch. The guard checks session and redirects accordingly. No manual navigation needed after sign-in — `onAuthStateChange` updates session, which triggers re-render and redirect.

---

## 6. Login Screen (`app/onboarding-auth.tsx`)

```typescript
import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { signInWithGoogle } from '@/lib/auth/google';

export default function OnboardingAuthScreen() {
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (_err) {
      // Auth state change handles navigation automatically
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View>
      {/* Your branding/logo here */}

      <Pressable onPress={handleGoogleSignIn} disabled={signingIn}>
        {signingIn ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text>Continue with Google</Text>
        )}
      </Pressable>

      <Text>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}
```

---

## 7. Account / Personal Info Screen

Super simple — just read-only display since Google manages the credentials:

```typescript
export default function PersonalInfoScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  return (
    <View>
      {/* Google connection badge */}
      <View>
        <GoogleLogo />
        <Text>Connected with Google</Text>
        <Text>Your name and email are managed by your Google account</Text>
      </View>

      {/* Read-only fields */}
      <Text>Name: {profile?.fullName ?? 'Not added'}</Text>
      <Text>Email: {profile?.email ?? 'Not added'}</Text>

      {/* Sign out */}
      <Pressable onPress={signOut}>
        <Text>Log Out</Text>
      </Pressable>
    </View>
  );
}
```

---

## 8. Database Schema (profiles table)

```sql
create table if not exists profiles (
  id            uuid primary key,  -- references auth.users(id)
  full_name     text,
  email         text,
  phone         text,
  date_of_birth date,
  avatar_url    text,
  auth_provider text,              -- 'google'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

The `id` matches `auth.users.id` from Supabase Auth. Profile is created when the user first signs in (you can use a Supabase trigger or create it on first app load).

---

## 9. User ID Helper (`lib/auth/get-user-id.ts`)

```typescript
let _cachedUserId: string | null = null;

export function setCurrentUserId(id: string | null) {
  _cachedUserId = id;
}

export function getCurrentUserId(): string {
  if (!_cachedUserId) throw new Error('Not authenticated');
  return _cachedUserId;
}
```

Set this in the AuthProvider when session changes:
```typescript
setCurrentUserId(session?.user?.id ?? null);
```

Then use `getCurrentUserId()` in any API function without passing userId as a parameter.

---

## 10. Supabase Dashboard Setup

1. Go to **Authentication > Providers > Google**
2. Enable Google provider
3. Add your **Google Client ID** and **Client Secret** (from Google Cloud Console)
4. In Google Cloud Console, set the **authorized redirect URI** to:
   `https://<your-project>.supabase.co/auth/v1/callback`
5. Add your app's deep link scheme to **Redirect URLs** in Supabase Auth settings:
   `zumaapp://` (or whatever your scheme is in `app.json`)

### app.json requirements

```json
{
  "expo": {
    "scheme": "yourappscheme"
  }
}
```

This scheme is what `makeRedirectUri()` uses to generate the callback URL.

---

## Quick Checklist

- [ ] Install deps: `@supabase/supabase-js`, `expo-auth-session`, `expo-web-browser`, `@react-native-async-storage/async-storage`
- [ ] Set `scheme` in `app.json`
- [ ] Configure Google provider in Supabase Dashboard
- [ ] Add redirect URL in Supabase Auth settings
- [ ] Create `lib/supabase.ts` with AsyncStorage config
- [ ] Create `lib/auth/google.ts` with `signInWithGoogle()`
- [ ] Create `contexts/auth-context.tsx` with AuthProvider
- [ ] Wrap app in `<AuthProvider>` in `_layout.tsx`
- [ ] Add navigation guards based on `session` state
- [ ] Create login screen with Google button
- [ ] Create `profiles` table in Supabase
- [ ] Done — no password management, no email verification, pure OAuth
