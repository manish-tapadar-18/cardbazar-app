import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../utils/Colors';

interface GradientTextProps {
  colors: string[];
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  angle?: number;
  /** Gradient stop positions (0–1), must match length of `colors` */
  locations?: number[];
  numberOfLines?: number;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors,
  style,
  children,
  angle = 180,
  locations,
  numberOfLines,
}) => {
  return (
    <MaskedView
      maskElement={
        <Text
          style={[styles.defaultText, style, { backgroundColor: Colors.TRANSPARENT }]}
          allowFontScaling={false}
          numberOfLines={numberOfLines}
        >
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        locations={locations}
        useAngle
        angle={angle}
        angleCenter={{ x: 0.5, y: 0.5 }}
      >
        <Text
          style={[styles.defaultText, style, { opacity: 0 }]}
          allowFontScaling={false}
          numberOfLines={numberOfLines}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
});
