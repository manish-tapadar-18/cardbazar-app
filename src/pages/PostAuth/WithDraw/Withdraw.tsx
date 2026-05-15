import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LinearGradient from 'react-native-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Images } from '../../../utils/Images'
import { Colors } from '../../../utils/Colors'
import { Toast } from '../../../utils/toast'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import WithdrawBlockedOverlay from '../../../components/WithdrawBlockedOverlay'
import { Repository } from '../../../repository/Repository'
import { useUserStore } from '../../../stores/userStore'
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore'
import { useWalletStore } from '../../../stores/walletStore'
import { useSwitchStackStore } from '../../../stores/switchStackStore'
import { clearAllStores } from '../../../stores/clearAllStores'
import { IUserDetailsResponse } from '../../../response/module/IUserDetailsResponse'

// ─── Yup validation schema (auto mode) ────────────────────────────────────────
const autoWithdrawSchema = Yup.object().shape({
  BANK_ACCOUNT_HOLDER_NAME: Yup.string().required('Account Holder Name is required'),
  BANK_ACCOUNT_NO: Yup.string()
    .required('Account number is required')
    .matches(/^[0-9]\d*$/, 'Account number must start with a non-zero digit')
    .max(20, 'Account Number should not exceed 20 digits'),
  BANK_IFSC: Yup.string()
    .required('Please enter IFSC code')
    .max(20, 'IFSC should not exceed 20 digits'),
  BANK_NAME: Yup.string()
    .required('Please enter bank name')
    .matches(
      /^[a-zA-Z0-9,. ]*$/,
      'Bank name can only contain letters, numbers, spaces, commas, and dots',
    ),
  AMOUNT: Yup.string()
    .required('Please enter amount')
    .max(5, 'Amount should not exceed 5 digits')
    .matches(/^[1-9]\d*$/, 'Amount should not start with 0'),
})

// ─── Withdraw Screen ───────────────────────────────────────────────────────────
const Withdraw = () => {
  const { userDetails } = useUserStore()
  const { adminDetails } = useAdminDetailsStore()
  const { balance, setWallet } = useWalletStore()
  const { setAuthStatus } = useSwitchStackStore()

  // ── UI state ────────────────────────────────────────────────────────────
  const [isInitLoading, setIsInitLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOverlayRefreshing, setIsOverlayRefreshing] = useState(false)

  // ── Feature flags ───────────────────────────────────────────────────────
  const [adminWithdrawEnabled, setAdminWithdrawEnabled] = useState(true)
  const [userWithdrawEnabled, setUserWithdrawEnabled] = useState(true)

  // ── Mode: null=loading, 0=manual, 1=auto ────────────────────────────────
  const [autoWithdrawMode, setAutoWithdrawMode] = useState<number | null>(null)

  // ── Profile & bank ──────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState<IUserDetailsResponse | null>(null)
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [confirmAccountNumberError, setConfirmAccountNumberError] = useState('')

  // ── Manual mode amount ──────────────────────────────────────────────────
  const [manualAmount, setManualAmount] = useState('')
  const [globalError, setGlobalError] = useState('')

  // ── Derived ─────────────────────────────────────────────────────────────
  const isBlocked = !adminWithdrawEnabled || !userWithdrawEnabled
  const hasExistingBankAccount = !!profileData?.BANK_ACCOUNT_NO

  // ─── Formik (auto mode) ────────────────────────────────────────────────────
  const { handleChange, handleBlur, handleSubmit, values, errors, touched, setErrors, setFieldValue } =
    useFormik({
      initialValues: {
        AMOUNT: '',
        BANK_IFSC: profileData?.BANK_IFSC ?? '',
        BANK_ACCOUNT_HOLDER_NAME:
          profileData?.BANK_ACCOUNT_HOLDER_NAME ??
          `${profileData?.FIRST_NAME ?? ''} ${profileData?.LAST_NAME ?? ''}`.trim(),
        BANK_ACCOUNT_NO: profileData?.BANK_ACCOUNT_NO ?? '',
        BANK_NAME: profileData?.BANK_NAME ?? '',
      },
      validationSchema: autoWithdrawSchema,
      validateOnMount: false,
      enableReinitialize: true,
      onSubmit: () => submitAutoWithdraw(),
    })

  // ─── Init data fetch ───────────────────────────────────────────────────────
  const fetchInitData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsOverlayRefreshing(true)
      else setIsInitLoading(true)

      try {
        const [userRes, autoRes] = await Promise.all([
          userDetails?.EMAIL
            ? Repository.User.userDetails({ EMAIL: userDetails.EMAIL })
            : Promise.resolve(null),
          Repository.Withdrawal.checkAutoWithdrawal(),
        ])

        if (userRes?.isSuccess && userRes.data) {
          if (userRes.data.STATUS == 'INACTIVE') {
            clearAllStores()
            setAuthStatus(false)
            return
          }
          setProfileData(userRes.data)
          setUserWithdrawEnabled(userRes.data.WITHDRAW_MONEY_ENABLE == 1)
          setFieldValue('BANK_IFSC', userRes.data.BANK_IFSC ?? '')
          setFieldValue(
            'BANK_ACCOUNT_HOLDER_NAME',
            userRes.data.BANK_ACCOUNT_HOLDER_NAME ??
            `${userRes.data.FIRST_NAME} ${userRes.data.LAST_NAME}`.trim(),
          )
          setFieldValue('BANK_ACCOUNT_NO', userRes.data.BANK_ACCOUNT_NO ?? '')
          setFieldValue('BANK_NAME', userRes.data.BANK_NAME ?? '')
        }

        if (autoRes?.isSuccess && autoRes.data != null) {
          setAutoWithdrawMode(autoRes.data.VALUE)
        }

        setAdminWithdrawEnabled(adminDetails?.WITHDRAW_MONEY_ENABLE == 1)
      } catch (error: any) {
        Toast.error(error?.message ?? 'Failed to load. Please try again.')
      } finally {
        if (isRefresh) setIsOverlayRefreshing(false)
        else setIsInitLoading(false)
      }
    },
    [userDetails?.EMAIL, adminDetails],
  )

  useFocusEffect(
    useCallback(() => {
      setGlobalError('')
      setConfirmAccountNumber('')
      setConfirmAccountNumberError('')
      setManualAmount('')
      setErrors({})
      fetchInitData()
    }, [fetchInitData]),
  )

  // ─── Re-validate flags before any submit ──────────────────────────────────
  const reValidateFlags = async (): Promise<boolean> => {
    const [userRes, adminRes] = await Promise.all([
      userDetails?.EMAIL
        ? Repository.User.userDetails({ EMAIL: userDetails.EMAIL })
        : Promise.resolve(null),
      Repository.User.adminDetails(),
    ])

    const userFlag = userRes?.isSuccess ? userRes.data?.WITHDRAW_MONEY_ENABLE ?? 0 : 0
    const adminFlag = adminRes?.isSuccess ? adminRes.data?.WITHDRAW_MONEY_ENABLE ?? 0 : 0

    if (userFlag == 0) setUserWithdrawEnabled(false)
    if (adminFlag == 0) setAdminWithdrawEnabled(false)

    return userFlag == 1 && adminFlag == 1
  }

  // ─── Wallet balance refresh ────────────────────────────────────────────────
  const refreshWallet = async () => {
    if (!userDetails?.ID) return
    const res = await Repository.User.getUserBalance(userDetails.ID)
    if (res.isSuccess && res.data) setWallet(res.data)
  }

  // ─── Amount validation ─────────────────────────────────────────────────────
  const validateAmount = (amount: string): string | null => {
    if (!amount) return 'Please enter amount'
    const num = parseInt(amount, 10)
    const min = parseInt(adminDetails?.MIN_WITHDRAWAL ?? '0', 10)
    if (num < min) return `Minimum withdrawal amount is ${min}`
    if (num > balance) return 'Insufficient balance'
    return null
  }

  // ─── POST withdrawal request ───────────────────────────────────────────────
  const postWithdrawalRequest = async (amount: number, bankDetails: {
    BANK_IFSC: string
    BANK_ACCOUNT_HOLDER_NAME: string
    BANK_ACCOUNT_NO: string
    BANK_NAME: string
  }) => {
    if (!userDetails?.ID) return
    setIsSubmitting(true)
    try {
      const res = await Repository.Withdrawal.withdrawalRequest({
        USER_ID: userDetails.ID,
        AMOUNT: amount,
        DESCRIPTION: 'withdrawal',
        STATUS: 'PENDING',
        ...bankDetails,
      })
      if (res.isSuccess) {
        await Promise.all([refreshWallet(), fetchInitData()])
        Toast.success(
          'Your withdrawal request has been submitted. It will be processed within 2 hours.',
          { placement: 'bottom', duration: 3500 },
        )
        setManualAmount('')
      } else {
        Toast.error(res.message ?? 'Withdrawal failed. Please try again.')
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Manual mode submit ────────────────────────────────────────────────────
  const handleManualSubmit = async () => {
    setGlobalError('')
    const amountError = validateAmount(manualAmount)
    if (amountError) { setGlobalError(amountError); return }

    const allowed = await reValidateFlags()
    if (!allowed) return

    const amount = parseInt(manualAmount, 10)
    Alert.alert(
      'Confirm Withdrawal',
      `Amount: ₹${amount}\n\nProceed with withdrawal request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: () => postWithdrawalRequest(amount, {
            BANK_IFSC: values.BANK_IFSC,
            BANK_ACCOUNT_HOLDER_NAME: values.BANK_ACCOUNT_HOLDER_NAME,
            BANK_ACCOUNT_NO: values.BANK_ACCOUNT_NO,
            BANK_NAME: values.BANK_NAME,
          })
        },
      ],
    )
  }

  // ─── Auto mode submit (called from Formik onSubmit) ────────────────────────
  const submitAutoWithdraw = async () => {
    setGlobalError('')
    const amountError = validateAmount(values.AMOUNT)
    if (amountError) { setGlobalError(amountError); return }

    // First-time account: require confirm account number match
    if (!hasExistingBankAccount) {
      if (!confirmAccountNumber) {
        setConfirmAccountNumberError('Please re-enter account number')
        return
      }
      if (confirmAccountNumber !== values.BANK_ACCOUNT_NO) {
        setConfirmAccountNumberError('Account number does not match')
        return
      }
      setConfirmAccountNumberError('')
    }

    const allowed = await reValidateFlags()
    if (!allowed) return

    const amount = parseInt(values.AMOUNT, 10)
    Alert.alert(
      'Confirm Withdrawal',
      `Account Holder: ${values.BANK_ACCOUNT_HOLDER_NAME}\n\nAccount No: ${values.BANK_ACCOUNT_NO}\n\nIFSC: ${values.BANK_IFSC}\n\nBank: ${values.BANK_NAME}\n\nAmount: ₹${amount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: () => postWithdrawalRequest(amount, {
            BANK_IFSC: values.BANK_IFSC,
            BANK_ACCOUNT_HOLDER_NAME: values.BANK_ACCOUNT_HOLDER_NAME,
            BANK_ACCOUNT_NO: values.BANK_ACCOUNT_NO,
            BANK_NAME: values.BANK_NAME,
          })
        },
      ],
    )
  }
  console.log({ isBlocked,autoWithdrawMode });
  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
      <GradientIconBar />

      <View style={styles.content}>
        {isInitLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.GOLD} />
          </View>
        ) : (
          <>
            {isBlocked && (
              <WithdrawBlockedOverlay
                message={adminDetails?.WITHDRAWAL_MONEY_DISABLE_MESSAGE ?? ''}
                onRefresh={() => fetchInitData(true)}
                isRefreshing={isOverlayRefreshing}
              />
            )}

            {!isBlocked && (
              <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
              >
                {/* Balance card */}
                <View style={styles.balanceCard}>
                  <CustomText style={styles.balanceLabel}>AVAILABLE BALANCE</CustomText>
                  <CustomText style={styles.balanceAmount}>₹{balance}</CustomText>
                  {adminDetails?.MIN_WITHDRAWAL ? (
                    <CustomText style={styles.minAmountText}>
                      Min withdrawal: ₹{adminDetails.MIN_WITHDRAWAL}
                    </CustomText>
                  ) : null}
                </View>

                <View style={styles.formContainer}>

                  {/* ── Manual mode: amount only ── */}
                  {autoWithdrawMode == 0 && (
                    <>
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>Enter Amount</CustomText>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="Enter amount to withdraw"
                          placeholderTextColor={Colors.WHITE_55}
                          keyboardType="number-pad"
                          maxLength={10}
                          value={manualAmount}
                          onChangeText={text => {
                            setGlobalError('')
                            const clean = text.replace(/[^0-9]/g, '')
                            if (clean.length == 0 || clean[0] !== '0') setManualAmount(clean)
                          }}
                        />
                      </View>

                      {globalError !== '' && (
                        <CustomText style={styles.globalError}>{globalError}</CustomText>
                      )}

                      <TouchableOpacity
                        style={styles.submitBtnWrapper}
                        onPress={handleManualSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#FFD700', '#E8900C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitBtnGradient}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator size="small" color={Colors.BLACK} />
                          ) : (
                            <CustomText style={styles.submitBtnText}>WITHDRAW</CustomText>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* ── Auto mode: full bank form ── */}
                  {autoWithdrawMode == 1 && (
                    <>
                      {/* Account Holder Name */}
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>Account Holder Name</CustomText>
                        <TextInput
                          style={[styles.inputBox, styles.inputBoxDisabled]}
                          placeholder="Account Holder Name"
                          placeholderTextColor={Colors.WHITE_55}
                          value={values.BANK_ACCOUNT_HOLDER_NAME}
                          onChangeText={handleChange('BANK_ACCOUNT_HOLDER_NAME')}
                          onBlur={handleBlur('BANK_ACCOUNT_HOLDER_NAME')}
                          editable={false}
                        />
                        {touched.BANK_ACCOUNT_HOLDER_NAME && errors.BANK_ACCOUNT_HOLDER_NAME && (
                          <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_HOLDER_NAME}</CustomText>
                        )}
                      </View>

                      {/* Bank Account Number */}
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>Bank Account Number</CustomText>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="Bank Account Number"
                          placeholderTextColor={Colors.WHITE_55}
                          keyboardType="numeric"
                          autoCapitalize="none"
                          maxLength={20}
                          secureTextEntry={!hasExistingBankAccount}
                          value={values.BANK_ACCOUNT_NO}
                          onChangeText={text => {
                            handleChange('BANK_ACCOUNT_NO')(text.replace(/[^0-9]/g, ''))
                          }}
                          onBlur={handleBlur('BANK_ACCOUNT_NO')}
                        />
                        {touched.BANK_ACCOUNT_NO && errors.BANK_ACCOUNT_NO && (
                          <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_NO}</CustomText>
                        )}
                      </View>

                      {/* Confirm Account Number (first-time only) */}
                      {!hasExistingBankAccount && (
                        <View style={styles.fieldGroup}>
                          <CustomText style={styles.inputLabel}>Confirm Account Number</CustomText>
                          <TextInput
                            style={styles.inputBox}
                            placeholder="Confirm Bank Account Number"
                            placeholderTextColor={Colors.WHITE_55}
                            keyboardType="numeric"
                            maxLength={20}
                            value={confirmAccountNumber}
                            onChangeText={text => {
                              setConfirmAccountNumberError('')
                              setConfirmAccountNumber(text.replace(/[^0-9]/g, ''))
                            }}
                          />
                          {confirmAccountNumberError !== '' && (
                            <CustomText style={styles.errorText}>{confirmAccountNumberError}</CustomText>
                          )}
                        </View>
                      )}

                      {/* IFSC Code */}
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>IFSC Code</CustomText>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="IFSC Code"
                          placeholderTextColor={Colors.WHITE_55}
                          autoCapitalize="characters"
                          value={values.BANK_IFSC}
                          onChangeText={handleChange('BANK_IFSC')}
                          onBlur={handleBlur('BANK_IFSC')}
                        />
                        {touched.BANK_IFSC && errors.BANK_IFSC && (
                          <CustomText style={styles.errorText}>{errors.BANK_IFSC}</CustomText>
                        )}
                      </View>

                      {/* Bank Name */}
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>Bank Name</CustomText>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="Bank Name"
                          placeholderTextColor={Colors.WHITE_55}
                          value={values.BANK_NAME}
                          onChangeText={handleChange('BANK_NAME')}
                          onBlur={handleBlur('BANK_NAME')}
                        />
                        {touched.BANK_NAME && errors.BANK_NAME && (
                          <CustomText style={styles.errorText}>{errors.BANK_NAME}</CustomText>
                        )}
                      </View>

                      <View style={styles.divider} />

                      {/* Amount */}
                      <View style={styles.fieldGroup}>
                        <CustomText style={styles.inputLabel}>Amount</CustomText>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="Enter amount"
                          placeholderTextColor={Colors.WHITE_55}
                          keyboardType="number-pad"
                          maxLength={5}
                          value={values.AMOUNT}
                          onChangeText={text => {
                            setGlobalError('')
                            handleChange('AMOUNT')(text)
                          }}
                          onBlur={handleBlur('AMOUNT')}
                        />
                        {touched.AMOUNT && errors.AMOUNT && (
                          <CustomText style={styles.errorText}>{errors.AMOUNT}</CustomText>
                        )}
                      </View>

                      {globalError !== '' && (
                        <CustomText style={styles.globalError}>{globalError}</CustomText>
                      )}

                      <TouchableOpacity
                        style={styles.submitBtnWrapper}
                        onPress={() => handleSubmit()}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#FFD700', '#E8900C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitBtnGradient}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator size="small" color={Colors.BLACK} />
                          ) : (
                            <CustomText style={styles.submitBtnText}>WITHDRAW</CustomText>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </KeyboardAwareScrollView>
            )}
          </>
        )}
      </View>
    </ImageBackground>
  )
}

export default Withdraw
