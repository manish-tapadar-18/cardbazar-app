import React from 'react'
import { Image, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../../../utils/Images'
import { Colors } from '../../../../utils/Colors'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'

const GameDetailsEmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyGlowRing}>
      <LinearGradient
        colors={Colors.GRADIENT.GRADIENTHEADER}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconCircle}
      >
        <Image source={Images.GAME_LIST} style={styles.emptyIcon} resizeMode="contain" />
      </LinearGradient>
    </View>

    <CustomText style={styles.emptyTitle}>NO GAMES TODAY</CustomText>

    <LinearGradient
      colors={['transparent', Colors.GOLD, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.emptyDivider}
    />

    <CustomText style={styles.emptySubtitle}>
      There are no active games available{'\n'}for this category right now.{'\n'}Pull down to refresh.
    </CustomText>
  </View>
)

export default GameDetailsEmptyState
