import React, { useState } from 'react';
import {
    ActivityIndicator,
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

interface MultiLoginModalProps {
    onRefresh?: () => Promise<void>;
}

const MultiLoginModal: React.FC<MultiLoginModalProps> = ({ onRefresh }) => {
    const { isMultiLoginVisible } = useDeviceModalStore();
    const { adminDetails } = useAdminDetailsStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const handleRefresh = async () => {
        if (!onRefresh || isRefreshing) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
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
                        <CustomText style={styles.messageLabel}>⚠  Account Conflict</CustomText>
                        <CustomText style={styles.messageText}>
                            Your account is currently active on another device. Only one session is allowed at a time.
                        </CustomText>
                        <View style={styles.messageTip}>
                            <CustomText style={styles.messageTipText}>
                                If you just logged in, tap Refresh Status below to re-verify your session.
                            </CustomText>
                        </View>
                    </View>

                    {/* Refresh Status Button */}
                    <TouchableOpacity
                        style={[styles.refreshBtn, isRefreshing && styles.refreshBtnDisabled]}
                        onPress={handleRefresh}
                        activeOpacity={0.8}
                        disabled={isRefreshing}
                    >
                        <LinearGradient
                            colors={isRefreshing
                                ? ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.04)']
                                : ['rgba(99,60,180,0.55)', 'rgba(60,20,120,0.75)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.refreshBtnInner}
                        >
                            {isRefreshing ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color={Colors.GOLD}
                                        style={styles.refreshSpinner}
                                    />
                                    <CustomText style={styles.refreshBtnText}>Checking Status…</CustomText>
                                </>
                            ) : (
                                <CustomText style={styles.refreshBtnText}>🔄  Refresh Status</CustomText>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Action Buttons */}
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
                                <CustomText style={styles.btnIcon}>📞</CustomText>
                                <CustomText style={styles.btnTextDark}>Support</CustomText>
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
                                <CustomText style={styles.btnIcon}>🚪</CustomText>
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
        fontSize: rf(6.5),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        letterSpacing: 1,
    },
    titleAccent: {
        color: Colors.GOLD,
        fontSize: rf(6.5),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1.5),
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        width: '80%',
        borderRadius: 1,
        marginBottom: rh(2),
    },
    messageBox: {
        width: '88%',
        backgroundColor: 'rgba(200,0,0,0.08)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(200,0,0,0.22)',
        paddingHorizontal: rw(4),
        paddingTop: rh(1.6),
        paddingBottom: rh(1.8),
        marginBottom: rh(2),
    },
    messageLabel: {
        color: '#ff6666',
        fontSize: rf(3.4),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.6,
        marginBottom: rh(0.8),
    },
    messageText: {
        color: Colors.WHITE_75,
        fontSize: rf(3.7),
        fontFamily: FontFamilyWithWeight[400],
        lineHeight: rh(2.8),
        letterSpacing: 0.2,
    },
    messageTip: {
        marginTop: rh(1.2),
        paddingTop: rh(1),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    messageTipText: {
        color: 'rgba(255,215,0,0.6)',
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[400],
        letterSpacing: 0.2,
        lineHeight: rh(2.6),
    },

    /* Refresh button */
    refreshBtn: {
        width: '88%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: rh(2),
        borderWidth: 1,
        borderColor: 'rgba(150,100,255,0.4)',
        elevation: 3,
        shadowColor: '#9060ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    refreshBtnDisabled: {
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 0,
    },
    refreshBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: rh(1.7),
    },
    refreshSpinner: {
        marginRight: rw(2),
    },
    refreshBtnText: {
        color: Colors.WHITE,
        fontSize: rf(3.7),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.5,
    },

    /* Action buttons */
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
        flexDirection: 'row',
        gap: rw(1.5),
    },
    btnIcon: {
        fontSize: rf(3.4),
    },
    btnTextDark: {
        color: Colors.BLACK,
        fontSize: rf(3.6),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.4,
    },
    btnTextLight: {
        color: Colors.WHITE,
        fontSize: rf(3.6),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.4,
    },
});
