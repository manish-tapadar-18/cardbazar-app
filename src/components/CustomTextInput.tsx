import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../utils/Colors';
import { rf, rh } from '../utils/responsive';

interface CustomTextInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<TextStyle>;
  focusedPlaceholderColor?: string;
  unfocusedPlaceholderColor?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onChangeText,
  style,
  focusedPlaceholderColor = Colors.HIGHLIGHT_PURPLE,
  unfocusedPlaceholderColor = 'gray',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={
        isFocused ? focusedPlaceholderColor : unfocusedPlaceholderColor
      }
      allowFontScaling={false}
      style={[styles.input, style]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...rest}
    />
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    fontSize: rf(4),
    color: Colors.BLACK,
    fontWeight: '400',
    borderWidth: 1,
    borderColor: Colors.INPUT_BORDER,
    paddingHorizontal: 12,
    flex: 1,
    borderRadius: 4,
  },
});
