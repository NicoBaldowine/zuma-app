import { StyleSheet, View, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { Fonts } from '@/constants/theme';

type BottomActionsProps = {
  onMore: () => void;
  onPrimary: () => void;
  accentColor: string;
  accentTextColor: string;
  primaryLabel?: string;
};

export function BottomActions({
  onMore,
  onPrimary,
  accentColor,
  accentTextColor,
  primaryLabel = 'Add funds',
}: BottomActionsProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.button, styles.moreButton]}>
        <BlurView
          intensity={60}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.moreBlur}
        >
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMore(); }}
            style={styles.moreInner}
          >
            <Text style={[styles.buttonText, { color: 'rgba(255,255,255,0.8)' }]}>More</Text>
          </Pressable>
        </BlurView>
      </View>

      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPrimary(); }}
        style={[styles.button, { backgroundColor: accentColor }]}
      >
        <Text style={[styles.buttonText, { color: accentTextColor }]}>
          {primaryLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  moreBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  moreInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
