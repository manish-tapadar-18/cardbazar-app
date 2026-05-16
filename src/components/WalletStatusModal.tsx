import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Images } from '../utils/Images'
import { Colors } from '../utils/Colors'
import { rh, rw, rf } from '../utils/responsive'
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight'
import CustomText from './CustomText'
import { Repository } from '../repository/Repository'
import { Toast } from '../utils/toast'
import { useUserStore } from '../stores/userStore'
import { useWalletStore } from '../stores/walletStore'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean
  onClose: () => void
}

// ─── Data Row ─────────────────────────────────────────────────────────────────
const DataRow: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label,
  value,
  accent = Colors.GOLD,
}) => (
  <View style={styles.dataRow}>
    <CustomText style={styles.dataLabel}>{label}</CustomText>
    <LinearGradient
      colors={['rgba(255,215,0,0.06)', 'rgba(255,215,0,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.dataBox}
    >
      <View style={[styles.dataAccentBar, { backgroundColor: accent }]} />
      <CustomText style={[styles.dataValue, { color: accent }]}>₹ {value}</CustomText>
    </LinearGradient>
  </View>
)

// ─── WalletStatusModal ────────────────────────────────────────────────────────
const WalletStatusModal: React.FC<Props> = ({ visible, onClose }) => {
  const { userDetails } = useUserStore()
  const { balance, pendingWithdrawal, pendingRequest, setWallet } = useWalletStore()
  const navigation = useNavigation<any>()

  const [isLoading, setIsLoading] = useState(false)
  const [isMoveLoading, setIsMoveLoading] = useState(false)

  // ── Navigate to AddMoney ──────────────────────────────────────────────────
  const handleAddMoney = () => {
    onClose()
    navigation.navigate('MainTabs', {
      screen: 'AddMoneyTab',
      params: { screen: 'AddMoney' },
    })
  }

  // ── Fetch fresh balance whenever modal opens ───────────────────────────────
  const fetchBalance = useCallback(async () => {
    const userId = userDetails?.ID
    if (!userId) return
    try {
      setIsLoading(true)
      const { isSuccess, data } = await Repository.User.getUserBalance(userId)
      if (isSuccess && data) setWallet(data)
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to refresh balance.', { placement: 'bottom', duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  }, [userDetails?.ID])

  useEffect(() => {
    if (visible) fetchBalance()
  }, [visible])

  // ── Move to wallet ─────────────────────────────────────────────────────────
  const handleMoveToWallet = async () => {
    const userId = userDetails?.ID
    if (!userId) return
    try {
      setIsMoveLoading(true)
      const { isSuccess, message } = await Repository.User.updateWithdrawalRequestUser(userId)
      if (isSuccess) {
        await fetchBalance()
        Toast.success('Moved to wallet successfully!', { placement: 'bottom', duration: 2500 })
      } else {
        Toast.error(message ?? 'Failed to move to wallet.', { placement: 'bottom', duration: 3000 })
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.', { placement: 'bottom', duration: 3000 })
    } finally {
      setIsMoveLoading(false)
    }
  }

  const hasPendingWithdrawal = pendingWithdrawal > 0
  const hasPendingRequest = pendingRequest > 0

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>

            {/* ── Drag handle ───────────────────────────────────────── */}
            <View style={styles.dragHandle} />

            {/* ── Gold gradient header ──────────────────────────────── */}
            <LinearGradient
              colors={['#B8860B', '#FFD700', '#FFA500', '#B8860B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerStrip}
            >
              <View style={styles.headerIconCircle}>
                <Image source={Images.WALLET} style={styles.headerIcon} resizeMode="contain" />
              </View>
              <CustomText style={styles.headerTitle}>WALLET STATUS</CustomText>
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={Colors.BLACK}
                  style={styles.headerLoader}
                />
              )}
            </LinearGradient>

            {/* ── Data rows ─────────────────────────────────────────── */}
            <View style={styles.body}>
              <DataRow label="WALLET BALANCE" value={balance} accent={Colors.GOLD} />
              <DataRow label="PENDING WITHDRAWAL" value={pendingWithdrawal} accent="#E8900C" />
              <DataRow label="PENDING REQUEST" value={pendingRequest} accent="#A78BFA" />

              {/* ── Pending request warning ──────────────────────── */}
              {hasPendingRequest && (
                <View style={styles.warningRow}>
                  <LinearGradient
                    colors={['rgba(167,139,250,0.12)', 'rgba(167,139,250,0.04)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.warningCard}
                  >
                    <View style={styles.warningDot} />
                    <CustomText style={styles.warningText}>
                      Please wait 10 minutes for approval!
                    </CustomText>
                    <TouchableOpacity
                      style={styles.reloadBtn}
                      onPress={fetchBalance}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading
                        ? <ActivityIndicator size="small" color={Colors.WHITE} />
                        : <CustomText style={styles.reloadBtnText}>↻</CustomText>
                      }
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              {/* ── Gold divider ─────────────────────────────────── */}
              <LinearGradient
                colors={['transparent', Colors.GOLD, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.divider}
              />

              {/* ── Action buttons ────────────────────────────────── */}
              <View style={[
                styles.actionsRow,
                !hasPendingWithdrawal && styles.actionsRowTwoCol,
              ]}>

                {/* Add Money */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnFlex]}
                  onPress={handleAddMoney}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#FFD700', '#E8900C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionBtnGradient}
                  >
                    <Image source={Images.ADD_MONEY} style={styles.actionBtnIcon} resizeMode="contain" />
                    <CustomText style={styles.actionBtnText}>ADD MONEY</CustomText>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Move To Wallet (conditional) */}
                {hasPendingWithdrawal && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnFlex]}
                    onPress={handleMoveToWallet}
                    disabled={isMoveLoading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#4C1D95', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionBtnGradient}
                    >
                      {isMoveLoading
                        ? <ActivityIndicator size="small" color={Colors.WHITE} />
                        : <>
                            <Image source={Images.TAB_WALLET} style={[styles.actionBtnIcon, { tintColor: Colors.WHITE }]} resizeMode="contain" />
                            <CustomText style={[styles.actionBtnText, { color: Colors.WHITE }]}>MOVE TO WALLET</CustomText>
                          </>
                      }
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Cancel */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnFlex, styles.cancelBtn]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <CustomText style={styles.cancelBtnText}>CANCEL</CustomText>
                </TouchableOpacity>

              </View>
            </View>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default WalletStatusModal

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Backdrop — tapping outside closes
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,0,14,0.82)',
    justifyContent: 'flex-end',
  },

  // Bottom sheet card
  sheet: {
    backgroundColor: '#130338',
    borderTopLeftRadius: rh(3),
    borderTopRightRadius: rh(3),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderBottomWidth: 0,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  // Drag handle
  dragHandle: {
    width: rw(12),
    height: rh(0.55),
    borderRadius: rh(0.3),
    backgroundColor: 'rgba(255,215,0,0.3)',
    alignSelf: 'center',
    marginTop: rh(1.2),
    marginBottom: rh(0.8),
  },

  // Header gradient strip
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rh(1.6),
    paddingHorizontal: rw(5),
    gap: rw(3),
    marginHorizontal: rw(4),
    borderRadius: rh(1.2),
    marginBottom: rh(2),
  },
  headerIconCircle: {
    width: rw(9),
    height: rw(9),
    borderRadius: rw(4.5),
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: rw(5),
    height: rw(5),
    tintColor: Colors.BLACK,
  },
  headerTitle: {
    flex: 1,
    color: Colors.BLACK,
    fontSize: rf(4.5),
    fontWeight:"bold",
    letterSpacing: 2,
  },
  headerLoader: {
    marginLeft: rw(2),
  },

  // Body
  body: {
    paddingHorizontal: rw(4),
    paddingBottom: rh(3.5),
  },

  // Data row
  dataRow: {
    marginBottom: rh(1.8),
  },
  dataLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[500],
    letterSpacing: 0.8,
    marginBottom: rh(0.6),
    paddingLeft: rw(1),
  },
  dataBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    paddingVertical: rh(1.4),
    paddingHorizontal: rw(3),
    gap: rw(3),
    overflow: 'hidden',
  },
  dataAccentBar: {
    width: rw(1),
    height: rh(3),
    borderRadius: rw(0.5),
  },
  dataValue: {
    fontSize: rf(4.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },

  // Pending request warning
  warningRow: {
    marginBottom: rh(1.8),
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(3),
    gap: rw(2.5),
    overflow: 'hidden',
  },
  warningDot: {
    width: rw(2),
    height: rw(2),
    borderRadius: rw(1),
    backgroundColor: '#A78BFA',
  },
  warningText: {
    flex: 1,
    color: '#C4B5FD',
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[500],
    letterSpacing: 0.2,
  },
  reloadBtn: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(4),
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadBtnText: {
    color: '#C4B5FD',
    fontSize: rf(5),
    fontWeight:"bold"
  },

  // Gold divider
  divider: {
    height: 1,
    marginBottom: rh(2.5),
    borderRadius: 1,
  },

  // Actions row
  actionsRow: {
    flexDirection: 'row',
    gap: rw(2.5),
  },
  actionsRowTwoCol: {
    gap: rw(3),
  },
  actionBtn: {
    borderRadius: rh(1.2),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionBtnFlex: {
    flex: 1,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(1.8),
    gap: rw(1.5),
  },
  actionBtnIcon: {
    width: rw(5),
    height: rw(5),
    tintColor: Colors.BLACK,
  },
  actionBtnText: {
    color: Colors.BLACK,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    elevation: 0,
    shadowOpacity: 0,
  },
  cancelBtnText: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingVertical: rh(1.8),
  },
})
