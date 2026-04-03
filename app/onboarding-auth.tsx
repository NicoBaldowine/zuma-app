import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import Svg, { Path } from 'react-native-svg';

import { Fonts } from '@/constants/theme';
import { signInWithGoogle } from '@/lib/auth/google';

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z" />
      <Path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z" />
      <Path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z" />
      <Path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z" />
    </Svg>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingAuthScreen() {
  const router = useRouter();
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
    <View style={styles.root}>
      <Video
        source={require('@/assets/videos/splashvideo.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.topSection}>
          <Animated.Image
            entering={FadeInDown.duration(500).easing(Easing.out(Easing.cubic))}
            source={require('@/assets/images/zumalogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animated.Text
            entering={FadeInDown.duration(500).delay(100).easing(Easing.out(Easing.cubic))}
            style={styles.tagline}
          >
            Your modern saving account
          </Animated.Text>
        </View>

        <View style={styles.bottomSection}>
          <Animated.View
            entering={FadeInDown.duration(400).delay(250).easing(Easing.out(Easing.cubic))}
          >
            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(400).delay(350).easing(Easing.out(Easing.cubic))}
          >
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={signingIn}
              style={[styles.socialButton, { opacity: signingIn ? 0.7 : 1 }]}
            >
              {signingIn ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <GoogleLogo size={20} />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 60,
  },
  tagline: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    marginTop: 8,
    letterSpacing: 18 * -0.03,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#000000',
  },
  terms: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
    color: 'rgba(255,255,255,0.75)',
  },
});
