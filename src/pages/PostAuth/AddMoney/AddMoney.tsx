import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Keyboard,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Images } from '../../../utils/Images'
import { Colors } from '../../../utils/Colors'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { useUserStore } from '../../../stores/userStore'
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore'
import { clearAllStores } from '../../../stores/clearAllStores'
import { IPaymentGatewayItem } from '../../../response/module/IGetPaymentGatewayResponse'
import AddMoneyBlockedOverlay from './components/AddMoneyBlockedOverlay'

// ─── Constants ────────────────────────────────────────────────────────────────
const MONEY_ARR = [50, 100, 200, 300, 500, 1000, 2000, 5000]

// ─── AddMoney Screen ──────────────────────────────────────────────────────────
const AddMoney = () => {
  const { userDetails } = useUserStore()
  const { adminDetails } = useAdminDetailsStore()
  const navigation = useNavigation<any>()
  const [activeTopKey, setActiveTopKey] = useState('')

  // ── Flags from API ────────────────────────────────────────────────────────
  const [userAddMoneyFlag, setUserAddMoneyFlag] = useState(0)
  const [adminAddMoneyFlag, setAdminAddMoneyFlag] = useState(0)
  const [minDeposit, setMinDeposit] = useState(0)
  const [maxDeposit, setMaxDeposit] = useState(999999)
  const [isInitLoading, setIsInitLoading] = useState(true)
  const [isOverlayRefreshing, setIsOverlayRefreshing] = useState(false)

  // ── Amount selection ──────────────────────────────────────────────────────
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isOtherSelected, setIsOtherSelected] = useState(false)
  const [otherAmount, setOtherAmount] = useState('')

  // ── Gateway ───────────────────────────────────────────────────────────────
  const [selectedGateway, setSelectedGateway] = useState<IPaymentGatewayItem | null>(null)
  const [isGatewayLoading, setIsGatewayLoading] = useState(false)
  const [isAddingMoney, setIsAddingMoney] = useState(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const isBlocked = !(adminAddMoneyFlag === 1 && userAddMoneyFlag === 1)
  const filteredAmounts = MONEY_ARR.filter(v => v >= minDeposit && v <= maxDeposit)

  // ── Fetch init data ───────────────────────────────────────────────────────
  const fetchInitData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsOverlayRefreshing(true)
    else setIsInitLoading(true)

    try {
      const email = userDetails?.EMAIL
      const [userRes, adminRes] = await Promise.all([
        email
          ? Repository.User.userDetails({ EMAIL: email })
          : Promise.resolve(null),
        Repository.User.adminDetails(),
      ])

      if (userRes?.isSuccess && userRes.data) {
        if (userRes.data.STATUS === 'INACTIVE') {
          clearAllStores()
          return
        }
        setUserAddMoneyFlag(userRes.data.ADD_MONEY_ENABLE)
      }

      if (adminRes?.isSuccess && adminRes.data) {
        setAdminAddMoneyFlag(adminRes.data.ADD_MONEY_ENABLE)
        setMinDeposit(Number(adminRes.data.MIN_DEPOSIT) || 0)
        setMaxDeposit(Number(adminRes.data.MAX_DEPOSIT) || 999999)
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to load. Please try again.')
    } finally {
      if (isRefresh) setIsOverlayRefreshing(false)
      else setIsInitLoading(false)
    }
  }, [userDetails?.EMAIL])

  useFocusEffect(
    useCallback(() => {
      setActiveTopKey('')
      fetchInitData()
    }, [fetchInitData])
  )

  // ── Reset gateway state on new amount selection ───────────────────────────
  const resetGatewayState = () => {
    setSelectedGateway(null)
  }

  // ── Chip press ────────────────────────────────────────────────────────────
  const handleChipPress = (amount: number) => {
    setSelectedAmount(amount)
    setIsOtherSelected(false)
    setOtherAmount('')
    resetGatewayState()
    getAllPaymentGateway(amount)
  }

  // ── Other chip press ──────────────────────────────────────────────────────
  const handleOtherPress = () => {
    setSelectedAmount(null)
    setIsOtherSelected(true)
    setOtherAmount('')
    resetGatewayState()
  }

  // ── Set amount button ─────────────────────────────────────────────────────
  const handleSetAmount = () => {
    Keyboard.dismiss();
    const amount = Number(otherAmount)
    if (!otherAmount || isNaN(amount) || amount <= 0) {
      Toast.error('Please enter a valid amount.', { placement: 'bottom', duration: 2500 })
      return
    }
    if (amount < minDeposit || amount > maxDeposit) {
      Toast.error(
        `Amount must be between ₹${minDeposit} and ₹${maxDeposit}.`,
        { placement: 'bottom', duration: 3000 }
      )
      return
    }
    getAllPaymentGateway(amount)
  }

  // ── Fetch payment gateways ────────────────────────────────────────────────
  const getAllPaymentGateway = async (amount: number) => {
    try {
      setIsGatewayLoading(true)
      const { isSuccess, data, message } = await Repository.Payment.getPaymentGateway(amount)
      if (isSuccess && data && data.length > 0) {
        setSelectedGateway(data[0])
      } else {
        Toast.error(message ?? 'No payment gateways available.', { placement: 'bottom', duration: 3000 })
        setSelectedGateway(null)
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to load payment methods.', { placement: 'bottom', duration: 3000 })
      setSelectedGateway(null)
    } finally {
      setIsGatewayLoading(false)
    }
  }

  // ── Add money ─────────────────────────────────────────────────────────────
  const handleAddMoney = async () => {
    const amount = isOtherSelected ? Number(otherAmount) : selectedAmount
    if (!amount || !userDetails?.ID) return

    try {
      setIsAddingMoney(true)
      const payload = {
        USER_ID: userDetails.ID,
        AMOUNT: amount,
        DESCRIPTION: adminDetails?.EMAIL ?? '',
        STATUS: 'PENDING' as const,
      }
      const { isSuccess, data, message } = await Repository.Payment.addMoneyRequest(payload)
      if (isSuccess && data?.ID) {
        navigation.navigate('PaymentSelection', { ID: data.ID, amount })
      } else {
        Toast.error(message ?? 'Failed to initiate payment.', { placement: 'bottom', duration: 3000 })
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.', { placement: 'bottom', duration: 3000 })
    } finally {
      setIsAddingMoney(false)
    }
  }

  const handleTopBarPress = useCallback(
    (item: { key: string }) => {
      setActiveTopKey(item.key)
      if (item.key === 'gameRules') navigation.navigate('GameRules')
      else if (item.key === 'referEarn') navigation.navigate('Refer')
      else if (item.key === 'gamesList') navigation.navigate('Home')
    },
    [navigation]
  )

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar activeKey={activeTopKey} onPress={handleTopBarPress} />

      <View style={styles.content}>
        {isInitLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={Colors.GOLD} />
          </View>
        ) : (
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={20}
          >
            {/* ── Page Header ──────────────────────────────────────── */}
            <View style={styles.pageHeader}>
              <LinearGradient
                colors={['#FFD700', '#E8900C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pageIconCircle}
              >
                <Image source={Images.ADD_MONEY} style={styles.pageIcon} resizeMode="contain" />
              </LinearGradient>
              <View style={styles.pageTitleGroup}>
                <CustomText style={styles.pageTitle}>ADD MONEY</CustomText>
                <CustomText style={styles.pageSubtitle}>Select an amount to proceed</CustomText>
              </View>
            </View>

            {/* ── Deposit Limits ────────────────────────────────────── */}
            <View style={styles.limitsBar}>
              <View style={styles.limitItem}>
                <CustomText style={styles.limitLabel}>MIN DEPOSIT</CustomText>
                <CustomText style={styles.limitValue}>₹{minDeposit}</CustomText>
              </View>
              <View style={styles.limitDivider} />
              <View style={styles.limitItem}>
                <CustomText style={styles.limitLabel}>MAX DEPOSIT</CustomText>
                <CustomText style={styles.limitValue}>₹{maxDeposit}</CustomText>
              </View>
            </View>

            {/* ── Amount Chips ──────────────────────────────────────── */}
            <CustomText style={styles.sectionLabel}>SELECT AMOUNT</CustomText>
            <View style={styles.chipsGrid}>
              {filteredAmounts.map(amount => {
                const isSelected = selectedAmount === amount
                return (
                  <Pressable
                    key={amount}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleChipPress(amount)}
                  >
                    <CustomText style={[styles.chipText, ...(isSelected ? [styles.chipTextSelected] : [])]}>
                      ₹{amount}
                    </CustomText>
                  </Pressable>
                )
              })}

              {/* Other chip */}
              <Pressable
                style={[
                  styles.chip,
                  styles.otherChip,
                  isOtherSelected && styles.otherChipSelected,
                ]}
                onPress={handleOtherPress}
              >
                <CustomText style={[styles.chipText, ...(isOtherSelected ? [styles.chipTextSelected] : [])]}>
                  Other
                </CustomText>
              </Pressable>
            </View>

            {/* ── Other Amount Input ────────────────────────────────── */}
            {isOtherSelected && (
              <View style={styles.otherInputCard}>
                <CustomText style={styles.otherInputHint}>
                  Enter amount between ₹{minDeposit} – ₹{maxDeposit}
                </CustomText>
                <View style={styles.otherInputRow}>
                  <View style={styles.otherInputWrapper}>
                    <CustomText style={styles.currencySymbol}>₹</CustomText>
                    <TextInput
                      style={styles.otherInput}
                      value={otherAmount}
                      onChangeText={setOtherAmount}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      maxLength={7}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.setAmountBtn}
                    onPress={handleSetAmount}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#E8900C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.setAmountBtnGradient}
                    >
                      <CustomText style={styles.setAmountBtnText}>SET AMOUNT</CustomText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Payment Gateway ───────────────────────────────────── */}
            {isGatewayLoading && (
              <View style={styles.gatewayLoadingCard}>
                <ActivityIndicator size="small" color={Colors.GOLD} />
                <CustomText style={styles.gatewayLoadingText}>
                  Loading payment methods...
                </CustomText>
              </View>
            )}

            {!isGatewayLoading && selectedGateway && (
              <>
                <CustomText style={styles.gatewaySectionLabel}>PAYMENT METHOD</CustomText>
                <View style={styles.gatewayCard}>
                  <LinearGradient
                    colors={['#FFD700', '#E8900C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gatewayIconCircle}
                  >
                    <Image
                      source={Images.TAB_WALLET}
                      style={styles.gatewayIcon}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                  <View style={styles.gatewayInfo}>
                    <CustomText style={styles.gatewayLabel}>Selected Gateway</CustomText>
                    <CustomText style={styles.gatewayName}>{selectedGateway.NAME}</CustomText>
                  </View>
                  <View style={styles.gatewayActiveBadge}>
                    <View style={styles.gatewayActiveDot} />
                    <CustomText style={styles.gatewayActiveText}>ACTIVE</CustomText>
                  </View>
                </View>
              </>
            )}

            {/* ── Add Money Button ──────────────────────────────────── */}
            {!isGatewayLoading && selectedGateway?.CODE === 'KILLER' && (
              <TouchableOpacity
                style={[styles.addMoneyBtnWrapper, isAddingMoney && { opacity: 0.7 }]}
                onPress={handleAddMoney}
                activeOpacity={0.85}
                disabled={isAddingMoney}
              >
                <LinearGradient
                  colors={['#FFD700', '#E8900C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addMoneyBtnGradient}
                >
                  {isAddingMoney
                    ? <ActivityIndicator size="small" color={Colors.BLACK} />
                    : <CustomText style={styles.addMoneyBtnText}>ADD MONEY</CustomText>
                  }
                </LinearGradient>
              </TouchableOpacity>
            )}
          </KeyboardAwareScrollView>
        )}

        {/* ── Blocked Overlay ─────────────────────────────────────────── */}
        {!isInitLoading && isBlocked && (
          <AddMoneyBlockedOverlay
            onRefresh={() => fetchInitData(true)}
            isRefreshing={isOverlayRefreshing}
          />
        )}
      </View>
    </ImageBackground>
  )
}

export default AddMoney
