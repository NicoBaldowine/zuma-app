import { StyleSheet, View } from 'react-native';
import { PaintBucket, PlusCircle, User, DotsThreeOutline } from 'phosphor-react-native';

import { ActionButton } from './action-button';

type ActionBarProps = {
  onNewBucket: () => void;
  onAddFunds: () => void;
  onAccount: () => void;
  onMore: () => void;
};

export function ActionBar({
  onNewBucket,
  onAddFunds,
  onAccount,
  onMore,
}: ActionBarProps) {
  return (
    <View style={styles.container}>
      <ActionButton icon={PaintBucket} label="New bucket" onPress={onNewBucket} />
      <ActionButton icon={PlusCircle} label="Add funds" onPress={onAddFunds} />
      <ActionButton icon={User} label="Account" onPress={onAccount} />
      <ActionButton icon={DotsThreeOutline} label="More" onPress={onMore} />
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
