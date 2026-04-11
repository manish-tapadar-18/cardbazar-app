import React from 'react';
import {
  Text,
  TextProps,
  StyleSheet,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { Colors } from '../utils/Colors';

interface CustomTextProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  selectable?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  selectable = false,
  onPress,
  ...rest
}) => {
  return (
    <Text
      style={[styles.defaultText, style]}
      selectable={selectable}
      allowFontScaling={false}
      onPress={onPress}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
});
