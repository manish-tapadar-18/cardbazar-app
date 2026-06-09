import React, { useEffect, useRef } from 'react'
import {
    Modal,
    View,
    StyleSheet,
    Dimensions,
    ImageSourcePropType,
    TouchableOpacity,
    Image,
    ImageBackground,
} from 'react-native'
import Animated, {
    SharedValue,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
    withDelay,
} from 'react-native-reanimated'
import { Colors } from '../utils/Colors'
import CustomText from './CustomText'


const CARD_W = 48
const CARD_H = 70
const CARD_COUNT = 12
const TWO_PI = 2 * Math.PI
const STEP = TWO_PI / CARD_COUNT
const { width: SW, height: SH } = Dimensions.get('window')

const A0 = -Math.PI / 2
const A1 = A0 + STEP
const A2 = A0 + STEP * 2
const A3 = A0 + STEP * 3
const A4 = A0 + STEP * 4
const A5 = A0 + STEP * 5
const A6 = A0 + STEP * 6
const A7 = A0 + STEP * 7
const A8 = A0 + STEP * 8
const A9 = A0 + STEP * 9
const A10 = A0 + STEP * 10
const A11 = A0 + STEP * 11

const JUMP_AMP = 15
const JUMP_FREQ = 3

const PERSPECTIVE = 800
const TILT_AMP = 12   
const SCALE_AMP = 0.04 

// Run duration for the orbit when a selection is present (milliseconds)
const SELECTED_ORBIT_MS = 2500

function buildOrbitalStyle(
    orbitProgress: SharedValue<number>,
    radiusSV: SharedValue<number>,
    baseAngle: number,
    index: number = 0,
    fallSV?: SharedValue<number>,
    isSelected?: boolean,
    selProg?: SharedValue<number>,
    selScale?: SharedValue<number>,
    selRotateY?: SharedValue<number>,
    revolutions: number = 1, // number of full revolutions performed while orbitProgress goes 0->1
) {
    'worklet'
    // multiply orbitProgress by revolutions so we can control how many turns happen
    const a = baseAngle + orbitProgress.value * TWO_PI * revolutions
    
    const rotateDeg = ((a + Math.PI / 2) * 180) / Math.PI
    const isEven = (index % 2) === 0
    const jump = isEven
        ? JUMP_AMP * Math.sin(orbitProgress.value * TWO_PI * JUMP_FREQ)
        : 0
    const tiltX = TILT_AMP * Math.sin(a)
    const tiltY = -TILT_AMP * Math.cos(a)
    const txOrb = radiusSV.value * Math.cos(a)
    const tyOrb = radiusSV.value * Math.sin(a)

    const sp = selProg ? selProg.value : 0
    
    const translateX = txOrb * (1 - sp)
    const translateYOrb = (tyOrb + jump) * (1 - sp)

    
    const extraRotateY = selRotateY ? selRotateY.value : 0
    const rotateYDeg = tiltY + extraRotateY * sp

    
    const baseScale = 1 + (isEven ? SCALE_AMP * Math.abs(Math.sin(orbitProgress.value * TWO_PI * JUMP_FREQ)) : 0)
    const selectedScale = selScale ? selScale.value : 1
    const scale = baseScale * (1 - sp) + selectedScale * sp

    
    const fall = (fallSV && !isSelected) ? fallSV.value : 0
    const fallDistance = (SH + 300) * fall
    const opacity = isSelected ? 1 : (1 - fall)

    return {
        opacity,
        transform: [
            { perspective: PERSPECTIVE },
            { translateX },
            { translateY: translateYOrb },
            { rotate: `${rotateDeg}deg` as `${number}deg` },
            { rotateX: `${tiltX}deg` as `${number}deg` },
            { rotateY: `${rotateYDeg}deg` as `${number}deg` },
            
            { translateY: fallDistance },
            { scale },
        ],
    }
}

export interface AnimatedResultProps {
    visible: boolean
    onClose?: () => void
    cardImages: ImageSourcePropType[]
    circleRadius?: number
    orbitDurationMs?: number
    loop?: boolean
    selectedIndex?: number
    // new: control how many revolutions happen during the selected-orbit run (0.5 = half turn, 1 = full turn, etc.)
    selectedRevolutions?: number
}

const AnimatedResult: React.FC<AnimatedResultProps> = ({
    visible,
    onClose,
    cardImages,
    circleRadius = 180,
    orbitDurationMs = 5000,
    loop = true,
    selectedIndex = 5,
    selectedRevolutions = 0.1, 
}) => {
    const orbitProgress = useSharedValue(0)
    const radiusSV = useSharedValue(circleRadius)

    useEffect(() => { radiusSV.value = circleRadius }, [circleRadius])
    useEffect(() => () => cancelAnimation(orbitProgress), [])

    const fallSVs: SharedValue<number>[] = []
    
    for (let i = 0; i < CARD_COUNT; i++) {
        
        fallSVs.push(useSharedValue(0))
    }

    const selProg = useSharedValue(0)
    const selScale = useSharedValue(1)
    const selRotateY = useSharedValue(0)

    const fallTimerRef = useRef<number | null>(null)

    const startOrbit = () => {
        
        for (let i = 0; i < CARD_COUNT; i++) {
            fallSVs[i].value = 0
        }
        selProg.value = 0
        selScale.value = 1
        selRotateY.value = 0

        
        if (typeof selectedIndex === 'number') {
            orbitProgress.value = 0

            // For a selected-index run, only animate the orbit for SELECTED_ORBIT_MS,
            // then trigger the falling & selection animations.
            // orbitProgress goes 0 -> 1 in SELECTED_ORBIT_MS, but the visible rotation
            // is multiplied by selectedRevolutions inside buildOrbitalStyle.
            orbitProgress.value = withTiming(1, { duration: SELECTED_ORBIT_MS, easing: Easing.linear })
            
            if (fallTimerRef.current) {
                clearTimeout(fallTimerRef.current)
                fallTimerRef.current = null
            }
            fallTimerRef.current = setTimeout(() => {
                
                for (let i = 0; i < CARD_COUNT; i++) {
                    if (i === selectedIndex) continue
                    const dist = Math.abs(i - selectedIndex)
                    const staggerMs = dist * 80
                    fallSVs[i].value = withDelay(
                        staggerMs,
                        withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }),
                    )
                }

                
                
                const centerDelay = 80
                selProg.value = withDelay(centerDelay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }))
                selScale.value = withDelay(centerDelay, withTiming(3, { duration: 700, easing: Easing.out(Easing.cubic) }))
                
                selRotateY.value = withDelay(
                    centerDelay,
                    withTiming(
                        720,
                        { duration: 2000, easing: Easing.out(Easing.cubic) },
                        (finished) => {
                            if (finished) {
                                
                                selRotateY.value = 720
                            }
                        },
                    ),
                )
            }, SELECTED_ORBIT_MS)
        } else {
            
            orbitProgress.value = 0
            orbitProgress.value = withRepeat(
                withTiming(1, { duration: orbitDurationMs, easing: Easing.linear }),
                loop ? -1 : 1,
                false,
            )
        }
    }

    const stopOrbit = () => {
        if (fallTimerRef.current) {
            clearTimeout(fallTimerRef.current)
            fallTimerRef.current = null
        }
        cancelAnimation(orbitProgress)
        orbitProgress.value = 0
        for (let i = 0; i < CARD_COUNT; i++) {
            cancelAnimation(fallSVs[i])
            fallSVs[i].value = 0
        }
        cancelAnimation(selProg)
        cancelAnimation(selScale)
        cancelAnimation(selRotateY)
        selProg.value = 0
        selScale.value = 1
        selRotateY.value = 0
    }

    
    useEffect(() => {
        if (!visible) stopOrbit()
    }, [visible])

    const s0 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A0, 0, fallSVs[0], selectedIndex === 0, selProg, selScale, selRotateY, selectedRevolutions))
    const s1 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A1, 1, fallSVs[1], selectedIndex === 1, selProg, selScale, selRotateY, selectedRevolutions))
    const s2 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A2, 2, fallSVs[2], selectedIndex === 2, selProg, selScale, selRotateY, selectedRevolutions))
    const s3 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A3, 3, fallSVs[3], selectedIndex === 3, selProg, selScale, selRotateY, selectedRevolutions))
    const s4 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A4, 4, fallSVs[4], selectedIndex === 4, selProg, selScale, selRotateY, selectedRevolutions))
    const s5 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A5, 5, fallSVs[5], selectedIndex === 5, selProg, selScale, selRotateY, selectedRevolutions))
    const s6 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A6, 6, fallSVs[6], selectedIndex === 6, selProg, selScale, selRotateY, selectedRevolutions))
    const s7 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A7, 7, fallSVs[7], selectedIndex === 7, selProg, selScale, selRotateY, selectedRevolutions))
    const s8 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A8, 8, fallSVs[8], selectedIndex === 8, selProg, selScale, selRotateY, selectedRevolutions))
    const s9 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A9, 9, fallSVs[9], selectedIndex === 9, selProg, selScale, selRotateY, selectedRevolutions))
    const s10 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A10, 10, fallSVs[10], selectedIndex === 10, selProg, selScale, selRotateY, selectedRevolutions))
    const s11 = useAnimatedStyle(() => buildOrbitalStyle(orbitProgress, radiusSV, A11, 11, fallSVs[11], selectedIndex === 11, selProg, selScale, selRotateY, selectedRevolutions))

    const cardAnimStyles = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11]
    const circleSize = circleRadius * 2

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            onShow={startOrbit}
            onDismiss={stopOrbit}
            statusBarTranslucent
        >
            <ImageBackground
                source={require('../assets/images/result_background.png')}
                style={{flex: 1}}
                resizeMode="cover"
            ></ImageBackground>
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.backdrop} />

                <View
                    pointerEvents="none"
                    style={[
                        styles.circleBorder,
                        {
                            width: circleSize,
                            height: circleSize,
                            borderRadius: circleRadius,
                            top: SH / 2 - circleRadius,
                            left: SW / 2 - circleRadius,
                        },
                    ]}
                />

                {cardImages.slice(0, CARD_COUNT).map((src, i) => (
                    <Animated.Image
                        key={i}
                        source={src}
                        style={[styles.card, cardAnimStyles[i]]}
                        resizeMode="cover"
                    />
                ))}

                {onClose && (
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
        // backgroundColor: 'rgba(6, 64, 43, 0.97)',
    },
    circleBorder: {
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    card: {
        position: 'absolute',
        width: CARD_W,
        height: CARD_H,
        top: SH / 2 - CARD_H / 2,
        left: SW / 2 - CARD_W / 2,
        borderRadius: 6,
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
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

export default AnimatedResult