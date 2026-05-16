import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  LayoutChangeEvent,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Wrapper from '../../components/Wrapper';
import CustomText from '../../components/CustomText';
import { Colors } from '../../utils/Colors';
import { Images } from '../../utils/Images';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { rf, rh, rw } from '../../utils/responsive';
import { useLanguageModalStore } from '../../stores/languageModalStore';
import Login from './Login';
import Register from './Register';

// Suit config: symbol + color
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const SUIT_COLORS = [Colors.WHITE, '#E84545', Colors.WHITE, '#E84545'] as const;
// Stagger offset between consecutive suits (ms)
const STAGGER = 320;
// Float distance in dp
const FLOAT_RANGE = 7;
// Full float cycle per direction (ms)
const FLOAT_DURATION = 1300;
// Scale range
const SCALE_MAX = 1.14;
const SCALE_MIN = 0.9;

const Authentication: React.FC = () => {
  const [authType, setAuthType] = useState<'Login' | 'Register'>('Login');
  const { top } = useSafeAreaInsets();
  const { openModal } = useLanguageModalStore();

  // ── Tab animation ──────────────────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
  };

  const handleToggle = (type: 'Login' | 'Register') => {
    setAuthType(type);
    translateX.value = withTiming(
      type === 'Register' ? containerWidth.value / 2 : 0,
      { duration: 250 },
    );
  };

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // ── Suit float shared values ───────────────────────────────────────────────
  // Defined individually — hooks cannot be inside loops.
  const float0 = useSharedValue(0);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  const scale0 = useSharedValue(1);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  // ── Animated styles ────────────────────────────────────────────────────────
  const suitStyle0 = useAnimatedStyle(() => ({
    transform: [{ translateY: float0.value }, { scale: scale0.value }],
  }));
  const suitStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }, { scale: scale1.value }],
  }));
  const suitStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }, { scale: scale2.value }],
  }));
  const suitStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }, { scale: scale3.value }],
  }));

  const suitAnimStyles = [suitStyle0, suitStyle1, suitStyle2, suitStyle3];

  // ── Start / stop on screen focus / blur ───────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      const floats = [float0, float1, float2, float3];
      const scales = [scale0, scale1, scale2, scale3];

      // Float: each suit oscillates -FLOAT_RANGE → +FLOAT_RANGE with
      // withRepeat reverse=true, so it plays forward then backward smoothly.
      floats.forEach((sv, i) => {
        sv.value = withDelay(
          i * STAGGER,
          withRepeat(
            withSequence(
              withTiming(-FLOAT_RANGE, {
                duration: FLOAT_DURATION,
                easing: Easing.inOut(Easing.sin),
              }),
              withTiming(FLOAT_RANGE, {
                duration: FLOAT_DURATION,
                easing: Easing.inOut(Easing.sin),
              }),
            ),
            -1,
            true, // reverse each cycle for seamless loop
          ),
        );
      });

      // Scale: breathe in/out in sync with the float stagger
      scales.forEach((sv, i) => {
        sv.value = withDelay(
          i * STAGGER,
          withRepeat(
            withSequence(
              withTiming(SCALE_MAX, {
                duration: FLOAT_DURATION,
                easing: Easing.inOut(Easing.sin),
              }),
              withTiming(SCALE_MIN, {
                duration: FLOAT_DURATION,
                easing: Easing.inOut(Easing.sin),
              }),
            ),
            -1,
            true,
          ),
        );
      });

      // Stop all animations when the screen loses focus
      return () => {
        [...floats, ...scales].forEach(cancelAnimation);
      };
    }, []),
  );

  return (
    <Wrapper>
      {/* ── Deep space gradient background ── */}
      <LinearGradient
        colors={['#07010F', '#110226', '#1B0535', '#25095E', '#1B0535', '#0D0120']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Corner watermark cards ── */}
      <Image
        source={Images.SPADE_CARD}
        style={styles.watermarkTopLeft}
        resizeMode="contain"
      />
      <Image
        source={Images.HEART_CARD}
        style={styles.watermarkBottomRight}
        resizeMode="contain"
      />

      {/* ── Language button ── */}
      <TouchableOpacity
        onPress={openModal}
        style={[styles.langBtn, { top: top + 12 }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image source={Images.LANGUAGE} style={styles.langIcon} resizeMode="contain" />
      </TouchableOpacity>

      {/* ── Branding ── */}
      <View style={[styles.brandSection, { paddingTop: top + rh(5.5) }]}>
        <View style={styles.suitsRow}>
          {SUITS.map((suit, i) => (
            <Animated.View key={suit} style={suitAnimStyles[i]}>
              <CustomText style={[styles.suitChar, { color: SUIT_COLORS[i] }]}>
                {suit}
              </CustomText>
            </Animated.View>
          ))}
        </View>

        <CustomText style={styles.appName}>CARD BAZAR</CustomText>
      </View>

      {/* ── Animated pill tab selector ── */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabTrack} onLayout={onLayout}>
          {/* Sliding gradient pill */}
          <Animated.View style={[styles.tabPill, animatedPillStyle]}>
            <LinearGradient
              colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleToggle('Login')}
            activeOpacity={0.85}
          >
            <CustomText
              style={authType === 'Login' ? [styles.tabText, styles.tabTextActive] : styles.tabText}
            >
              Login
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleToggle('Register')}
            activeOpacity={0.85}
          >
            <CustomText
              style={authType === 'Register' ? [styles.tabText, styles.tabTextActive] : styles.tabText}
            >
              Register
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Form area ── */}
      <View style={styles.formArea}>
        {authType === 'Login' && <Login />}
        {authType === 'Register' && <Register />}
      </View>
    </Wrapper>
  );
};

export default Authentication;

const styles = StyleSheet.create({
  // ─── Watermarks ──────────────────────────────────────────────────────────────
  watermarkTopLeft: {
    position: 'absolute',
    top: rh(-1),
    left: rw(-10),
    width: rw(60),
    height: rw(60),
    opacity: 0.045,
    tintColor: Colors.GOLD,
    transform: [{ rotate: '-20deg' }],
  },
  watermarkBottomRight: {
    position: 'absolute',
    bottom: rh(-1),
    right: rw(-10),
    width: rw(60),
    height: rw(60),
    opacity: 0.045,
    tintColor: '#E84545',
    transform: [{ rotate: '20deg' }],
  },

  // ─── Language ─────────────────────────────────────────────────────────────────
  langBtn: {
    position: 'absolute',
    right: rw(4),
    zIndex: 10,
  },
  langIcon: {
    width: rw(7),
    height: rw(7),
    tintColor: Colors.WHITE,
  },

  // ─── Branding ─────────────────────────────────────────────────────────────────
  brandSection: {
    alignItems: 'center',
    paddingBottom: rh(3),
  },
  suitsRow: {
    flexDirection: 'row',
    gap: rw(4),
    marginBottom: rh(0.6),
    alignItems: 'center',
  },
  suitChar: {
    fontSize: rf(6.5),
    fontFamily: FontFamilyWithWeight[900],
  },
  appName: {
    color: Colors.GOLD,
    fontSize: rf(7.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 5,
    textShadowColor: 'rgba(255,215,0,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  brandRule: {
    width: rw(42),
    height: 1,
    marginVertical: rh(0.7),
    opacity: 0.75,
  },
  tagline: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.5,
  },

  // ─── Segmented control ────────────────────────────────────────────────────────
  tabWrapper: {
    paddingHorizontal: rw(10),
    marginBottom: rh(1.5),
  },
  tabTrack: {
    flexDirection: 'row',
    height: rh(5.5),
    borderRadius: rh(5.5),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  tabPill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    borderRadius: rh(5.5),
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: rf(4),
    fontWeight:"bold",
    color: Colors.WHITE_55,
  },
  tabTextActive: {
    color: Colors.DARK_BROWN,
  },

  // ─── Form ─────────────────────────────────────────────────────────────────────
  formArea: {
    flex: 1,
  },
});
