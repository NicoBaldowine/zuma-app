import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Bank, CreditCard, AppleLogo, CurrencyBtc, CaretRight } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

const methods = [
  { key: 'bank', label: 'Bank Account', sublabel: 'ACH transfer · 1-3 days', icon: Bank },
  { key: 'card', label: 'Credit or Debit Card', sublabel: 'Instant · fees may apply', icon: CreditCard },
  { key: 'apple', label: 'Apple Pay', sublabel: 'Instant', icon: AppleLogo },
  { key: 'crypto', label: 'Crypto', sublabel: 'BTC, ETH, USDC', icon: CurrencyBtc },
];

export default function AddFundsScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
        >
          <X size={18} color={secondaryColor} weight="bold" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: textColor }]}>Add funds</Text>

        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <Pressable
              key={method.key}
              onPress={() => {}}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: surfaceColor }]}>
                <Icon size={20} color={textColor} weight="fill" />
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.itemLabel, { color: textColor }]}>{method.label}</Text>
                <Text style={[styles.itemSublabel, { color: secondaryColor }]}>{method.sublabel}</Text>
              </View>
              <CaretRight size={16} color={secondaryColor} weight="bold" />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyClose: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    marginBottom: 32,
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  itemSublabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
});
