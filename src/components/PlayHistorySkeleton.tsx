import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { rh, rw } from '../utils/responsive';

const ROW_COUNT = 6;

const SkeletonBox = ({ style }: { style: any }) => {
    const pulseAnim = useRef(new Animated.Value(0.35)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.35, duration: 750, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return <Animated.View style={[style, { opacity: pulseAnim }]} />;
};

const SkeletonCard: React.FC = () => (
    <View style={styles.card}>
        {/* Card image placeholder */}
        <SkeletonBox style={styles.imageBox} />

        {/* Middle: schedule name + category */}
        <View style={styles.middle}>
            <SkeletonBox style={styles.titleLine} />
            <SkeletonBox style={styles.subtitleLine} />
        </View>

        {/* Right: amount + badge */}
        <View style={styles.right}>
            <SkeletonBox style={styles.amountLine} />
            <SkeletonBox style={styles.badge} />
        </View>
    </View>
);

const PlayHistorySkeleton: React.FC = () => (
    <View style={styles.container}>
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: rw(3),
        paddingTop: rh(1),
        gap: rh(1.2),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(69,21,99,0.6)',
        borderRadius: rw(3),
        padding: rw(3),
        gap: rw(3),
    },
    imageBox: {
        width: rw(13),
        height: rw(13),
        borderRadius: rw(2),
        backgroundColor: '#5020A0',
    },
    middle: {
        flex: 1,
        gap: rh(0.8),
    },
    titleLine: {
        width: '80%',
        height: rh(1.8),
        borderRadius: 5,
        backgroundColor: '#5020A0',
    },
    subtitleLine: {
        width: '55%',
        height: rh(1.4),
        borderRadius: 5,
        backgroundColor: '#5020A0',
    },
    right: {
        alignItems: 'flex-end',
        gap: rh(0.8),
    },
    amountLine: {
        width: rw(14),
        height: rh(1.8),
        borderRadius: 5,
        backgroundColor: '#5020A0',
    },
    badge: {
        width: rw(14),
        height: rh(2.6),
        borderRadius: rw(4),
        backgroundColor: '#5020A0',
    },
});

export default PlayHistorySkeleton;
