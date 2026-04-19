import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    BackHandler,
    Platform,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';

interface Props {
    visible: boolean;
    reason: string;
}

const SecurityBlockModal: React.FC<Props> = ({ visible, reason }) => {
    const exitApp = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        }
    };

    return (
        <Modal
            visible={visible}
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

                {/* Decorative watermark ring */}
                <View style={styles.ringOuter}>
                    <View style={styles.ringInner} />
                </View>

                <View style={styles.card}>
                    {/* Gold gradient top bar */}
                    <LinearGradient
                        colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardTopBar}
                    />

                    {/* Shield / warning icon */}
                    <View style={styles.iconCircle}>
                        <LinearGradient
                            colors={['#7a0000', '#cc1100']}
                            style={styles.iconGradient}
                        >
                            <CustomText style={styles.shieldIcon}>🛡️</CustomText>
                        </LinearGradient>
                    </View>

                    <CustomText style={styles.title}>Security Alert</CustomText>

                    {/* Divider */}
                    <LinearGradient
                        colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />

                    <CustomText style={styles.subtitle}>
                        This device does not meet security requirements
                    </CustomText>

                    {/* Reason box */}
                    <View style={styles.reasonBox}>
                        <CustomText style={styles.reasonLabel}>Reason Detected</CustomText>
                        <CustomText style={styles.reasonText}>{reason}</CustomText>
                    </View>

                    <CustomText style={styles.footerNote}>
                        For your protection and the security of your account, CardBazar cannot run on this device.
                        Please resolve the issue and try again.
                    </CustomText>

                    {Platform.OS === 'android' && (
                        <CustomButton
                            title="Exit Application"
                            onPress={exitApp}
                            containerStyle={styles.exitButton}
                            textStyle={styles.exitButtonText}
                            gradientColors={['#7a0000', '#cc1100']}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default SecurityBlockModal;

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
    shieldIcon: {
        fontSize: rf(7),
    },
    title: {
        color: Colors.WHITE,
        fontSize: rf(7),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1),
    },
    divider: {
        height: 1,
        width: '80%',
        borderRadius: 1,
        marginBottom: rh(1.5),
    },
    subtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        marginBottom: rh(2.5),
        paddingHorizontal: rw(4),
    },
    reasonBox: {
        width: '88%',
        backgroundColor: 'rgba(200,0,0,0.12)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(200,0,0,0.3)',
        padding: rw(4),
        marginBottom: rh(2.5),
        gap: rh(0.8),
    },
    reasonLabel: {
        color: Colors.ORANGE,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[600],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    reasonText: {
        color: Colors.WHITE,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        lineHeight: rh(2.8),
    },
    footerNote: {
        color: Colors.WHITE_55,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        paddingHorizontal: rw(6),
        lineHeight: rh(2.5),
        marginBottom: rh(2.5),
    },
    exitButton: {
        width: '88%',
        height: rh(6.5),
        borderRadius: 12,
    },
    exitButtonText: {
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[600],
    },
});
