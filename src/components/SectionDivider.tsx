import React from 'react';
import { View } from 'react-native';
import CustomText from './CustomText';
import { styles } from '../pages/PostAuth/PlayGame/styles';

interface SectionDividerProps {
  label: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <CustomText style={styles.dividerLabel}>{label}</CustomText>
    <View style={styles.dividerLine} />
  </View>
);

export default SectionDivider;
