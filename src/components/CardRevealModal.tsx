import React, { useEffect, useCallback, useState } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
import { Colors } from '../utils/Colors'
import CustomText from './CustomText'

const { width: SW, height: SH } = Dimensions.get('window')

const CARD_W = 90
const CARD_H = 130
// Cards start stacked slightly above true center for visual balance
const CARD_TOP = SH / 2 - CARD_H / 2 - 20
const CARD_LEFT = SW / 2 - CARD_W / 2

const FAN_DURATION = 700   // ms per half-cycle (fan-out or fan-in)
const LOOP_COUNT = 4

// Spread targets derived from Lottie analysis — symmetrical fan
const SPREADS = [
  { tx: -90, ty: 20, rot: -40 },   // card1 — far left, counter-clockwise
  { tx: -32, ty: 10, rot: -15 },   // card2 — left, slight counter-clockwise
  { tx:  32, ty: 10, rot:  15 },   // card3 — right, slight clockwise
  { tx:  90, ty: 20, rot:  40 },   // card4 — far right, clockwise
]

const IMAGES = [
  require('../assets/images/card1.png'),
  require('../assets/images/card2.png'),
  require('../assets/images/card3.png'),
  require('../assets/images/card4.png'),
]

const WINNER_BADGE_TOP = SH / 2 + CARD_H / 2 + 30

export interface CardRevealModalProps {
  visible: boolean
  onClose: () => void
  /** 0 = card1.png, 1 = card2.png, 2 = card3.png, 3 = card4.png */
  winnerIndex: 0 | 1 | 2 | 3
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({
  visible,
  onClose,
  winnerIndex,
}) => {
  const [isRevealed, setIsRevealed] = useState(false)

  const fanProgress = useSharedValue(0)
  const winnerY     = useSharedValue(0)
  const winnerScale = useSharedValue(1)
  const otherOp     = useSharedValue(1)
  const labelOp     = useSharedValue(0)
  const labelScale  = useSharedValue(0.8)
  const winnerIdx   = useSharedValue<number>(winnerIndex)

  useEffect(() => { winnerIdx.value = winnerIndex }, [winnerIndex])

  // Cancel all animations on unmount
  useEffect(() => {
    return () => {
      cancelAnimation(fanProgress)
      cancelAnimation(winnerY)
      cancelAnimation(winnerScale)
      cancelAnimation(otherOp)
      cancelAnimation(labelOp)
      cancelAnimation(labelScale)
    }
  }, [])

  const onFanComplete = useCallback(() => setIsRevealed(true), [])

  // Phase 1 — fan loop, triggered when modal opens
  useEffect(() => {
    if (!visible) {
      cancelAnimation(fanProgress)
      cancelAnimation(winnerY)
      cancelAnimation(winnerScale)
      cancelAnimation(otherOp)
      cancelAnimation(labelOp)
      cancelAnimation(labelScale)
      fanProgress.value = 0
      winnerY.value     = 0
      winnerScale.value = 1
      otherOp.value     = 1
      labelOp.value     = 0
      labelScale.value  = 0.8
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
      (finished) => {
        if (finished) runOnJS(onFanComplete)()
      },
    )
  }, [visible])

  // Phase 2 — winner reveal, triggered after all fan loops finish
  useEffect(() => {
    if (!isRevealed) return
    otherOp.value     = withTiming(0, { duration: 450 })
    winnerY.value     = withSpring(-210, { damping: 14, stiffness: 90 })
    winnerScale.value = withTiming(1.2, { duration: 600 })
    labelOp.value     = withDelay(750, withTiming(1, { duration: 400 }))
    labelScale.value  = withDelay(750, withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
    }))
  }, [isRevealed])

  // Animated styles — all 4 at top level to satisfy hooks rules
  const cardStyle0 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 0
    return {
      opacity:   isW ? 1 : otherOp.value,
      zIndex:    isW ? 10 : 1,
      elevation: isW ? 20 : 2,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].tx]) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].ty]) + (isW ? winnerY.value : 0) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[0].rot])}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle1 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 1
    return {
      opacity:   isW ? 1 : otherOp.value,
      zIndex:    isW ? 10 : 2,
      elevation: isW ? 20 : 4,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].tx]) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].ty]) + (isW ? winnerY.value : 0) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[1].rot])}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle2 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 2
    return {
      opacity:   isW ? 1 : otherOp.value,
      zIndex:    isW ? 10 : 3,
      elevation: isW ? 20 : 6,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].tx]) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].ty]) + (isW ? winnerY.value : 0) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[2].rot])}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const cardStyle3 = useAnimatedStyle(() => {
    const isW = winnerIdx.value === 3
    return {
      opacity:   isW ? 1 : otherOp.value,
      zIndex:    isW ? 10 : 4,
      elevation: isW ? 20 : 8,
      transform: [
        { translateX: interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].tx]) },
        { translateY: interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].ty]) + (isW ? winnerY.value : 0) },
        { rotate: `${interpolate(fanProgress.value, [0, 1], [0, SPREADS[3].rot])}deg` },
        { scale: isW ? winnerScale.value : 1 },
      ],
    }
  })

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOp.value,
    transform: [{ scale: labelScale.value }],
  }))

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

        {/* Purple ambient glow behind the card stack */}
        <View style={styles.glowOrb} pointerEvents="none" />

        {/* Cards — rendered bottom (card1) to top (card4) for default z-stacking */}
        <Animated.Image source={IMAGES[0]} style={[styles.card, cardStyle0]} resizeMode="cover" />
        <Animated.Image source={IMAGES[1]} style={[styles.card, cardStyle1]} resizeMode="cover" />
        <Animated.Image source={IMAGES[2]} style={[styles.card, cardStyle2]} resizeMode="cover" />
        <Animated.Image source={IMAGES[3]} style={[styles.card, cardStyle3]} resizeMode="cover" />

        {/* Header — non-interactive */}
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

        {/* Close button — only shown after reveal completes */}
        {isRevealed && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <CustomText style={styles.closeText}>CLOSE</CustomText>
          </TouchableOpacity>
        )}

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 1, 30, 0.93)',
  },
  glowOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(160, 22, 230, 0.2)',
    top: SH / 2 - 130,
    left: SW / 2 - 110,
    shadowColor: Colors.HIGHLIGHT_PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
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
})

export default CardRevealModal
