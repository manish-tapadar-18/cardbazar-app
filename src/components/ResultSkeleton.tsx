import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { rh, rw } from '../utils/responsive';

// ─── Pulsing box ──────────────────────────────────────────────────────────────
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

// ─── One result item inside a group ──────────────────────────────────────────
const SkeletonResultItem: React.FC<{ showDivider: boolean }> = ({ showDivider }) => (
  <>
    <View style={styles.item}>
      {/* Top row: card image + card name */}
      <View style={styles.topRow}>
        <SkeletonBox style={styles.cardImage} />
        <View style={styles.cardNameWrapper}>
          <SkeletonBox style={styles.cardNameLine1} />
          <SkeletonBox style={styles.cardNameLine2} />
        </View>
      </View>

      {/* Separator */}
      <SkeletonBox style={styles.separator} />

      {/* LV rows */}
      <View style={styles.lvRow}>
        <SkeletonBox style={styles.lvLabel} />
        <SkeletonBox style={styles.lvValue} />
      </View>
      <View style={styles.lvRow}>
        <SkeletonBox style={styles.lvLabel} />
        <SkeletonBox style={styles.lvValueShort} />
      </View>

      {/* Pair row: start time | end time */}
      <View style={styles.pairRow}>
        <View style={styles.pairCell}>
          <SkeletonBox style={styles.pairLabel} />
          <SkeletonBox style={styles.pairValue} />
        </View>
        <View style={styles.pairSep} />
        <View style={styles.pairCell}>
          <SkeletonBox style={styles.pairLabel} />
          <SkeletonBox style={styles.pairValue} />
        </View>
      </View>
    </View>

    {showDivider && <SkeletonBox style={styles.groupDivider} />}
  </>
);

// ─── One date group ───────────────────────────────────────────────────────────
const SkeletonGroup: React.FC<{ itemCount: number }> = ({ itemCount }) => (
  <View style={styles.groupWrapper}>
    {/* Date badge */}
    <SkeletonBox style={styles.dateBadge} />

    {/* Card body */}
    <View style={styles.groupCard}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <SkeletonResultItem key={i} showDivider={i < itemCount - 1} />
      ))}
    </View>
  </View>
);

// ─── Full skeleton ────────────────────────────────────────────────────────────
const ResultSkeleton: React.FC = () => (
  <View style={styles.container}>
    <SkeletonGroup itemCount={2} />
    <SkeletonGroup itemCount={1} />
    <SkeletonGroup itemCount={2} />
  </View>
);

export default ResultSkeleton;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: rw(3),
    paddingTop: rh(1.5),
    gap: rh(2),
  },
  groupWrapper: {
    gap: 0,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    width: rw(28),
    height: rh(3.2),
    borderRadius: rh(0.8),
    backgroundColor: '#5020A0',
    marginBottom: -rh(1.5),
    marginLeft: rw(3),
    zIndex: 1,
  },
  groupCard: {
    backgroundColor: 'rgba(38,0,48,0.85)',
    borderRadius: rw(3),
    paddingHorizontal: rw(4),
    paddingTop: rh(3),
    paddingBottom: rh(2),
    gap: 0,
  },
  item: {
    gap: rh(1.2),
    paddingBottom: rh(1),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  cardImage: {
    width: rw(14),
    height: rh(8),
    borderRadius: rw(2),
    backgroundColor: '#5020A0',
  },
  cardNameWrapper: {
    flex: 1,
    gap: rh(0.8),
  },
  cardNameLine1: {
    width: '75%',
    height: rh(2),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  cardNameLine2: {
    width: '50%',
    height: rh(2),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#5020A0',
    borderRadius: 1,
  },
  lvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: rw(3),
  },
  lvLabel: {
    width: rw(24),
    height: rh(1.6),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  lvValue: {
    flex: 1,
    height: rh(1.6),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  lvValueShort: {
    width: rw(22),
    height: rh(1.6),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairCell: {
    flex: 1,
    gap: rh(0.6),
  },
  pairLabel: {
    width: rw(18),
    height: rh(1.4),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  pairValue: {
    width: rw(22),
    height: rh(1.8),
    borderRadius: 4,
    backgroundColor: '#5020A0',
  },
  pairSep: {
    width: 1,
    height: rh(5),
    backgroundColor: 'rgba(80,32,160,0.4)',
    marginHorizontal: rw(3),
  },
  groupDivider: {
    height: 1,
    marginVertical: rh(1.2),
    backgroundColor: '#5020A0',
    borderRadius: 1,
  },
});
