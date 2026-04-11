import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../utils/Colors';

type Props = {
  colors?: string[];
  height?: number;
  style?: StyleProp<ViewStyle>;
  angle?: number;
};

const GradientSpacer: React.FC<Props> = ({
  colors = Colors.GRADIENT.SPACER_CORE,
  height = 2,
  style,
  angle = 90,
}) => {
  return (
    <LinearGradient
      colors={colors}
      useAngle
      angle={angle}
      angleCenter={{ x: 0.5, y: 0.5 }}
      style={[{ height, width: '100%' }, style]}
    />
  );
};

export default GradientSpacer;
