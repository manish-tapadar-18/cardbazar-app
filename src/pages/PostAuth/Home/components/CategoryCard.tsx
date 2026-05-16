import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../../../utils/Images'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'
import GradientText from '../../../../components/GradientText'
import { IGameCategoryResponse } from '../../../../response/module/IGameCategoryResponse'
import { Colors } from '../../../../utils/Colors'

interface CategoryCardProps {
  item: IGameCategoryResponse;
  onPress: (id: string) => void;
  contestCount?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, onPress, contestCount }) => (
  <TouchableOpacity onPress={() => { onPress(item.ID) }} activeOpacity={0.82} style={styles.categoryCardWrapper}>
    <LinearGradient
      colors={['#1A0040', '#6A008F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.categoryCard}
    >
      <GradientText
        colors={Colors.GRADIENT.GOLD}
        locations={Colors.GRADIENT.GOLD_LOCATIONS}
        style={styles.categoryName}
        angle={180}
      >
        {item.NAME}
      </GradientText>
      <CustomText style={styles.categoryDesc} numberOfLines={2}>
        {item.DESCRIPTION}
      </CustomText>
      <View style={styles.categoryFooter}>
        {contestCount !== undefined && (
          <View style={styles.contestsBadgeWrapper}>
            <LinearGradient
              colors={['#FFD600','#FFF177' ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contestsBadge}
            >
              <CustomText style={styles.contestsText}>{contestCount} CONTESTS</CustomText>
            </LinearGradient>
          </View>
        )}
        <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
          <Image source={Images.PLAY_CIRCLE} style={styles.playIcon} resizeMode="contain" />
          <CustomText style={styles.playText}>LET'S PLAY</CustomText>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

export default CategoryCard
