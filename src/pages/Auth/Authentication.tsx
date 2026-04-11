import { Image, StyleSheet, View, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { styles } from './styles';
import { Images } from '../../utils/Images';
import CustomText from '../../components/CustomText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spaces } from '../../utils/Spaces';
import { commonStyles } from '../../utils/CommonStyles';
import { Colors } from '../../utils/Colors';
import { useLanguageModalStore } from '../../stores/languageModalStore';
import { rw } from '../../utils/responsive';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Register from './Register';
import Wrapper from '../../components/Wrapper';
import Login from './Login';

const Authentication: React.FC = () => {
  const [authType, setAuthType] = useState<'Login' | 'Register'>('Login');
  const { top } = useSafeAreaInsets();
  const { openModal } = useLanguageModalStore();

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
 

  return (
    <Wrapper>
      <Image
        style={{ ...StyleSheet.absoluteFill, width: "100%", height: "100%", resizeMode: "cover" }}
        source={Images.LANGUAGE_BACKGROUND_IMAGE}
        blurRadius={3}
      />

      <TouchableOpacity
        onPress={openModal}
        style={{ position: 'absolute', top: top + 12, right: rw(4) }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image source={Images.LANGUAGE} style={{ width: rw(7), height: rw(7), tintColor: Colors.WHITE }} resizeMode="contain" />
      </TouchableOpacity>

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
