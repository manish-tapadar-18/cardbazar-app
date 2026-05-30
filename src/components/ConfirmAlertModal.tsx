import React from 'react'
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '../utils/Colors'
import { rf, rh, rw } from '../utils/responsive'
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight'
import CustomText from './CustomText'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ConfirmAlertRow {
  label: string
  value: string
}

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  message?: string
  rows?: ConfirmAlertRow[]
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

// ─── ConfirmAlertModal ────────────────────────────────────────────────────────
const ConfirmAlertModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  message,
  rows,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  onConfirm,
}) => {
  const handleConfirm = () => {
    onClose()
    onConfirm()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.inner}>
          <View style={styles.card}>

            {/* ── Gold gradient header ───────────────────────────────── */}
            <LinearGradient
              colors={['#B8860B', '#FFD700', '#FFA500', '#B8860B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <CustomText style={styles.headerTitle}>{title}</CustomText>
            </LinearGradient>

            {/* ── Body ──────────────────────────────────────────────── */}
            <View style={styles.body}>
              {message ? (
                <CustomText style={styles.message}>{message}</CustomText>
              ) : null}

              {rows && rows.length > 0 && (
                <View style={styles.rowsContainer}>
                  {rows.map((row, index) => (
                    <View key={index} style={styles.dataRow}>
                      <CustomText style={styles.rowLabel}>{row.label}</CustomText>
                      <LinearGradient
                        colors={['rgba(255,215,0,0.08)', 'rgba(255,215,0,0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.rowValueBox}
                      >
                        <View style={styles.rowAccentBar} />
                        <CustomText style={styles.rowValue} numberOfLines={1}>
                          {row.value}
                        </CustomText>
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── Gold divider ───────────────────────────────────────── */}
            <LinearGradient
              colors={['transparent', Colors.GOLD, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.divider}
            />

            {/* ── Action buttons ─────────────────────────────────────── */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <CustomText style={styles.cancelBtnText} numberOfLines={1}>
                  {cancelText}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FFD700', '#E8900C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmGradient}
                >
                  <CustomText style={styles.confirmBtnText} numberOfLines={1}>
                    {confirmText}
                  </CustomText>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default ConfirmAlertModal

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,0,14,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rw(6),
  },
  inner: {
    width: '100%',
  },
  card: {
    backgroundColor: '#130338',
    borderRadius: rh(2),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    overflow: 'hidden',
    elevation: 24,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  header: {
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(5),
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.BLACK,
    fontSize: rf(4.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: rw(5),
    paddingTop: rh(2.2),
    paddingBottom: rh(1.8),
  },
  message: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[500],
    lineHeight: rf(6.5),
    textAlign: 'center',
  },
  rowsContainer: {
    gap: rh(1.4),
  },
  dataRow: {},
  rowLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[500],
    letterSpacing: 0.6,
    marginBottom: rh(0.4),
    paddingLeft: rw(1),
  },
  rowValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rh(0.8),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(3),
    gap: rw(2.5),
    overflow: 'hidden',
  },
  rowAccentBar: {
    width: rw(0.8),
    height: rh(2.5),
    borderRadius: rw(0.4),
    backgroundColor: Colors.GOLD,
  },
  rowValue: {
    flex: 1,
    color: Colors.GOLD,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    marginHorizontal: rw(4),
    marginBottom: rh(2.2),
    borderRadius: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: rw(3),
    paddingHorizontal: rw(4),
    paddingBottom: rh(3),
  },
  btn: {
    flex: 1,
    height: rh(6),
    borderRadius: rh(1.2),
    overflow: 'hidden',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  confirmGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
    textAlign: 'center',
  },
})
