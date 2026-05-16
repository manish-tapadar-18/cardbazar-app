import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientText from './GradientText';
import CustomText from './CustomText';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Fonts } from '../utils/Fontsizes';
import { Colors } from '../utils/Colors';
import { IGameCategoryResponse } from '../response/module/IGameCategoryResponse';



type Props = {
  tabs: IGameCategoryResponse[];
  activeKey: string;
  onPress: (tab: IGameCategoryResponse) => void;
  activeGradientColors?: string[];
};

const HorizontalTabBar: React.FC<Props> = ({
  tabs,
  activeKey,
  onPress,
  activeGradientColors = Colors.GRADIENT.GOLD,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
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
                style={styles.categoryName}
                angle={180}
              >
                {tab.NAME}
              </GradientText>
            ) : (
              <CustomText style={styles.categoryName}>{tab.NAME}</CustomText>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default HorizontalTabBar;

const styles = StyleSheet.create({
  scrollView: {
    height: rh(7),
    flexShrink: 0,
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.2),
    gap: rw(6),
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: Fonts.small,
    fontFamily: FontFamilyWithWeight[700]
  },
  inactiveLabel: {
    fontSize: Fonts.small,
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.WHITE_55,
  },
  categoryName: {
    color: Colors.WHITE,
    fontSize: rf(6.5),
    fontWeight: "bold",
    letterSpacing: 0.5,
  }
});
