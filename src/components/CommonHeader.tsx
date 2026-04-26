import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Images } from '../utils/Images'
import { rh, rw } from '../utils/responsive'
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight'
import { Fonts } from '../utils/Fontsizes'
import CustomText from './CustomText'
import { Colors } from '../utils/Colors'
import WalletStatusModal from './WalletStatusModal'

type CommonHeaderProps = {
    onMenuPress: () => void
    balance: string | number
    onPhonePress?: () => void
    onWhatsappPress?: () => void
}

const CommonHeader = ({ onMenuPress, balance, onPhonePress, onWhatsappPress }: CommonHeaderProps) => {
    const { top } = useSafeAreaInsets()
    const [showWalletModal, setShowWalletModal] = useState(false)

    return (
        <>
            <LinearGradient
                colors={Colors.GRADIENT.HEADER}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.container, { paddingTop: top }]}
            >
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.7}>
                    <Image source={Images.HAMBURGER} style={styles.hamburgerIcon} tintColor={Colors.WHITE} />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                {/* Wallet pill — tapping opens WalletStatusModal */}
                <TouchableOpacity
                    style={styles.walletPill}
                    activeOpacity={0.75}
                    onPress={() => setShowWalletModal(true)}
                >
                    <Image source={Images.WALLET} style={styles.walletIcon} />
                    <View style={styles.walletTextCol}>
                        <CustomText style={styles.balanceText}>{String(balance)}</CustomText>
                        <CustomText style={styles.walletLabel}>INR In Wallet</CustomText>
                    </View>
                </TouchableOpacity>

                {/* Right actions */}
                <View style={styles.rightActions}>
                    <TouchableOpacity onPress={onPhonePress} style={styles.actionBtn} activeOpacity={0.7}>
                        <Image source={Images.PHONE} style={styles.actionIcon} tintColor={Colors.WHITE} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onWhatsappPress} style={[styles.actionBtn, styles.whatsappBtn]} activeOpacity={0.7}>
                        <Image source={Images.WHATSAPP} style={styles.actionIcon} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Wallet Status Modal — rendered outside LinearGradient so it overlays the full screen */}
            <WalletStatusModal
                visible={showWalletModal}
                onClose={() => setShowWalletModal(false)}
            />
        </>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(3),
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    menuBtn: {
        padding: rw(1),
    },
    hamburgerIcon: {
        width: rh(4),
        height: rh(4),
        resizeMode: 'contain',
    },
    walletPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.OVERLAY_DARK,
        borderRadius: rh(1.5),
        borderWidth: 1,
        borderColor: Colors.BORDER_WHITE_12,
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.5),
        gap: rw(2),
    },
    walletIcon: {
        width: rh(3),
        height: rh(3),
        resizeMode: 'contain',
    },
    walletTextCol: {
        flexDirection: 'column',
    },
    balanceText: {
        color: Colors.WHITE,
        fontSize: Fonts.smaller,
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rh(2.4),
    },
    walletLabel: {
        color: Colors.WHITE_75,
        fontSize: Fonts.smallest,
        fontFamily: FontFamilyWithWeight[400],
        lineHeight: rh(1.8),
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
    },
    actionBtn: {
        width: rh(4.5),
        height: rh(4.5),
        borderRadius: rh(1),
        backgroundColor: Colors.OVERLAY_DARK,
        borderWidth: 1,
        borderColor: Colors.BORDER_WHITE_12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    whatsappBtn: {
        backgroundColor: Colors.WHITE,
        borderColor: Colors.TRANSPARENT,
    },
    actionIcon: {
        width: rh(2.8),
        height: rh(2.8),
        resizeMode: 'contain',
    },
})
