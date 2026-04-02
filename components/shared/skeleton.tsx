import { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const surface = useThemeColor({}, 'surface');
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 1]),
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: surface },
        animatedStyle,
        style,
      ]}
    />
  );
}
