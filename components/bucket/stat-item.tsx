import { StyleSheet, View, Text } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';

import { Fonts } from '@/constants/theme';

type StatItemProps = {
  label: string;
  value: string;
  textColor?: string;
  labelColor?: string;
  animateFrom?: number;
  animateTo?: number;
  formatFn?: (n: number) => string;
};

export function StatItem({
  label,
  value,
  textColor = '#FFFFFF',
  labelColor,
  animateFrom,
  animateTo,
  formatFn,
}: StatItemProps) {
  const shouldAnimate = animateFrom !== undefined && animateTo !== undefined && formatFn;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor ?? textColor, opacity: labelColor ? 1 : 0.6 }]}>
        {label}
      </Text>
      {shouldAnimate ? (
        <AnimatedCounter
          from={animateFrom}
          to={animateTo}
          formatFn={formatFn}
          textColor={textColor}
        />
      ) : (
        <Text style={[styles.value, { color: textColor }]}>
          {value}
        </Text>
      )}
    </View>
  );
}

function AnimatedCounter({
  from,
  to,
  formatFn,
  textColor,
}: {
  from: number;
  to: number;
  formatFn: (n: number) => string;
  textColor: string;
}) {
  const [display, setDisplay] = useState(formatFn(from));
  const progress = useSharedValue(from);

  const updateDisplay = (val: number) => {
    setDisplay(formatFn(Math.round(val)));
  };

  useAnimatedReaction(
    () => progress.value,
    (val) => {
      runOnJS(updateDisplay)(val);
    },
  );

  useEffect(() => {
    progress.value = withTiming(to, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [to]);

  return (
    <Text style={[styles.value, { color: textColor }]}>
      {display}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  value: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
