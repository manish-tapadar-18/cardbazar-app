import React, { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../../../utils/Images'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'
import GradientText from '../../../../components/GradientText'
import { IGameCategoryResponse, IPlayOption } from '../../../../response/module/IGameCategoryResponse'
import { Colors } from '../../../../utils/Colors'
import { ENV } from '../../../../utils/env'
import { rh, rw } from '../../../../utils/responsive'

// ─── Fan constants ────────────────────────────────────────────────────────────
const CARD_W = rw(9)
const CARD_H = rh(7)
const FAN_W = rw(32)
const FAN_H = rh(10)
const CARD_LEFT = (FAN_W - CARD_W) / 2
const CARD_TOP = (FAN_H - CARD_H) / 2

// ─── CardFan ──────────────────────────────────────────────────────────────────
interface CardFanProps { options: IPlayOption[] }

const CardFan: React.FC<CardFanProps> = ({ options }) => {
  const total = options.length
  const anims = useRef(options.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Scale stagger so the whole fan cascade finishes in ~380 ms regardless of count
    const staggerDelay = Math.max(25, Math.floor(380 / Math.max(total, 1)))
    Animated.stagger(
      staggerDelay,
      anims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true })
      )
    ).start()
  }, [])

  if (total === 0) return null

  const mid = (total - 1) / 2
  // Dynamic spread — scales down automatically for many cards
  const xStep = total <= 1 ? 0 : Math.min(rw(3.5), (FAN_W * 0.68) / total)
  const angleStep = total <= 1 ? 0 : Math.min(9, 30 / total)
  const yDepth = rh(0.4)

  return (
    <View style={fanStyles.container}>
      {options.map((card, i) => {
        const offset = i - mid
        const angle = offset * angleStep
        const finalTx = offset * xStep
        const finalTy = Math.abs(offset) * yDepth
        // center card on top; outer cards have lower zIndex
        const zIndex = total - Math.abs(Math.round(offset))

        const translateX = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, finalTx],
        })
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          // slide up from WITHIN the fan container (rh(3) below center, not outside)
          outputRange: [CARD_TOP + rh(3), finalTy],
        })
        const scale = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        })

        return (
          <Animated.View
            key={card.ID}
            style={[
              fanStyles.card,
              {
                left: CARD_LEFT,
                top: CARD_TOP,
                zIndex,
                opacity: anims[i],
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: `${angle}deg` },
                  { scale },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: `${ENV.BASE_URL}/${card.IMAGE_URL}` }}
              style={fanStyles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        )
      })}
    </View>
  )
}

const fanStyles = StyleSheet.create({
  container: {
    width: FAN_W,
    height: FAN_H,
    overflow: 'hidden', // keeps rotated card edges from leaking into the text column
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: rw(1.5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    backgroundColor: '#1a1a2e',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
})

// ─── CategoryCard ─────────────────────────────────────────────────────────────
interface CategoryCardProps {
  item: IGameCategoryResponse
  onPress: (id: string) => void
  contestCount?: number
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, onPress, contestCount }) => {
  const playOptions = React.useMemo<IPlayOption[]>(() => {
    try {
      return JSON.parse(item.PLAY_OPTIONS) as IPlayOption[]
    } catch {
      return []
    }
  }, [item.PLAY_OPTIONS])

  return (
    <TouchableOpacity onPress={() => onPress(item.ID)} activeOpacity={0.82} style={styles.categoryCardWrapper}>
      <LinearGradient
        colors={Colors.GRADIENT.GRADIENTHEADER}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryCard}
      >
        {/* Top row: text on left, animated fan on right */}
        <View style={styles.categoryCardTop}>
          <View style={styles.categoryCardContent}>
            <GradientText
              colors={Colors.GRADIENT.GOLD}
              locations={Colors.GRADIENT.GOLD_LOCATIONS}
              style={styles.categoryName}
              angle={180}
            >
              {item.NAME}
            </GradientText>
            <CustomText style={styles.categoryDesc} numberOfLines={2}>
              {item.DESCRIPTION}
            </CustomText>
          </View>
          {playOptions.length > 0 && <CardFan options={playOptions} />}
        </View>

        {/* Footer always below the fan — never covered */}
        <View style={styles.categoryFooter}>
          {contestCount !== undefined && (
            <View style={styles.contestsBadgeWrapper}>
              <LinearGradient
                colors={['#FFD600', '#FFF177']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.contestsBadge}
              >
                <CustomText style={styles.contestsText}>{contestCount} CONTESTS</CustomText>
              </LinearGradient>
            </View>
          )}
          <TouchableOpacity onPress={() => onPress(item.ID)} style={styles.playBtn} activeOpacity={0.8}>
            <Image source={Images.PLAY_CIRCLE} style={styles.playIcon} resizeMode="contain" />
            <CustomText style={styles.playText}>LET'S PLAY</CustomText>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default CategoryCard
