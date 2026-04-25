import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { rh, rw } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_W = SCREEN_WIDTH / 3;
const ROW_COUNT = 10;

// ─── Single pulsing block ─────────────────────────────────────────────────────
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

// ─── One table row skeleton ───────────────────────────────────────────────────
const SkeletonRow: React.FC = () => (
    <View style={styles.row}>
        <View style={styles.cell}>
            <SkeletonBox style={styles.blockDate} />
        </View>
        <View style={styles.cell}>
            <SkeletonBox style={styles.blockStatus} />
        </View>
        <View style={styles.cell}>
            <SkeletonBox style={styles.blockAmount} />
        </View>
    </View>
);

// ─── Full skeleton list ───────────────────────────────────────────────────────
const TransactionSkeleton: React.FC = () => (
    <View style={styles.container}>
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <View key={i}>
                <SkeletonRow />
                {i < ROW_COUNT - 1 && <View style={styles.separator} />}
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: rh(1),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(1.4),
        paddingHorizontal: rw(2),
    },
    cell: {
        flex: 1,
        alignItems: 'center',
    },
    blockDate: {
        width: CELL_W * 0.65,
        height: rh(1.8),
        borderRadius: 6,
        backgroundColor: '#5020A0',
    },
    blockStatus: {
        width: CELL_W * 0.55,
        height: rh(1.8),
        borderRadius: 6,
        backgroundColor: '#5020A0',
    },
    blockAmount: {
        width: CELL_W * 0.45,
        height: rh(1.8),
        borderRadius: 6,
        backgroundColor: '#5020A0',
    },
    separator: {
        height: 1,
        marginHorizontal: rw(4),
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default TransactionSkeleton;
