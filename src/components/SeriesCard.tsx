import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Fonts } from '../utils/Fontsizes';
import { Colors } from '../utils/Colors';

export type SeriesDetail = {
  seriesName: string;
  singleRate: string;
  minBet: string;
  maxBet: string;
};

type Props = {
  detail: SeriesDetail;
};

const SeriesCard: React.FC<Props> = ({ detail }) => {
  return (
    <View style={styles.wrapper}>
      {/* Badge floats above card */}
      <View style={styles.badgeRow}>
        <LinearGradient
          colors={Colors.GRADIENT.GOLD}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <CustomText style={styles.badgeText}>{detail.seriesName}</CustomText>
        </LinearGradient>
      </View>

      {/* Card body */}
      <View style={styles.card}>
        <CustomText style={styles.detailText}>{detail.singleRate}</CustomText>
        <CustomText style={styles.detailText}>{detail.minBet}</CustomText>
        <CustomText style={styles.detailText}>{detail.maxBet}</CustomText>
      </View>
    </View>
  );
};

export default SeriesCard;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: rw(4),
    marginBottom: rh(2.5),
  },
  badgeRow: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: -rh(1.8),
  },
  badge: {
    paddingHorizontal: rw(8),
    paddingVertical: rh(1),
    borderRadius: rh(1.5),
    borderWidth: 2,
    borderColor: Colors.SECONDARY_BG,
  },
  badgeText: {
    color: Colors.BADGE_TEXT,
    fontSize: Fonts.smaller,
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: rh(1.5),
    paddingTop: rh(3.8),
    paddingBottom: rh(2.5),
    paddingHorizontal: rw(4),
    alignItems: 'center',
    gap: rh(0.6),
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_08,
  },
  detailText: {
    color: Colors.WHITE,
    fontSize: Fonts.smallest,
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
  },
});
