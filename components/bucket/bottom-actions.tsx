import { StyleSheet, View, Pressable, Text } from 'react-native';

import { Fonts } from '@/constants/theme';

type BottomActionsProps = {
  onMore: () => void;
  onAddFunds: () => void;
  accentColor: string;
  accentTextColor: string;
};

export function BottomActions({
  onMore,
  onAddFunds,
  accentColor,
  accentTextColor,
}: BottomActionsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMore}
        style={[styles.button, styles.moreButton]}
      >
        <Text style={[styles.buttonText, { color: 'rgba(255,255,255,0.8)' }]}>More</Text>
      </Pressable>

      <Pressable
        onPress={onAddFunds}
        style={[styles.button, { backgroundColor: accentColor }]}
      >
        <Text style={[styles.buttonText, { color: accentTextColor }]}>
          Add funds
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
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
