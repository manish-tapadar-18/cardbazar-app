import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import CustomText from './CustomText';
import { rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Fonts } from '../utils/Fontsizes';
import { Colors } from '../utils/Colors';

export type HorizontalIconBarItem = {
  key: string;
  image: ImageSourcePropType;
  text: string;
};

type Props = {
  items: HorizontalIconBarItem[];
  onPress: (item: HorizontalIconBarItem) => void;
  activeKey?: string;
};

const HorizontalIconBar: React.FC<Props> = ({ items, onPress, activeKey }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.item}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          <Image
            source={item.image}
            style={styles.icon}
            tintColor={activeKey === item.key ? Colors.GOLD : Colors.WHITE}
          />
          <CustomText
            style={activeKey === item.key ? [styles.text, styles.activeText] : styles.text}
          >
            {item.text}
          </CustomText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default HorizontalIconBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: rw(5),
    paddingVertical: rh(1.5),
    gap: rw(7),
    alignItems: 'center'
  },
  item: {
    alignItems: 'center',
    gap: rh(0.5),
  },
  icon: {
    width: rh(2.5),
    height: rh(2.5),
    resizeMode: 'contain',
  },
  text: {
    color: Colors.WHITE,
    fontSize: Fonts.smallest,
    fontFamily: FontFamilyWithWeight[500],
    textAlign: 'center',
  },
  activeText: {
    color: Colors.GOLD,
  },
});
