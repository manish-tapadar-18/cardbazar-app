import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../../../utils/Images'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'
import { IGameCategoryResponse } from '../../../../response/module/IGameCategoryResponse'

const CategoryCard: React.FC<{ item: IGameCategoryResponse; onPress: (id: string) => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => { onPress(item.ID) }} activeOpacity={0.82} style={styles.categoryCardWrapper}>
    <LinearGradient
      colors={['#331070', '#1A0040']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.categoryCard}
    >
      <CustomText style={styles.categoryName}>{item.NAME}</CustomText>
      <CustomText style={styles.categoryDesc} numberOfLines={2}>
        {item.DESCRIPTION}
      </CustomText>
      <View style={styles.categoryFooter}>
        <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
          <Image source={Images.PLAY_CIRCLE} style={styles.playIcon} resizeMode="contain" />
          <CustomText style={styles.playText}>LET'S PLAY</CustomText>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

export default CategoryCard
