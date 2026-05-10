import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';

interface Props {
    visible: boolean;
    onDeny: () => void;
    onAllow: () => void;
}

const FEATURE_TAGS = ['Game Results', 'Wallet Updates', 'Offers & Deals'];

const PushNotificationPermissionModal: React.FC<Props> = ({ visible, onDeny, onAllow }) => {
    const scale = useRef(new Animated.Value(0.82)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    tension: 55,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scale.setValue(0.82);
            opacity.setValue(0);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onDeny}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>

                    {/* ── Bell icon ─────────────────────────────────────────── */}
                    <View style={styles.iconArea}>
                        {/* Outer glow ring */}
                        <View style={styles.glowRing} />
                        <LinearGradient
                            colors={['#B8860B', '#FFD700', '#FFA500', '#E8900C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconCircle}
                        >
                            <CustomText style={styles.bellEmoji}>🔔</CustomText>
                        </LinearGradient>
                    </View>

                    {/* ── Title ─────────────────────────────────────────────── */}
                    <CustomText style={styles.title}>Stay in the Loop!</CustomText>

                    {/* ── Gold divider ──────────────────────────────────────── */}
                    <LinearGradient
                        colors={['transparent', Colors.GOLD, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.divider}
                    />

                    {/* ── Description ──────────────────────────────────────── */}
                    <CustomText style={styles.subtitle}>
                        Enable notifications to get instant alerts for game results, wallet
                        transactions and exclusive offers — never miss a moment!
                    </CustomText>

                    {/* ── Feature tags ──────────────────────────────────────── */}
                    <View style={styles.tagsRow}>
                        {FEATURE_TAGS.map(tag => (
                            <LinearGradient
                                key={tag}
                                colors={['rgba(255,215,0,0.14)', 'rgba(255,215,0,0.06)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.tag}
                            >
                                <View style={styles.tagDot} />
                                <CustomText style={styles.tagText}>{tag}</CustomText>
                            </LinearGradient>
                        ))}
                    </View>

                    {/* ── Buttons ───────────────────────────────────────────── */}
                    <View style={styles.buttonsRow}>

                        {/* Not Now */}
                        <TouchableOpacity
                            style={styles.denyBtn}
                            onPress={onDeny}
                            activeOpacity={0.72}
                        >
                            <CustomText style={styles.denyText}>Not Now</CustomText>
                        </TouchableOpacity>

                        {/* Allow */}
                        <TouchableOpacity
                            style={styles.allowWrapper}
                            onPress={onAllow}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#FFD700', '#FFA500', '#E8900C']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.allowBtn}
                            >
                                <CustomText style={styles.allowText}>Allow</CustomText>
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default PushNotificationPermissionModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(4,0,14,0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: rw(6),
    },
    card: {
        width: '100%',
        backgroundColor: '#130338',
        borderRadius: rh(2.8),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.28)',
        paddingHorizontal: rw(6),
        paddingBottom: rh(3.5),
        paddingTop: rh(2),
        alignItems: 'center',
        elevation: 24,
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        overflow: 'hidden',
    },

    // ── Bell icon
    iconArea: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: rh(1),
        marginBottom: rh(2.2),
    },
    glowRing: {
        position: 'absolute',
        width: rw(22),
        height: rw(22),
        borderRadius: rw(11),
        backgroundColor: 'rgba(255,215,0,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.18)',
    },
    iconCircle: {
        width: rw(17),
        height: rw(17),
        borderRadius: rw(8.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    bellEmoji: {
        fontSize: rf(7.5),
        lineHeight: rw(13),
        includeFontPadding: false,
    },

    // ── Text
    title: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(5.5),
        color: Colors.WHITE,
        letterSpacing: 0.4,
        textAlign: 'center',
        marginBottom: rh(1.6),
    },
    divider: {
        width: '80%',
        height: 1,
        borderRadius: 1,
        marginBottom: rh(1.8),
    },
    subtitle: {
        fontFamily: FontFamilyWithWeight[400],
        fontSize: rf(3.4),
        color: Colors.WHITE_75,
        textAlign: 'center',
        lineHeight: rh(2.8),
        marginBottom: rh(2.2),
    },

    // ── Feature tags
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: rw(2),
        marginBottom: rh(3),
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: rh(3),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.22)',
        paddingVertical: rh(0.7),
        paddingHorizontal: rw(3.5),
        gap: rw(1.5),
    },
    tagDot: {
        width: rw(1.6),
        height: rw(1.6),
        borderRadius: rw(0.8),
        backgroundColor: Colors.GOLD,
    },
    tagText: {
        fontFamily: FontFamilyWithWeight[500],
        fontSize: rf(2.8),
        color: Colors.GOLD,
    },

    // ── Buttons
    buttonsRow: {
        flexDirection: 'row',
        width: '100%',
        gap: rw(3),
    },
    denyBtn: {
        flex: 1,
        height: rh(6.5),
        borderRadius: rh(1.4),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    denyText: {
        fontFamily: FontFamilyWithWeight[600],
        fontSize: rf(3.4),
        color: Colors.WHITE_55,
    },
    allowWrapper: {
        flex: 1,
        borderRadius: rh(1.4),
        overflow: 'hidden',
        elevation: 6,
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    allowBtn: {
        height: rh(6.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    allowText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(3.4),
        color: Colors.BLACK,
        letterSpacing: 0.3,
    },
});
