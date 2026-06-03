import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Colors } from '../utils/Colors';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { rf, rh, rw } from '../utils/responsive';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    iconEmoji?: string;
    confirmText?: string;
    cancelText?: string;
    confirmDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    title,
    message,
    iconEmoji = '❓',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmDanger = false,
    onConfirm,
    onCancel,
}) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 70,
                    friction: 10,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const confirmGradient: string[] = confirmDanger
        ? ['#7a0000', '#cc1100']
        : [Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <Pressable style={styles.backdrop} onPress={onCancel}>
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                    ]}
                >
                    {/* Stop backdrop tap from closing when user taps inside card */}
                    <Pressable>
                        {/* Gold top bar */}
                        <LinearGradient
                            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.topBar}
                        />

                        {/* Icon circle */}
                        <View style={styles.iconWrapper}>
                            <LinearGradient
                                colors={['rgba(255,215,0,0.18)', 'rgba(255,165,0,0.10)']}
                                style={styles.iconCircle}
                            >
                                <CustomText style={styles.iconEmoji}>{iconEmoji}</CustomText>
                            </LinearGradient>
                        </View>

                        {/* Title */}
                        <CustomText style={styles.title}>{title}</CustomText>

                        {/* Divider */}
                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.divider}
                        />

                        {/* Message */}
                        <CustomText style={styles.message}>{message}</CustomText>

                        {/* Action row */}
                        <View style={styles.actionRow}>
                            {/* Cancel */}
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={onCancel}
                                activeOpacity={0.75}
                            >
                                <CustomText style={styles.cancelText}>{cancelText}</CustomText>
                            </TouchableOpacity>

                            {/* Confirm */}
                            <TouchableOpacity
                                style={styles.confirmBtnWrapper}
                                onPress={onConfirm}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={confirmGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.confirmGradient}
                                >
                                    <CustomText style={styles.confirmText}>{confirmText}</CustomText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

export default ConfirmModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(7),
    },
    card: {
        width: '100%',
        backgroundColor: Colors.PRIMARY_BG,
        borderRadius: rh(2.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.22)',
        overflow: 'hidden',
    },
    topBar: {
        height: rh(0.55),
        width: '100%',
    },
    iconWrapper: {
        alignItems: 'center',
        marginTop: rh(2.8),
        marginBottom: rh(1.5),
    },
    iconCircle: {
        width: rw(18),
        height: rw(18),
        borderRadius: rw(9),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: rf(8),
    },
    title: {
        color: Colors.WHITE,
        fontSize: rf(5.2),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1.5),
        paddingHorizontal: rw(4),
    },
    divider: {
        height: 1,
        marginHorizontal: rw(6),
        borderRadius: 1,
        marginBottom: rh(1.5),
    },
    message: {
        color: Colors.WHITE_75,
        fontSize: rf(3.6),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        lineHeight: rh(2.8),
        paddingHorizontal: rw(5),
        marginBottom: rh(3),
    },
    actionRow: {
        flexDirection: 'row',
        gap: rw(3),
        paddingHorizontal: rw(5),
        paddingBottom: rh(3),
    },
    cancelBtn: {
        flex: 1,
        height: rh(6),
        borderRadius: rh(1),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: Colors.GOLD,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
    },
    confirmBtnWrapper: {
        flex: 1,
        height: rh(6),
        borderRadius: rh(1),
        overflow: 'hidden',
    },
    confirmGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        color: Colors.DARK_BROWN,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
    },
});
