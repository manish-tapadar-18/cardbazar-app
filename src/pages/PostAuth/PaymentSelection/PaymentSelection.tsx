import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  AppState,
  AppStateStatus,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Images } from '../../../utils/Images'
import { Colors } from '../../../utils/Colors'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { IKillerPaymentItem } from '../../../response/module/IGetKillerPaymentGatewayResponse'
import { HomeStackParamList } from '../../../navigation/RouteTypes'
import PaymentStatusModal from './components/PaymentStatusModal'

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMER_DURATION = 2 * 60 * 1000

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const PAYMENT_META: Record<string, { name: string; subtitle: string; logo: any }> = {
  phonepe: {
    name: 'PhonePe',
    subtitle: 'Pay instantly via PhonePe app',
    logo: Images.PHONEPE,
  },
  paytm: {
    name: 'Paytm',
    subtitle: 'Pay instantly via Paytm app',
    logo: Images.PAYTM,
  },
  gpay: {
    name: 'Google Pay',
    subtitle: 'Pay instantly via Google Pay app',
    logo: Images.GPAY,
  },
}

// ─── PaymentSelection Screen ──────────────────────────────────────────────────
const PaymentSelection = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'PaymentSelection'>>()
  const { ID, amount } = route.params
  const navigation = useNavigation<any>()

  // ── Payments ──────────────────────────────────────────────────────────────
  const [payments, setPayments] = useState<IKillerPaymentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [remainingTime, setRemainingTime] = useState(TIMER_DURATION)
  const expiryTimeRef = useRef<number>(Date.now() + TIMER_DURATION)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const scaleAnim = useRef(new Animated.Value(1)).current

  // ── Payment status modal ───────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // ── Scale pulse on every tick ─────────────────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [remainingTime])

  // ── Navigate to HomeStack root ────────────────────────────────────────────
  const goHome = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    navigation.navigate('HomeTab', { screen: 'Home' })
  }, [navigation])

  // ── Timer end ────────────────────────────────────────────────────────────
  const onTimerEnd = useCallback(() => {
    goHome()
  }, [goHome])

  // ── Start countdown ───────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const remaining = expiryTimeRef.current - Date.now()
      if (remaining <= 0) {
        clearInterval(intervalRef.current!)
        setRemainingTime(0)
        onTimerEnd()
      } else {
        setRemainingTime(remaining)
      }
    }, 1000)
  }, [onTimerEnd])

  // ── Hook 1: fetch payment links ───────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const fetchPayments = async () => {
        try {
          setIsLoading(true)
          const { isSuccess, data, message } = await Repository.Payment.getKillerPaymentGatewayDetails(amount, ID)
          if (isSuccess && data) {
            setPayments(data)
          } else {
            Toast.error(message ?? 'Failed to load payment options.', { placement: 'bottom', duration: 3000 })
          }
        } catch (error: any) {
          Toast.error(error?.message ?? 'Something went wrong.', { placement: 'bottom', duration: 3000 })
        } finally {
          setIsLoading(false)
        }
      }
      fetchPayments()
    }, [ID, amount])
  )

  // ── Hook 2: timer + AppState ──────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      expiryTimeRef.current = Date.now() + TIMER_DURATION
      setRemainingTime(TIMER_DURATION)
      startTimer()

      const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setShowPaymentModal(true)
        }
        appStateRef.current = nextState
      })

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        subscription.remove()
      }
    }, [startTimer])
  )

  // ── Open payment app ──────────────────────────────────────────────────────
  const openPaymentApp = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Toast.error('App not installed on this device.', { placement: 'bottom', duration: 3000 })
      }
    } catch {
      Toast.error('Unable to open payment app.', { placement: 'bottom', duration: 3000 })
    }
  }

  // ── Render a single payment item ──────────────────────────────────────────
  const renderPayment = (item: IKillerPaymentItem, index: number) => {
    if (item.type === 'qrImage') {
      return (
        <View key={index} style={styles.qrBlock}>
          <CustomText style={styles.qrTitle}>Scan The QR Code & Pay</CustomText>
          <Image source={{ uri: item.url }} style={styles.qrImage} />
        </View>
      )
    }

    const meta = PAYMENT_META[item.type]
    if (!meta) return null

    return (
      <Pressable
        key={index}
        style={styles.paymentRow}
        onPress={() => openPaymentApp(item.url)}
      >
        <Image source={meta.logo} style={styles.paymentLogo} />
        <View style={styles.paymentInfo}>
          <CustomText style={styles.paymentName}>{meta.name}</CustomText>
          <CustomText style={styles.paymentSubtitle}>{meta.subtitle}</CustomText>
        </View>
        <Image
          source={Images.ANGLE_DOWN}
          style={[styles.paymentChevron, { transform: [{ rotate: '-90deg' }] }]}
        />
      </Pressable>
    )
  }

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        {/* ── Warning Banner ────────────────────────────────────── */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.warningBanner}
        >
          <CustomText style={styles.warningText}>
            Don't close the application until your payment is complete
          </CustomText>
        </LinearGradient>

        {/* ── Timer Row ─────────────────────────────────────────── */}
        <View style={styles.timerRow}>
          <CustomText style={styles.timerLabel}>PAY USING APPS</CustomText>
          <View style={styles.timerRight}>
            <Image source={Images.CLOCK} style={styles.timerIcon} resizeMode="contain" />
            <Animated.Text
              style={[styles.timerText, { transform: [{ scale: scaleAnim }] }]}
            >
              {formatTime(remainingTime)}
            </Animated.Text>
          </View>
        </View>

        {/* ── Payment List ──────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={Colors.GOLD} />
            <CustomText style={styles.loadingText}>Loading payment options...</CustomText>
          </View>
        ) : (
          payments.map((item, index) => renderPayment(item, index))
        )}

        {/* ── Bottom Banner ─────────────────────────────────────── */}
        <View style={styles.bottomBanner}>
          <Image source={Images.ADD_AMOUNT_BANNER} style={styles.bottomBannerImage} />
        </View>
      </KeyboardAwareScrollView>

      {/* ── Payment Status Modal ─────────────────────────────────── */}
      <PaymentStatusModal
        visible={showPaymentModal}
        onOk={() => {
          setShowPaymentModal(false)
          goHome()
        }}
      />
    </ImageBackground>
  )
}

export default PaymentSelection
