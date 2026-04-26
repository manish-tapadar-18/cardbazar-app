import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

const GameDetailsSkeletonBox = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  return <Animated.View style={[style, { opacity: pulseAnim }]} />
}

export default GameDetailsSkeletonBox
