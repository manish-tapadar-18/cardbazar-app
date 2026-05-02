import React from 'react'
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '../utils/Colors'
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight'
import { Images } from '../utils/Images'
import { rf, rh, rw } from '../utils/responsive'
import CustomText from './CustomText'

interface Props {
  onRefresh: () => void
  isRefreshing: boolean
  message?: string
}

const WithdrawBlockedOverlay: React.FC<Props> = ({ onRefresh, isRefreshing, message }) => (
  <View style={styles.container}>
    <View style={styles.glowRing}>
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconCircle}
      >
        <Image source={Images.WITHDRAWAL} style={styles.icon} resizeMode="contain" />
      </LinearGradient>
    </View>

    <CustomText style={styles.title}>WITHDRAW UNAVAILABLE</CustomText>

    <LinearGradient
      colors={['transparent', Colors.GOLD, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.divider}
    />

    <CustomText style={styles.subtitle}>
      {message && message.trim().length > 0
        ? message
        : `Withdraw is currently not enabled.\nPlease check back later or contact\nsupport for assistance.`}
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

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,1,25,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(8),
  },
  glowRing: {
    width: rw(50),
    height: rw(50),
    borderRadius: rw(25),
    backgroundColor: 'rgba(255,215,0,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rh(3.5),
  },
  iconCircle: {
    width: rw(30),
    height: rw(30),
    borderRadius: rw(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: rw(15),
    height: rw(15),
    tintColor: Colors.BLACK,
  },
  title: {
    color: Colors.GOLD,
    fontSize: rf(4.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: rh(2),
  },
  divider: {
    height: 1.5,
    width: rw(58),
    borderRadius: 1,
    marginBottom: rh(2),
  },
  subtitle: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
    lineHeight: rf(5.4),
    letterSpacing: 0.3,
    marginBottom: rh(4.5),
  },
  refreshBtn: {
    borderRadius: rh(1.5),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  refreshBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(10),
    paddingVertical: rh(1.8),
  },
  refreshBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
  },
})

export default WithdrawBlockedOverlay
