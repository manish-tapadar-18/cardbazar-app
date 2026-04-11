import React, { useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DemoStackParamList } from '../../types/NavigationStack';
import { useDemoStore } from '../../stores/demoStore';
import { Colors } from '../../utils/Colors';
import { rf, rh, rw } from '../../utils/responsive';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import CustomText from '../../components/CustomText';
import { Images } from '../../utils/Images';

type Nav = NativeStackNavigationProp<DemoStackParamList, 'SuccessOrder'>;
type Route = RouteProp<DemoStackParamList, 'SuccessOrder'>;

export default function SuccessOrder() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { totalAmount, itemCount } = route.params;
    const { address, clearDemo } = useDemoStore();

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const deliveryAddress = address.split(', ').slice(0, 4).join(', ');

    return (
        <LinearGradient colors={['#0D0120', '#1B0535', '#2D0A6E']} style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D0120" />

            {/* Background watermarks */}
            <CustomText style={[styles.bgSuit, { top: rh(5), left: rw(2) }]}>♠</CustomText>
            <CustomText style={[styles.bgSuit, { top: rh(12), right: rw(2), color: 'rgba(255,77,77,0.06)' }]}>♥</CustomText>
            <CustomText style={[styles.bgSuit, { bottom: rh(18), left: rw(0), color: 'rgba(255,77,77,0.05)' }]}>♦</CustomText>
            <CustomText style={[styles.bgSuit, { bottom: rh(10), right: rw(0) }]}>♣</CustomText>

            <View style={styles.content}>
                {/* Animated checkmark ring */}
                <Animated.View style={[styles.successRingOuter, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={[Colors.GOLD, Colors.ORANGE, Colors.GOLD]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.successRingGradient}
                    >
                        <View style={styles.successRingInner}>
                            <Image
                                source={Images.CIRCLE_CHECK}
                                style={styles.checkIcon}
                                resizeMode="contain"
                            />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Title */}
                <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
                    <CustomText style={styles.successTitle}>Order Placed!</CustomText>
                    <CustomText style={styles.successSubtitle}>
                        Your card games are on their way
                    </CustomText>
                </Animated.View>

                {/* Divider */}
                <LinearGradient
                    colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.divider}
                />

                {/* Order summary card */}
                <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
                    <CustomText style={styles.summaryTitle}>Order Summary</CustomText>

                    <View style={styles.summaryRow}>
                        <Image source={Images.SMALL_CARD} style={styles.rowIcon} resizeMode="contain" />
                        <CustomText style={styles.rowLabel}>
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} ordered
                        </CustomText>
                        <CustomText style={styles.rowValue}>
                            ₹{totalAmount.toLocaleString('en-IN')}
                        </CustomText>
                    </View>

                    <View style={styles.summaryRow}>
                        <Image source={Images.TAB_WALLET} style={styles.rowIcon} resizeMode="contain" />
                        <CustomText style={styles.rowLabel}>Payment method</CustomText>
                        <CustomText style={[styles.rowValue, { color: Colors.GOLD }]}>
                            Cash on Delivery
                        </CustomText>
                    </View>

                    <View style={styles.summaryRow}>
                        <Image source={Images.HOME} style={styles.rowIcon} resizeMode="contain" />
                        <CustomText style={styles.rowLabel} numberOfLines={1}>
                            {deliveryAddress || 'Address on file'}
                        </CustomText>
                    </View>

                    <LinearGradient
                        colors={['transparent', 'rgba(255,215,0,0.25)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.internalDivider}
                    />

                    <View style={styles.deliveryRow}>
                        <Image source={Images.CLOCK} style={styles.clockIcon} resizeMode="contain" />
                        <CustomText style={styles.deliveryText}>
                            Expected delivery in{' '}
                            <CustomText style={styles.deliveryHighlight}>5–7 business days</CustomText>
                        </CustomText>
                    </View>
                </Animated.View>

                {/* CTA buttons */}
                <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.reset({ index: 0, routes: [{ name: 'CardList' }] })
                        }
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryBtn}
                        >
                            <Image source={Images.SMALL_CARD} style={styles.btnIcon} resizeMode="contain" />
                            <CustomText style={styles.primaryBtnText}>Continue Shopping</CustomText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={clearDemo}
                        style={styles.logoutBtn}
                        activeOpacity={0.8}
                    >
                        <Image source={Images.LOGOUT} style={styles.logoutIcon} resizeMode="contain" />
                        <CustomText style={styles.logoutText}>Logout</CustomText>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    bgSuit: {
        position: 'absolute',
        fontSize: rf(22),
        color: 'rgba(255,255,255,0.04)',
        fontFamily: FontFamilyWithWeight[900],
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(5),
        gap: rh(2.5),
    },

    successRingOuter: {
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    successRingGradient: {
        width: rw(28),
        height: rw(28),
        borderRadius: rw(14),
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successRingInner: {
        flex: 1,
        width: '100%',
        borderRadius: rw(13),
        backgroundColor: '#1B0535',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        width: rw(14),
        height: rw(14),
        tintColor: Colors.GOLD,
    },

    titleSection: { alignItems: 'center', gap: rh(0.8) },
    successTitle: {
        color: Colors.WHITE,
        fontSize: rf(7),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.5,
    },
    successSubtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
    },

    divider: {
        height: 1,
        width: '100%',
    },

    summaryCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: rw(5),
        gap: rh(1.2),
    },
    summaryTitle: {
        color: Colors.GOLD,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
        marginBottom: rh(0.5),
        letterSpacing: 0.3,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
    },
    rowIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: Colors.WHITE_55,
    },
    rowLabel: {
        flex: 1,
        color: Colors.WHITE_55,
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[400],
    },
    rowValue: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[600],
    },
    internalDivider: {
        height: 1,
        marginVertical: rh(0.3),
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
    },
    clockIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: Colors.GREEN,
    },
    deliveryText: {
        flex: 1,
        color: Colors.WHITE_55,
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[400],
    },
    deliveryHighlight: {
        color: Colors.GREEN,
        fontFamily: FontFamilyWithWeight[600],
    },

    ctaSection: {
        width: '100%',
        gap: rh(1.5),
        alignItems: 'center',
    },
    primaryBtn: {
        borderRadius: 14,
        paddingVertical: rh(1.8),
        paddingHorizontal: rw(10),
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
    },
    btnIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE,
    },
    primaryBtnText: {
        color: Colors.WHITE,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[700],
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
        paddingVertical: rh(1),
        paddingHorizontal: rw(5),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,77,77,0.35)',
        backgroundColor: 'rgba(255,77,77,0.08)',
    },
    logoutIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: '#FF4D4D',
    },
    logoutText: {
        color: '#FF4D4D',
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[500],
    },
});
