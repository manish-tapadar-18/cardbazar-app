import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientViewProps {
  gradientColors: string[];
  customStyle?: StyleProp<ViewStyle>;
  children?: ReactNode; // OPTIONAL
  angle?: number;
}

const GradientView: React.FC<GradientViewProps> = ({
  gradientColors,
  customStyle,
  children,
  angle = 90,
}) => {
  return (
    <LinearGradient
      useAngle
      angle={angle}
      angleCenter={{ x: 0, y: 0.5 }}
      colors={gradientColors}
      style={customStyle}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientView;
