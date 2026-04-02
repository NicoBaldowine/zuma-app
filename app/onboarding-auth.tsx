import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { signInWithGoogle } from '@/lib/auth/google';

export default function OnboardingAuthScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (_err) {
      // Auth state change handles navigation
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topSection}>
        <Animated.Text
          entering={FadeInDown.duration(500).easing(Easing.out(Easing.cubic))}
          style={[styles.logo, { color: textColor }]}
        >
          Zuma
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(100).easing(Easing.out(Easing.cubic))}
          style={[styles.tagline, { color: secondaryColor }]}
        >
          Your visual savings wallet
        </Animated.Text>
      </View>

      <View style={styles.bottomSection}>
        <Animated.View
          entering={FadeInDown.duration(400).delay(250).easing(Easing.out(Easing.cubic))}
        >
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={signingIn}
            style={[styles.socialButton, { backgroundColor: textColor, opacity: signingIn ? 0.7 : 1 }]}
          >
            {signingIn ? (
              <ActivityIndicator color={bgColor} />
            ) : (
              <>
                <Text style={[styles.socialIcon, { color: bgColor }]}>G</Text>
                <Text style={[styles.socialButtonText, { color: bgColor }]}>Continue with Google</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(350).easing(Easing.out(Easing.cubic))}
        >
          <Text style={[styles.terms, { color: secondaryColor }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>

        {/* Temporary: skip auth for development */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(450).easing(Easing.out(Easing.cubic))}
        >
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/onboarding-bucket'); }}
            style={styles.tempButton}
          >
            <Text style={[styles.tempButtonText, { color: secondaryColor }]}>Continue without auth (dev)</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    fontFamily: Fonts.bold,
    letterSpacing: 56 * -0.05,
  },
  tagline: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    marginTop: 8,
    letterSpacing: 18 * -0.03,
  },
  bottomSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  socialButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialIcon: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  terms: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  tempButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tempButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});
