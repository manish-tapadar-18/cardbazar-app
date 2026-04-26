import React from 'react'
import { Image, Modal, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../../../utils/Images'
import { Colors } from '../../../../utils/Colors'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'

interface Props {
  visible: boolean
  onOk: () => void
}

const PaymentStatusModal: React.FC<Props> = ({ visible, onOk }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>

        {/* Floating icon */}
        <View style={styles.modalIconWrap}>
          <View style={styles.modalGlowRing}>
            <LinearGradient
              colors={['#FFD700', '#E8900C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalIconCircle}
            >
              <Image source={Images.TAB_WALLET} style={styles.modalIcon} resizeMode="contain" />
            </LinearGradient>
          </View>
        </View>

        <CustomText style={styles.modalTitle}>PAYMENT STATUS</CustomText>

        <LinearGradient
          colors={['transparent', Colors.GOLD, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.modalDivider}
        />

        <CustomText style={styles.modalMessage}>
          Your payment request has been processed. It will be reflected in your wallet soon.
        </CustomText>

        <TouchableOpacity style={styles.modalOkBtn} onPress={onOk} activeOpacity={0.85}>
          <LinearGradient
            colors={['#FFD700', '#E8900C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalOkBtnGradient}
          >
            <CustomText style={styles.modalOkBtnText}>OK</CustomText>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  </Modal>
)

export default PaymentStatusModal
