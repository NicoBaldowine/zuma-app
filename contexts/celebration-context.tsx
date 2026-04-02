import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Fonts } from '@/constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#F0B27A', '#82E0AA', '#F1948A', '#85C1E9', '#F8C471',
];
const CONFETTI_COUNT = 35;

type CelebrationContextValue = {
  celebrate: (bucketName: string) => void;
  showToast: (message: string) => void;
};

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

const ConfettiPiece = React.memo(function ConfettiPiece({ index, active }: { index: number; active: boolean }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = Math.random() * SCREEN_W;
  const endX = startX + (Math.random() - 0.5) * 200;
  const duration = 1800 + Math.random() * 1200;
  const delay = Math.random() * 400;
  const size = 6 + Math.random() * 6;
  const isRound = Math.random() > 0.5;

  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (active) {
      opacity.value = withDelay(delay, withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(duration - 400, withTiming(0, { duration: 400 })),
      ));
      translateY.value = withDelay(delay, withTiming(SCREEN_H + 50, {
        duration,
        easing: Easing.out(Easing.quad),
      }));
      translateX.value = withDelay(delay, withTiming(endX, {
        duration,
        easing: Easing.inOut(Easing.sin),
      }));
      rotate.value = withDelay(delay, withTiming(360 * (2 + Math.random() * 3), {
        duration,
      }));
    } else {
      translateY.value = -20;
      translateX.value = startX;
      opacity.value = 0;
      rotate.value = 0;
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: isRound ? size : size * 1.6,
          borderRadius: isRound ? size / 2 : 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
});

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(-20, { duration: 250 });
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: insets.top + 8, backgroundColor: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)' },
        style,
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.toastText, { color: isDark ? '#000000' : '#FFFFFF' }]}>{message}</Text>
    </Animated.View>
  );
}

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrate = useCallback((bucketName: string) => {
    setActive(true);
    setToastMessage(`${bucketName} completed!`);
    setToastVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);

    setTimeout(() => {
      setActive(false);
    }, 3500);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate, showToast }}>
      {children}
      {active && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <ConfettiPiece key={i} index={i} active={active} />
          ))}
        </View>
      )}
      <Toast message={toastMessage} visible={toastVisible} />
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider');
  return ctx;
}

const styles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  toast: {
    position: 'absolute',
    left: 40,
    right: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    zIndex: 10000,
  },
  toastText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
});
