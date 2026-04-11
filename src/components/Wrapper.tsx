import React, { ReactNode } from 'react';
import { View, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/Colors';

type WrapperProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

const Wrapper: React.FC<WrapperProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor={Colors.WRAPPER_BG} />
      <View style={[{ flex: 1,paddingBottom: insets.bottom,},style]}>
        {children}
      </View>
    </View>
  );
};

export default Wrapper;
