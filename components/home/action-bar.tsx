import { StyleSheet, View } from 'react-native';
import { PaintBucket, ArrowsLeftRight, Repeat, User } from 'phosphor-react-native';

import { ActionButton } from './action-button';

type ActionBarProps = {
  onNewBucket: () => void;
  onMoveFunds: () => void;
  onAutoDeposit: () => void;
  onAccount: () => void;
};

export function ActionBar({
  onNewBucket,
  onMoveFunds,
  onAutoDeposit,
  onAccount,
}: ActionBarProps) {
  return (
    <View style={styles.container}>
      <ActionButton icon={PaintBucket} label="New bucket" onPress={onNewBucket} />
      <ActionButton icon={ArrowsLeftRight} label="Move funds" onPress={onMoveFunds} />
      <ActionButton icon={Repeat} label="Auto-deposit" onPress={onAutoDeposit} />
      <ActionButton icon={User} label="Account" onPress={onAccount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
});
