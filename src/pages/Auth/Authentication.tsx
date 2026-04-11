import { Image, StyleSheet, View, LayoutChangeEvent } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { styles } from './styles';
import { Images } from '../../utils/Images';
import CustomText from '../../components/CustomText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spaces } from '../../utils/Spaces';
import { commonStyles } from '../../utils/CommonStyles';
import { Colors } from '../../utils/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Register from './Register';
import Wrapper from '../../components/Wrapper';
import Login from './Login';
// import LottieView from 'lottie-react-native';
import { rh } from '../../utils/responsive';

const Authentication: React.FC = () => {
  const [authType, setAuthType] = useState<'Login' | 'Register'>('Login');
  const { top } = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  // 👇 Capture width of the toggle container
  const onLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
  };

  const handleToggle = (type: 'Login' | 'Register') => {
    setAuthType(type);

    const halfWidth = containerWidth.value / 2;

    translateX.value = withTiming(
      type === 'Register' ? halfWidth : 0,
      { duration: 300 }
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  // const animationRef = useRef<LottieView>(null);
  // useEffect(() => {
  //   animationRef.current?.play();

  //   // Or set a specific startFrame and endFrame with:
  //   animationRef.current?.play(30, 120);
  // }, []);

  return (
    <Wrapper>
      <Image
        style={{ ...StyleSheet.absoluteFill, width: "100%", height: "100%", resizeMode: "cover" }}
        source={Images.LANGUAGE_BACKGROUND_IMAGE}
        blurRadius={3}
      />

      <CustomText
        children={`${authType} with Card Bazaar App`}
        style={{
          ...styles.headerText,
          marginTop: top + Spaces.veryLarge * 3,
        }}
      />

      <View
        onLayout={onLayout}
        style={{
          ...commonStyles.row,
          marginTop: Spaces.veryLarge * 2,
          justifyContent: 'space-around',
        }}
      >
        <CustomText
          onPress={() => handleToggle('Login')}
          children={'Login'}
          style={{
            ...styles.authTypeText,
            color: authType === 'Login' ? Colors.YELLOW : Colors.WHITE,
          }}
        />

        <CustomText
          onPress={() => handleToggle('Register')}
          children={'Register'}
          style={{
            ...styles.authTypeText,
            color: authType === 'Register' ? Colors.YELLOW : Colors.WHITE,
          }}
        />
      </View>

      <Animated.View style={[styles.gradientView, animatedStyle]} />
      <View style={styles.formOuterContainer}>
        {authType == "Login" && <Login />}
        {authType == "Register" && <Register />}
      </View>
    </Wrapper>
  );
};

export default Authentication;
