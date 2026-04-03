import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Coffee, TShirt, FilmStrip, ForkKnife } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { VisaLogo } from '@/components/shared/visa-logo';
import { ZumaLogo } from '@/components/shared/zuma-logo';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth/get-user-id';

const WAITLIST_TABLE = 'spend_bucket_waitlist';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W - 40;

const EXAMPLES = [
  {
    name: 'Coffee Time',
    icon: Coffee,
    budget: 5000,
    spent: 2750,
    color: '#6EDCB4',
    cardText: '#0D3028',
  },
  {
    name: 'Clothing',
    icon: TShirt,
    budget: 8000,
    spent: 4200,
    color: '#C4B1F0',
    cardText: '#2A1F3D',
  },
  {
    name: 'Streaming',
    icon: FilmStrip,
    budget: 3500,
    spent: 1599,
    color: '#FF6B6B',
    cardText: '#3D1219',
  },
  {
    name: 'Eating Out',
    icon: ForkKnife,
    budget: 15000,
    spent: 5340,
    color: '#F5C842',
    cardText: '#3D2E0A',
  },
];

const BENEFITS = [
  {
    icon: Coffee,
    title: 'Budget your favorites',
    description: 'Set a monthly limit for coffee, food, subscriptions, and anything you spend on regularly.',
  },
  {
    icon: TShirt,
    title: 'Card active from day one',
    description: 'Get a virtual card instantly. No saving required, just set your budget and start spending.',
  },
  {
    icon: FilmStrip,
    title: 'Auto-renews monthly',
    description: 'Your budget resets every month. When it runs out, spending stops. No surprises.',
  },
];

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function ExampleCard({ name, icon: Icon, budget, color, cardText }: typeof EXAMPLES[number]) {
  return (
    <View style={[cardStyles.card, { backgroundColor: color }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'transparent', 'rgba(0,0,0,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={cardStyles.top}>
        <View style={cardStyles.iconCircle}>
          <Icon size={24} color={cardText} weight="fill" />
        </View>
        <ZumaLogo width={80} height={30} color={cardText} />
      </View>
      <View style={cardStyles.bottom}>
        <View>
          <Text style={[cardStyles.name, { color: cardText }]} numberOfLines={1}>{name}</Text>
          <Text style={[cardStyles.sub, { color: cardText }]}>{formatDollars(budget)}/mo</Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color={cardText} />
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1.586,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    maxWidth: 180,
  },
  sub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    opacity: 0.6,
    marginTop: 2,
  },
});

export default function SpendBucketScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const lastCardRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const userId = getCurrentUserId();
        const { data } = await supabase
          .from(WAITLIST_TABLE)
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (data) setOnWaitlist(true);
      } catch {}
    })();
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
    if (page !== lastCardRef.current) {
      lastCardRef.current = page;
      setActiveCard(page);
      Haptics.selectionAsync();
    }
  };

  const handleJoinWaitlist = async () => {
    if (onWaitlist || joining) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoining(true);
    try {
      const userId = getCurrentUserId();
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      await supabase
        .from(WAITLIST_TABLE)
        .upsert({
          user_id: userId,
          email: profile?.email ?? null,
        }, { onConflict: 'user_id' });

      setOnWaitlist(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      alert(err.message ?? 'Failed to join waitlist');
    } finally {
      setJoining(false);
    }
  };

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

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Spend buckets</Text>

        <View style={styles.cardSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.cardScroll}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
          >
            {EXAMPLES.map((example, i) => (
              <View key={example.name} style={i < EXAMPLES.length - 1 ? { marginRight: 16 } : undefined}>
                <ExampleCard {...example} />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {EXAMPLES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: textColor, opacity: i === activeCard ? 1 : 0.2 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <View key={benefit.title} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: surfaceColor }]}>
                  <Icon size={22} color={textColor} weight="fill" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={[styles.benefitTitle, { color: textColor }]}>{benefit.title}</Text>
                  <Text style={[styles.benefitDesc, { color: secondaryColor }]}>{benefit.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={handleJoinWaitlist}
          disabled={onWaitlist || joining}
          style={[
            styles.waitlistButton,
            { backgroundColor: onWaitlist ? surfaceColor : textColor },
          ]}
        >
          <Text style={[styles.waitlistText, { color: onWaitlist ? secondaryColor : bgColor }]}>
            {onWaitlist ? 'You\'re on the waitlist' : joining ? 'Joining...' : 'Join waitlist for spend buckets'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 36,
    letterSpacing: 36 * -0.05,
    marginTop: 8,
    marginBottom: 24,
  },
  cardSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  cardScroll: {
    width: CARD_WIDTH,
    overflow: 'visible',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  benefits: {
    gap: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    gap: 4,
  },
  benefitTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  benefitDesc: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  waitlistButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitlistText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
