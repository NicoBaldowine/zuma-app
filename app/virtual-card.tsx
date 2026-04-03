import { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, ShieldCheck, Snowflake, AppleLogo } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fonts } from '@/constants/theme';
import { getBucketPalette } from '@/constants/bucket-colors';
import { getBucketIcon } from '@/utils/bucket-icons';
import { formatCurrency } from '@/utils/format';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { useBuckets } from '@/contexts/buckets-context';
import { VisaLogo } from '@/components/shared/visa-logo';
import { ZumaLogo } from '@/components/shared/zuma-logo';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth/get-user-id';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W - 40;

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Disposable & secure',
    description: 'Single-use card that expires after your purchase. Your real account stays safe.',
  },
  {
    icon: Snowflake,
    title: 'Freeze anytime',
    description: 'Instantly freeze your card if you change your mind before using it.',
  },
  {
    icon: AppleLogo,
    title: 'Works with Apple Pay',
    description: 'Add your Zuma card to Apple Wallet and pay anywhere with a tap.',
  },
];

type CardProps = {
  bucketName: string;
  bucketIcon: string;
  bucketIconType: 'icon' | 'emoji' | 'pixel';
  amount: number;
  mainColor: string;
  darkColor: string;
  lightColor: string;
  cardTextColor: string;
  darkTextColor: string;
};

/* ─── Design 1: Classic ─── */
function CardClassic({ bucketName, bucketIcon, bucketIconType, amount, mainColor, cardTextColor }: CardProps) {
  const BucketIcon = bucketIconType === 'icon' ? getBucketIcon(bucketIcon) : null;

  return (
    <View style={[cardStyles.card, { backgroundColor: mainColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'transparent', 'rgba(0,0,0,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
      />
      <View style={cardStyles.top}>
        <View style={cardStyles.iconCircle}>
          {bucketIconType === 'pixel' ? (
            <PixelIcon data={JSON.parse(bucketIcon)} size={22} color={cardTextColor} />
          ) : bucketIconType === 'emoji' ? (
            <Text style={{ fontSize: 22 }}>{bucketIcon}</Text>
          ) : (
            BucketIcon && <BucketIcon size={24} color={cardTextColor} weight="fill" />
          )}
        </View>
        <ZumaLogo width={80} height={30} color={cardTextColor} />
      </View>
      <View style={cardStyles.bottom}>
        <View>
          <Text style={[cardStyles.name, { color: cardTextColor }]} numberOfLines={1}>{bucketName}</Text>
          <Text style={[cardStyles.sub, { color: cardTextColor }]}>{formatCurrency(amount)}</Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color={cardTextColor} />
        </View>
      </View>
    </View>
  );
}

/* ─── Design 2: Dark Inverted ─── */
function CardDark({ bucketName, bucketIcon, bucketIconType, amount, mainColor, darkColor, lightColor }: CardProps) {
  const BucketIcon = bucketIconType === 'icon' ? getBucketIcon(bucketIcon) : null;

  return (
    <View style={[cardStyles.card, { backgroundColor: darkColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'transparent', 'rgba(0,0,0,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={cardStyles.top}>
        <View style={[cardStyles.iconCircle, { backgroundColor: `${mainColor}30` }]}>
          {bucketIconType === 'pixel' ? (
            <PixelIcon data={JSON.parse(bucketIcon)} size={22} color={mainColor} />
          ) : bucketIconType === 'emoji' ? (
            <Text style={{ fontSize: 22 }}>{bucketIcon}</Text>
          ) : (
            BucketIcon && <BucketIcon size={24} color={mainColor} weight="fill" />
          )}
        </View>
        <ZumaLogo width={80} height={30} color={lightColor} />
      </View>
      <View style={cardStyles.bottom}>
        <View>
          <Text style={[cardStyles.name, { color: lightColor }]} numberOfLines={1}>{bucketName}</Text>
          <Text style={[cardStyles.sub, { color: lightColor }]}>{formatCurrency(amount)}</Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color={lightColor} />
        </View>
      </View>
    </View>
  );
}

/* ─── Design 3: Light Pattern ─── */
function CardPattern({ bucketName, bucketIcon, bucketIconType, amount, mainColor, darkColor, lightColor }: CardProps) {
  const BucketIcon = bucketIconType === 'icon' ? getBucketIcon(bucketIcon) : null;

  const patternIcons = useMemo(() => {
    const cols = 8;
    const rows = 6;
    const items = [];
    for (let i = 0; i < cols * rows; i++) {
      items.push(i);
    }
    return items;
  }, []);

  return (
    <View style={[cardStyles.card, { backgroundColor: lightColor }]}>
      {/* Pattern background */}
      <View style={cardStyles.patternGrid}>
        {patternIcons.map((i) => (
          <View key={i} style={cardStyles.patternCell}>
            {bucketIconType === 'pixel' ? (
              <View style={{ opacity: 0.1 }}><PixelIcon data={JSON.parse(bucketIcon)} size={20} color={darkColor} /></View>
            ) : bucketIconType === 'emoji' ? (
              <Text style={{ fontSize: 20, opacity: 0.1 }}>{bucketIcon}</Text>
            ) : (
              BucketIcon && <BucketIcon size={20} color={darkColor} weight="fill" style={{ opacity: 0.08 }} />
            )}
          </View>
        ))}
      </View>

      <View style={cardStyles.top}>
        <ZumaLogo width={80} height={30} color={darkColor} />
        <View style={[cardStyles.iconCircle, { backgroundColor: `${darkColor}15` }]}>
          {bucketIconType === 'pixel' ? (
            <PixelIcon data={JSON.parse(bucketIcon)} size={22} color={mainColor} />
          ) : bucketIconType === 'emoji' ? (
            <Text style={{ fontSize: 22 }}>{bucketIcon}</Text>
          ) : (
            BucketIcon && <BucketIcon size={24} color={mainColor} weight="fill" />
          )}
        </View>
      </View>
      <View style={cardStyles.bottom}>
        <View>
          <Text style={[cardStyles.patternName, { color: darkColor }]} numberOfLines={1}>{bucketName}</Text>
          <Text style={[cardStyles.sub, { color: darkColor }]}>{formatCurrency(amount)}</Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color={darkColor} />
        </View>
      </View>
    </View>
  );
}

/* ─── Design 4: Minimal White ─── */
function CardMinimal({ bucketName, bucketIcon, bucketIconType, amount, mainColor }: CardProps) {
  const BucketIcon = bucketIconType === 'icon' ? getBucketIcon(bucketIcon) : null;

  return (
    <View style={[cardStyles.card, { backgroundColor: '#FFFFFF' }]}>
      <LinearGradient
        colors={['#F0F0F0', '#FFFFFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Centered big icon */}
      <View style={cardStyles.minimalCenter}>
        {bucketIconType === 'pixel' ? (
          <PixelIcon data={JSON.parse(bucketIcon)} size={80} color={mainColor} />
        ) : bucketIconType === 'emoji' ? (
          <Text style={{ fontSize: 80 }}>{bucketIcon}</Text>
        ) : (
          BucketIcon && <BucketIcon size={80} color={mainColor} weight="fill" />
        )}
      </View>

      <View style={cardStyles.minimalBottom}>
        <View>
          <Text style={[cardStyles.minimalName, { color: '#1A1A1A' }]} numberOfLines={2}>
            {bucketName}
          </Text>
          <Text style={[cardStyles.minimalAmount, { color: '#1A1A1A' }]}>
            {formatCurrency(amount)}
          </Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color="#1A1A1A" />
        </View>
      </View>
    </View>
  );
}

/* ─── Design 5: Minimal Color ─── */
function CardMinimalColor({ bucketName, bucketIcon, bucketIconType, amount, mainColor, cardTextColor }: CardProps) {
  const BucketIcon = bucketIconType === 'icon' ? getBucketIcon(bucketIcon) : null;

  return (
    <View style={[cardStyles.card, { backgroundColor: mainColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'transparent', 'rgba(0,0,0,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Centered big icon */}
      <View style={cardStyles.minimalCenter}>
        {bucketIconType === 'pixel' ? (
          <PixelIcon data={JSON.parse(bucketIcon)} size={80} color={cardTextColor} />
        ) : bucketIconType === 'emoji' ? (
          <Text style={{ fontSize: 80 }}>{bucketIcon}</Text>
        ) : (
          BucketIcon && <BucketIcon size={80} color={cardTextColor} weight="fill" />
        )}
      </View>

      <View style={cardStyles.minimalBottom}>
        <View>
          <Text style={[cardStyles.minimalName, { color: cardTextColor }]} numberOfLines={2}>
            {bucketName}
          </Text>
          <Text style={[cardStyles.minimalAmount, { color: cardTextColor }]}>
            {formatCurrency(amount)}
          </Text>
        </View>
        <View style={{ marginBottom: -8 }}>
          <VisaLogo width={48} height={48} color={cardTextColor} />
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
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  patternName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    letterSpacing: 28 * -0.04,
    maxWidth: CARD_WIDTH * 0.6,
  },
  patternAmount: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    letterSpacing: 24 * -0.04,
  },
  patternGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  patternCell: {
    width: CARD_WIDTH / 8,
    height: CARD_WIDTH / 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minimalName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    maxWidth: CARD_WIDTH * 0.55,
  },
  minimalAmount: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    opacity: 0.5,
    marginTop: 2,
  },
});

/* ─── Main Screen ─── */

export default function VirtualCardScreen() {
  const router = useRouter();
  const { bucketId } = useLocalSearchParams<{ bucketId: string }>();
  const { buckets } = useBuckets();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const lastCardRef = useRef(0);

  const bucket = bucketId ? buckets.find((b) => b.id === bucketId) : null;
  const palette = bucket ? getBucketPalette(bucket.colorKey, colorScheme, bucket.customColor) : null;

  const cardProps: CardProps = {
    bucketName: bucket?.name ?? 'Zuma',
    bucketIcon: bucket?.icon ?? 'Wallet',
    bucketIconType: bucket?.iconType ?? 'icon',
    amount: bucket?.currentAmount ?? 0,
    mainColor: palette?.main ?? surfaceColor,
    darkColor: palette?.dark ?? '#1C1C1E',
    lightColor: palette?.light ?? '#F5F5F5',
    cardTextColor: palette?.cardText ?? textColor,
    darkTextColor: palette?.darkText ?? textColor,
  };

  useEffect(() => {
    (async () => {
      try {
        const userId = getCurrentUserId();
        const { data } = await supabase
          .from('card_waitlist')
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
        .from('card_waitlist')
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
        {/* Swipeable cards */}
        <View style={styles.cardSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.cardScroll}
            contentContainerStyle={styles.cardScrollContent}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
          >
            <View style={{ marginRight: 16 }}>
              <CardClassic {...cardProps} />
            </View>
            <View style={{ marginRight: 16 }}>
              <CardDark {...cardProps} />
            </View>
            <View style={{ marginRight: 16 }}>
              <CardMinimal {...cardProps} />
            </View>
            <CardMinimalColor {...cardProps} />
          </ScrollView>

          {/* Dots */}
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
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
            {onWaitlist ? 'You\'re on the waitlist' : joining ? 'Joining...' : 'Join waitlist for the card'}
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
  cardSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  cardScroll: {
    width: CARD_WIDTH,
    overflow: 'visible',
  },
  cardScrollContent: {
    // no extra padding — cards snap edge to edge
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
    // color set inline via textColor
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
