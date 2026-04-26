import React from 'react'
import { View } from 'react-native'
import { styles } from '../styles'
import SkeletonBox from './SkeletonBox'

const CardSkeleton: React.FC = () => (
  <View style={styles.categoryCardWrapper}>
    <View style={styles.skeletonCardInner}>
      <SkeletonBox style={styles.skeletonTitle} />
      <SkeletonBox style={styles.skeletonDescLine} />
      <SkeletonBox style={[styles.skeletonDescLine, { width: '65%' }]} />
      <View style={styles.categoryFooter}>
        <SkeletonBox style={styles.skeletonBadge} />
        <SkeletonBox style={styles.skeletonPlayBtn} />
      </View>
    </View>
  </View>
)

export default CardSkeleton
