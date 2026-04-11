import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../utils/Colors';
import CustomText from './CustomText';

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  containerStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
  loading?: boolean;

  // NEW PROPS
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  containerStyle,
  textStyle,
  disabled = false,
  loading = false,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        isDisabled && styles.disabled,
        containerStyle,
      ]}
    >
      {/* If gradient is provided */}
      {gradientColors && !isDisabled ? (
        <LinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <CustomText children={title} style={textStyle} />
          )}
        </LinearGradient>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <CustomText children={title} style={textStyle} />
          )}
        </>
      )}
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: Colors.YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden'
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    backgroundColor: Colors.DISABLED_BG,
  },
});
