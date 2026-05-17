import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    BackHandler,
    Platform,
    Animated,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';

interface Props {
    visible: boolean;
    reasons: string[];
}

const SecurityBlockModal: React.FC<Props> = ({ visible, reasons }) => {
    const blinkAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!visible) return;
        const blink = Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, { toValue: 0.15, duration: 500, useNativeDriver: true }),
                Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        );
        blink.start();
        return () => blink.stop();
    }, [visible, blinkAnim]);

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

                <View style={styles.ringOuter}>
                    <View style={styles.ringInner} />
                </View>

                <View style={styles.card}>
                    <LinearGradient
                        colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardTopBar}
                    />

                    {/* Blinking shield icon */}
                    <Animated.View style={[styles.iconCircle, { opacity: blinkAnim }]}>
                        <LinearGradient
                            colors={['#7a0000', '#cc1100']}
                            style={styles.iconGradient}
                        >
                            <CustomText style={styles.shieldIcon}>🛡️</CustomText>
                        </LinearGradient>
                    </Animated.View>

                    <CustomText style={styles.title}>Security Alert</CustomText>

                    <LinearGradient
                        colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />

                    <CustomText style={styles.subtitle}>
                        This device does not meet security requirements
                    </CustomText>

                    {/* Numbered reasons list */}
                    <View style={styles.reasonBox}>
                        <CustomText style={styles.reasonLabel}>
                            {reasons.length === 1 ? 'Issue Detected' : `Issues Detected (${reasons.length})`}
                        </CustomText>
                        <ScrollView
                            style={styles.reasonScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {reasons.map((r, i) => (
                                <View key={i} style={styles.reasonRow}>
                                    <View style={styles.reasonBadge}>
                                        <CustomText style={styles.reasonBadgeText}>{i + 1}</CustomText>
                                    </View>
                                    <CustomText style={styles.reasonText}>{r}</CustomText>
                                </View>
                            ))}
                        </ScrollView>
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
        marginBottom: rh(2),
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
        gap: rh(1),
        maxHeight: rh(28),
    },
    reasonLabel: {
        color: Colors.ORANGE,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[600],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: rh(0.5),
    },
    reasonScroll: {
        flexGrow: 0,
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: rw(2.5),
        marginBottom: rh(1),
    },
    reasonBadge: {
        width: rw(6),
        height: rw(6),
        borderRadius: rw(3),
        backgroundColor: 'rgba(200,0,0,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(255,80,80,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: rh(0.3),
        flexShrink: 0,
    },
    reasonBadgeText: {
        color: Colors.WHITE,
        fontSize: rf(2.8),
        fontFamily: FontFamilyWithWeight[700],
    },
    reasonText: {
        flex: 1,
        color: Colors.WHITE,
        fontSize: rf(3.6),
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
