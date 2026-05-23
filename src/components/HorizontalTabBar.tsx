import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GradientText from './GradientText';
import CustomText from './CustomText';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Colors } from '../utils/Colors';
import { IGameCategoryResponse } from '../response/module/IGameCategoryResponse';

const BAR_GRADIENT = ['#3b1a72', '#441775', '#521477', '#650f7b'];
const INDICATOR_GRADIENT = ['#FFD600', '#FFF177', '#FFD600'];

type Props = {
  tabs: IGameCategoryResponse[];
  activeKey: string;
  onPress: (tab: IGameCategoryResponse) => void;
};

const HorizontalTabBar: React.FC<Props> = ({ tabs, activeKey, onPress }) => {
  return (
    <LinearGradient
      colors={BAR_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.barGradient}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isActive = tab.ID === activeKey;
          return (
            <TouchableOpacity
              key={tab.ID}
              onPress={() => onPress(tab)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {isActive ? (
                <GradientText
                  colors={Colors.GRADIENT.GOLD}
                  locations={Colors.GRADIENT.GOLD_LOCATIONS}
                  style={styles.activeLabel}
                  angle={180}
                >
                  {tab.NAME}
                </GradientText>
              ) : (
                <CustomText style={styles.inactiveLabel}>{tab.NAME}</CustomText>
              )}

              {/* {isActive && (
                <LinearGradient
                  colors={INDICATOR_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.indicator}
                />
              )} */}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

export default HorizontalTabBar;

const styles = StyleSheet.create({
  barGradient: {
    height: rh(7),
    flexShrink: 0,
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: rw(4),
    alignItems: 'center',
    gap: rw(7),
    height: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: rh(0.5),
    gap: rh(0.4),
  },
  activeLabel: {
    fontSize: rf(6.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
    textTransform:"capitalize"
  },
  inactiveLabel: {
    fontSize: rf(6.5),
    fontFamily: FontFamilyWithWeight[600],
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform:"capitalize"
  },
  indicator: {
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
});
