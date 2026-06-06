import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'
import LottieView from 'lottie-react-native'
import { Colors } from '../utils/Colors'
import CustomText from './CustomText'

const { width: SW, height: SH } = Dimensions.get('window')

const CARD_W = 90
const CARD_H = 130
const CARD_TOP = SH / 2 - CARD_H / 2 - 20
const CARD_LEFT = SW / 2 - CARD_W / 2

const FAN_DURATION = 700
const LOOP_COUNT = 2

const WINNER_BADGE_TOP = SH / 2 + CARD_H / 2 + 30

// Bottom edge of the winner card after it flies up (winnerY=-210) and scales to 1.2,
// plus a small gap — this is where the notif title sits.
const NOTIF_TITLE_TOP = CARD_TOP + Math.round(CARD_H * 1.1) - 210 + 16

// Fan spread — symmetrical, derived from Lottie analysis
const SPREADS = [
  { tx: -90, ty: 20, rot: -40 },
  { tx: -32, ty: 10, rot: -15 },
  { tx: 32, ty: 10, rot: 15 },
  { tx: 90, ty: 20, rot: 40 },
]

// Scatter destinations — each card flings to a different screen corner
const SCATTER = [
  { tx: -SW * 0.85, ty: SH * 0.55, rot: -110 },
  { tx: -SW * 0.65, ty: -SH * 0.65, rot: -75 },
  { tx: SW * 0.65, ty: -SH * 0.60, rot: 75 },
  { tx: SW * 0.85, ty: SH * 0.50, rot: 110 },
]

const CARD_IMAGES = [
  require('../assets/images/card1.png'),
  require('../assets/images/card2.png'),
  require('../assets/images/card3.png'),
  require('../assets/images/card4.png'),
]

const BALLOON_IMAGE = require('../assets/images/balloon.png')
const CELEBRATION_LOTTIE = require('../assets/lottie/celebration.json')

// 7 balloons — varied colours, x-positions, and sizes for depth
const BALLOON_TINTS = [Colors.GOLD, Colors.GREEN, Colors.ORANGE, '#E86900', '#FCD20D', '#0E9464', '#FFD540'] as const
const BALLOON_POSITIONS = [SW * 0.06, SW * 0.20, SW * 0.36, SW * 0.50, SW * 0.63, SW * 0.77, SW * 0.88] as const
const BALLOON_SIZES = [48, 42, 52, 44, 50, 40, 46] as const

export interface CardRevealModalProps {
  visible: boolean
  onClose: () => void
  /** 0 = card1.png  1 = card2.png  2 = card3.png  3 = card4.png */
  winnerIndex: 0 | 1 | 2 | 3
  /** Remote image URL shown as the winner card once the fan loop completes */
  winnerImage?: string
  /** How non-winner cards exit after the reveal. Default: 'fadeOut' */
  exitMode?: 'fadeOut' | 'scatter'
  /** Title from the push notification — shown prominently during card reveal */
  notifTitle?: string
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({
  visible,
  onClose,
  winnerIndex,
  winnerImage,
  exitMode = 'fadeOut',
  notifTitle,
}) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const lottieRef = useRef<LottieView>(null)

  // ── Core ──────────────────────────────────────────────────────────────────
  const fanProgress = useSharedValue(0)
  const winnerY = useSharedValue(0)
  const winnerScale = useSharedValue(1)
  const otherOp = useSharedValue(1)
  const labelOp = useSharedValue(0)
  const labelScale = useSharedValue(0.8)
  const winnerIdx = useSharedValue<number>(winnerIndex)
  const glowOrbOp = useSharedValue(1)
  const notifTitleOp = useSharedValue(0)
  const notifTitleY = useSharedValue(18)

  // ── Scatter (per-card, stay at 0 in fadeOut mode) ─────────────────────────
  const s0x = useSharedValue(0); const s0y = useSharedValue(0); const s0r = useSharedValue(0)
  const s1x = useSharedValue(0); const s1y = useSharedValue(0); const s1r = useSharedValue(0)
  const s2x = useSharedValue(0); const s2y = useSharedValue(0); const s2r = useSharedValue(0)
  const s3x = useSharedValue(0); const s3y = useSharedValue(0); const s3r = useSharedValue(0)

  // ── Balloons (7) ──────────────────────────────────────────────────────────
  const b0y = useSharedValue(0); const b0sway = useSharedValue(0)
  const b1y = useSharedValue(0); const b1sway = useSharedValue(0)
  const b2y = useSharedValue(0); const b2sway = useSharedValue(0)
  const b3y = useSharedValue(0); const b3sway = useSharedValue(0)
  const b4y = useSharedValue(0); const b4sway = useSharedValue(0)
  const b5y = useSharedValue(0); const b5sway = useSharedValue(0)
  const b6y = useSharedValue(0); const b6sway = useSharedValue(0)

  useEffect(() => { winnerIdx.value = winnerIndex }, [winnerIndex])

  // Prefetch the winner image during the fan loop so it's ready when isRevealed fires
  useEffect(() => {
    if (visible && winnerImage) {
      Image.prefetch(winnerImage).catch(() => {})
    }
  }, [visible, winnerImage])

  const getCardSource = (index: number): ImageSourcePropType =>
    isRevealed && winnerImage && index === winnerIndex
      ? { uri: winnerImage }
      : CARD_IMAGES[index]

  const cancelAll = useCallback(() => {
    ;[
      fanProgress, winnerY, winnerScale, otherOp, labelOp, labelScale, glowOrbOp,
      notifTitleOp, notifTitleY,
      s0x, s0y, s0r, s1x, s1y, s1r, s2x, s2y, s2r, s3x, s3y, s3r,
      b0y, b0sway, b1y, b1sway, b2y, b2sway,
      b3y, b3sway, b4y, b4sway, b5y, b5sway, b6y, b6sway,
    ].forEach(cancelAnimation)
  }, [])

  useEffect(() => () => cancelAll(), [])

  const onFanComplete = useCallback(() => setIsRevealed(true), [])

  // ── Phase 1 — fan loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      cancelAll()
      fanProgress.value = 0; winnerY.value = 0; winnerScale.value = 1
      otherOp.value = 1; labelOp.value = 0; labelScale.value = 0.8; glowOrbOp.value = 1
      notifTitleOp.value = 0; notifTitleY.value = 18
      s0x.value = 0; s0y.value = 0; s0r.value = 0
      s1x.value = 0; s1y.value = 0; s1r.value = 0
      s2x.value = 0; s2y.value = 0; s2r.value = 0
      s3x.value = 0; s3y.value = 0; s3r.value = 0
      b0y.value = 0; b0sway.value = 0
      b1y.value = 0; b1sway.value = 0
      b2y.value = 0; b2sway.value = 0
      b3y.value = 0; b3sway.value = 0
      b4y.value = 0; b4sway.value = 0
      b5y.value = 0; b5sway.value = 0
      b6y.value = 0; b6sway.value = 0
      lottieRef.current?.reset()
      setIsRevealed(false)
      return
    }

    setIsRevealed(false)

    fanProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: FAN_DURATION, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: FAN_DURATION, easing: Easing.inOut(Easing.cubic) }),
      ),
      LOOP_COUNT,
      false,
      (finished) => { if (finished) runOnJS(onFanComplete)() },
    )
  }, [visible])

  // ── Phase 2 — winner reveal ───────────────────────────────────────────────
  useEffect(() => {
    if (!isRevealed) return

    winnerY.value = withSpring(-210, { damping: 14, stiffness: 90 })
    winnerScale.value = withTiming(1.2, { duration: 600 })
    glowOrbOp.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })

    const exitDur = exitMode === 'scatter' ? 700 : 450
    otherOp.value = withTiming(0, { duration: exitDur })

    if (exitMode === 'scatter') {
      const cfg = { duration: exitDur, easing: Easing.in(Easing.cubic) } as const
      s0x.value = withTiming(SCATTER[0].tx, cfg); s0y.value = withTiming(SCATTER[0].ty, cfg); s0r.value = withTiming(SCATTER[0].rot, cfg)
      s1x.value = withTiming(SCATTER[1].tx, cfg); s1y.value = withTiming(SCATTER[1].ty, cfg); s1r.value = withTiming(SCATTER[1].rot, cfg)
      s2x.value = withTiming(SCATTER[2].tx, cfg); s2y.value = withTiming(SCATTER[2].ty, cfg); s2r.value = withTiming(SCATTER[2].rot, cfg)
      s3x.value = withTiming(SCATTER[3].tx, cfg); s3y.value = withTiming(SCATTER[3].ty, cfg); s3r.value = withTiming(SCATTER[3].rot, cfg)
    }

    labelOp.value = withDelay(750, withTiming(1, { duration: 400 }))
    labelScale.value = withDelay(750, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }))

    notifTitleOp.value = withDelay(1000, withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }))
    notifTitleY.value = withDelay(1000, withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }))

    // Lottie confetti fires after the winner card has risen partway
    const timer = setTimeout(() => lottieRef.current?.play(), 450)

    const swayOpts = (amp: number, period: number) =>
      withRepeat(
        withSequence(
          withTiming(amp, { duration: period, easing: Easing.inOut(Easing.quad) }),
          withTiming(-amp, { duration: period, easing: Easing.inOut(Easing.quad) }),
        ),
        -1, false,
      )

    // 7 balloons — staggered 150 ms apart, varied float durations and sway
    b0y.value = withDelay(0, withTiming(-(SH + 200), { duration: 3200, easing: Easing.out(Easing.quad) }))
    b0sway.value = swayOpts(10, 800)

    b1y.value = withDelay(150, withTiming(-(SH + 200), { duration: 2800, easing: Easing.out(Easing.quad) }))
    b1sway.value = withDelay(150, swayOpts(7, 650))

    b2y.value = withDelay(300, withTiming(-(SH + 200), { duration: 3600, easing: Easing.out(Easing.quad) }))
    b2sway.value = withDelay(300, swayOpts(12, 920))

    b3y.value = withDelay(450, withTiming(-(SH + 200), { duration: 3000, easing: Easing.out(Easing.quad) }))
    b3sway.value = withDelay(450, swayOpts(9, 750))

    b4y.value = withDelay(600, withTiming(-(SH + 200), { duration: 3800, easing: Easing.out(Easing.quad) }))
    b4sway.value = withDelay(600, swayOpts(11, 840))

    b5y.value = withDelay(750, withTiming(-(SH + 200), { duration: 2900, easing: Easing.out(Easing.quad) }))
    b5sway.value = withDelay(750, swayOpts(8, 700))

    b6y.value = withDelay(900, withTiming(-(SH + 200), { duration: 3400, easing: Easing.out(Easing.quad) }))
    b6sway.value = withDelay(900, swayOpts(13, 880))

    return () => clearTimeout(timer)
  }, [isRevealed, exitMode])

  // ── Animated styles ───────────────────────────────────────────────────────

  const cardStyle0 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 0
    return {
      opacity: isW ? 1 : otherOp.value,
      zIndex: isW ? 10 : 1,
      elevation: isW ? 20 : 2,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].tx]) + (isW ? 0 : s0x.value) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].ty]) + (isW ? winnerY.value : s0y.value) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].rot]) + (isW ? 0 : s0r.value)}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle1 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 1
    return {
      opacity: isW ? 1 : otherOp.value,
      zIndex: isW ? 10 : 2,
      elevation: isW ? 20 : 4,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].tx]) + (isW ? 0 : s1x.value) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].ty]) + (isW ? winnerY.value : s1y.value) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].rot]) + (isW ? 0 : s1r.value)}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle2 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 2
    return {
      opacity: isW ? 1 : otherOp.value,
      zIndex: isW ? 10 : 3,
      elevation: isW ? 20 : 6,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].tx]) + (isW ? 0 : s2x.value) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].ty]) + (isW ? winnerY.value : s2y.value) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].rot]) + (isW ? 0 : s2r.value)}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle3 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 3
    return {
      opacity: isW ? 1 : otherOp.value,
      zIndex: isW ? 10 : 4,
      elevation: isW ? 20 : 8,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].tx]) + (isW ? 0 : s3x.value) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].ty]) + (isW ? winnerY.value : s3y.value) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].rot]) + (isW ? 0 : s3r.value)}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOp.value,
    transform: [{ scale: labelScale.value }],
  }))

  const glowOrbStyle = useAnimatedStyle(() => ({ opacity: glowOrbOp.value }))

  const notifTitleStyle = useAnimatedStyle(() => ({
    opacity: notifTitleOp.value,
    transform: [{ translateY: notifTitleY.value }],
  }))

  const b0Style = useAnimatedStyle(() => ({ transform: [{ translateY: b0y.value }, { translateX: b0sway.value }] }))
  const b1Style = useAnimatedStyle(() => ({ transform: [{ translateY: b1y.value }, { translateX: b1sway.value }] }))
  const b2Style = useAnimatedStyle(() => ({ transform: [{ translateY: b2y.value }, { translateX: b2sway.value }] }))
  const b3Style = useAnimatedStyle(() => ({ transform: [{ translateY: b3y.value }, { translateX: b3sway.value }] }))
  const b4Style = useAnimatedStyle(() => ({ transform: [{ translateY: b4y.value }, { translateX: b4sway.value }] }))
  const b5Style = useAnimatedStyle(() => ({ transform: [{ translateY: b5y.value }, { translateX: b5sway.value }] }))
  const b6Style = useAnimatedStyle(() => ({ transform: [{ translateY: b6y.value }, { translateX: b6sway.value }] }))

  const balloonStyles = [b0Style, b1Style, b2Style, b3Style, b4Style, b5Style, b6Style]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>

        {/* Dark purple backdrop */}
        <View style={styles.backdrop} />

        {/* Ambient glow orb behind the card stack */}
        <Animated.View style={[styles.glowOrb, glowOrbStyle]} pointerEvents="none" />

        {/* Cards — rendered bottom→top for default z-stacking */}
        <Animated.Image source={getCardSource(0)} style={[styles.card, cardStyle0]} resizeMode="cover" />
        <Animated.Image source={getCardSource(1)} style={[styles.card, cardStyle1]} resizeMode="cover" />
        <Animated.Image source={getCardSource(2)} style={[styles.card, cardStyle2]} resizeMode="cover" />
        <Animated.Image source={getCardSource(3)} style={[styles.card, cardStyle3]} resizeMode="cover" />

        {/* 7 balloons — float up from below the screen after winner reveal */}
        {BALLOON_TINTS.map((tint, i) => (
          <Animated.View
            key={`balloon-${i}`}
            pointerEvents="none"
            style={[
              styles.balloonWrapper,
              {
                left: BALLOON_POSITIONS[i],
                width: BALLOON_SIZES[i],
                height: BALLOON_SIZES[i] * 1.56,
              },
              balloonStyles[i],
            ]}
          >
            <Image
              source={BALLOON_IMAGE}
              style={{ width: BALLOON_SIZES[i], height: BALLOON_SIZES[i] * 1.56, tintColor: tint }}
              resizeMode="contain"
            />
          </Animated.View>
        ))}

        {/* Lottie confetti — mounts on reveal, plays once (loop=false) */}
        {isRevealed && (
          <View style={styles.lottie} pointerEvents="none">
            <LottieView
              ref={lottieRef}
              source={CELEBRATION_LOTTIE}
              style={StyleSheet.absoluteFill}
              loop={false}
              autoPlay={false}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Header */}
        <View style={styles.header} pointerEvents="none">
          <CustomText style={styles.titleText}>CARD REVEAL</CustomText>
          <CustomText style={styles.subtitleText}>
            {isRevealed ? 'Behold your winning card' : 'Shuffling the deck…'}
          </CustomText>
        </View>

        {/* Winner badge — appears after fly-up */}
        <Animated.View style={[styles.winnerBadgeContainer, labelAnimStyle]} pointerEvents="none">
          <View style={styles.winnerBadge}>
            <CustomText style={styles.winnerText}>✦  WINNING CARD  ✦</CustomText>
          </View>
        </Animated.View>

        {/* Notification title — slides up sharply after winner badge */}
        {notifTitle ? (
          <Animated.View style={[styles.notifTitleContainer, notifTitleStyle]} pointerEvents="none">
            <CustomText style={styles.notifTitleText}>{notifTitle}</CustomText>
          </Animated.View>
        ) : null}

        {/* Close button — only shown once reveal is done */}
        {isRevealed && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <CustomText style={styles.closeText}>CLOSE</CustomText>
          </TouchableOpacity>
        )}

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 64, 43, 0.95)',
  },
  glowOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 215, 0, 0.07)',
    top: SH / 2 - 130,
    left: SW / 2 - 110,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 45,
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    top: CARD_TOP,
    left: CARD_LEFT,
    borderRadius: 10,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  balloonWrapper: {
    position: 'absolute',
    bottom: -80,
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleText: {
    color: Colors.GOLD,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 5,
    textShadowColor: Colors.GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitleText: {
    color: Colors.WHITE_75,
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 1,
  },
  winnerBadgeContainer: {
    position: 'absolute',
    top: WINNER_BADGE_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  winnerBadge: {
    borderWidth: 1.5,
    borderColor: Colors.GOLD,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 10,
  },
  winnerText: {
    color: Colors.GOLD,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 3,
    textShadowColor: Colors.GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: Colors.GOLD,
    borderRadius: 30,
    paddingHorizontal: 52,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  closeText: {
    color: Colors.GOLD,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
  },
  notifTitleContainer: {
    position: 'absolute',
    top: NOTIF_TITLE_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notifTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
})

export default CardRevealModal
