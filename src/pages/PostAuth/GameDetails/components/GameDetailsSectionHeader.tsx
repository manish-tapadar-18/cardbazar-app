import React from 'react'
import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '../../../../utils/Colors'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'

const GameDetailsSectionHeader: React.FC<{ title: string }> = React.memo(({ title }) => {
  return (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={['transparent', Colors.GOLD]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sectionLine}
      />
      <CustomText style={styles.sectionTitle}>{title}</CustomText>
      <LinearGradient
        colors={[Colors.GOLD, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sectionLine}
      />
    </View>
  )
})

export default GameDetailsSectionHeader
