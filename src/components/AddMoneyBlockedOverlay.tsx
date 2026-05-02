import React from 'react'
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { styles } from '../pages/PostAuth/AddMoney/styles'
import { Images } from '../utils/Images'
import { Colors } from '../utils/Colors'
import CustomText from './CustomText'

interface Props {
  onRefresh: () => void
  isRefreshing: boolean
}

const AddMoneyBlockedOverlay: React.FC<Props> = ({ onRefresh, isRefreshing }) => (
  <View style={styles.overlayContainer}>
    <View style={styles.overlayGlowRing}>
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlayIconCircle}
      >
        <Image source={Images.ADD_MONEY} style={styles.overlayIcon} resizeMode="contain" />
      </LinearGradient>
    </View>

    <CustomText style={styles.overlayTitle}>ADD MONEY UNAVAILABLE</CustomText>

    <LinearGradient
      colors={['transparent', Colors.GOLD, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.overlayDivider}
    />

    <CustomText style={styles.overlaySubtitle}>
      Add money is currently not enabled.{'\n'}
      Please check back later or contact{'\n'}support for assistance.
    </CustomText>

    <TouchableOpacity
      style={styles.refreshBtn}
      onPress={onRefresh}
      disabled={isRefreshing}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.refreshBtnGradient}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={Colors.BLACK} />
        ) : (
          <CustomText style={styles.refreshBtnText}>↻  REFRESH</CustomText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  </View>
)

export default AddMoneyBlockedOverlay
