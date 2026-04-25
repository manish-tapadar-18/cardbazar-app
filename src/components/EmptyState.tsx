import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';

interface EmptyStateProps {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ image, title, subtitle }) => (
    <View style={styles.container}>
        {/* Glow ring behind image */}
        <View style={styles.glowRing}>
            <LinearGradient
                colors={['rgba(160,22,230,0.18)', 'rgba(255,215,0,0.08)', 'transparent']}
                style={styles.glowGradient}
            />
            <Image source={image} style={styles.image} resizeMode="contain" />
        </View>

        {/* Divider line */}
        <LinearGradient
            colors={['transparent', Colors.GOLD, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
        />

        <CustomText style={styles.title}>{title}</CustomText>
        {!!subtitle && <CustomText style={styles.subtitle}>{subtitle}</CustomText>}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: rh(6),
        paddingHorizontal: rw(8),
    },
    glowRing: {
        width: rw(45),
        height: rw(45),
        borderRadius: rw(22.5),
        borderWidth: 1.5,
        borderColor: 'rgba(255,215,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: rh(3),
        overflow: 'hidden',
    },
    glowGradient: {
        ...StyleSheet.absoluteFill,
    },
    image: {
        width: rw(28),
        height: rw(28),
        tintColor: 'rgba(255,215,0,0.45)',
    },
    divider: {
        width: rw(40),
        height: 1,
        marginBottom: rh(2.5),
    },
    title: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.WHITE_75,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: FontFamilyWithWeight[400],
        fontSize: rf(4),
        color: Colors.WHITE_55,
        marginTop: rh(0.8),
        textAlign: 'center',
        lineHeight: rh(2.4),
    },
});

export default EmptyState;
