import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Linking,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { useDeviceModalStore } from '../stores/deviceModalStore';
import { useAdminDetailsStore } from '../stores/adminDetailsStore';
import { clearAllStores } from '../stores/clearAllStores';
import { useSwitchStackStore } from '../stores/switchStackStore';

const MultiLoginModal: React.FC = () => {
    const { isMultiLoginVisible } = useDeviceModalStore();
    const { adminDetails } = useAdminDetailsStore();

    const handleCallSupport = () => {
        const phone = adminDetails?.DEVICE_SUPPORT_NUMBER || adminDetails?.MOBILE;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const handleLogout = () => {
        clearAllStores();
        useSwitchStackStore.getState().setAuthStatus(false);
    };

    return (
        <Modal
            visible={isMultiLoginVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#1B0535', '#2D0A6E', '#3A0D7A']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Decorative rings */}
                <View style={styles.ringOuter}>
                    <View style={styles.ringInner} />
                </View>

                <View style={styles.card}>
                    {/* Red top accent bar */}
                    <LinearGradient
                        colors={['#cc0000', '#ff4400']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardTopBar}
                    />

                    {/* Icon */}
                    <View style={styles.iconCircle}>
                        <LinearGradient
                            colors={['#7a0000', '#cc1100']}
                            style={styles.iconGradient}
                        >
                            <CustomText style={styles.icon}>👥</CustomText>
                        </LinearGradient>
                    </View>

                    <CustomText style={styles.title}>Multiple Login</CustomText>
                    <CustomText style={styles.titleAccent}>Detected.</CustomText>

                    <LinearGradient
                        colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />

                    <View style={styles.messageBox}>
                        <CustomText style={styles.messageText}>
                            Your account is currently active on another device. Please contact support.
                        </CustomText>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsRow}>
                        {/* Call Customer Care */}
                        <TouchableOpacity
                            style={[styles.btn, styles.btnFlex]}
                            onPress={handleCallSupport}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[Colors.GOLD_DARK, Colors.GOLD, Colors.ORANGE]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <CustomText style={styles.btnTextDark}>📞 Support</CustomText>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Logout */}
                        <TouchableOpacity
                            style={[styles.btn, styles.btnFlex]}
                            onPress={handleLogout}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#7a0000', '#cc1100']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <CustomText style={styles.btnTextLight}>Logout</CustomText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default MultiLoginModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(6),
    },
    ringOuter: {
        position: 'absolute',
        width: rw(90),
        height: rw(90),
        borderRadius: rw(45),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringInner: {
        width: rw(70),
        height: rw(70),
        borderRadius: rw(35),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.05)',
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        paddingBottom: rh(3.5),
        alignItems: 'center',
    },
    cardTopBar: {
        width: '100%',
        height: rh(0.6),
    },
    iconCircle: {
        marginTop: rh(3),
        marginBottom: rh(2),
        borderRadius: rw(10),
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#cc1100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    iconGradient: {
        width: rw(18),
        height: rw(18),
        borderRadius: rw(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: rf(7),
    },
    title: {
        color: Colors.WHITE,
        fontSize: rf(7),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    titleAccent: {
        color: Colors.GOLD,
        fontSize: rf(7),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1.5),
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        width: '80%',
        borderRadius: 1,
        marginBottom: rh(2),
    },
    messageBox: {
        width: '88%',
        backgroundColor: 'rgba(200,0,0,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(200,0,0,0.25)',
        padding: rw(4),
        marginBottom: rh(2.5),
        alignItems: 'center',
    },
    messageText: {
        color: Colors.WHITE_75,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        lineHeight: rh(2.8),
    },
    buttonsRow: {
        flexDirection: 'row',
        width: '88%',
        gap: rw(3),
    },
    btn: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    btnFlex: {
        flex: 1,
    },
    btnGradient: {
        paddingVertical: rh(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTextDark: {
        color: Colors.BLACK,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.3,
    },
    btnTextLight: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.3,
    },
});
