import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Images } from '../../../utils/Images'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { Colors } from '../../../utils/Colors'
import { useUserStore } from '../../../stores/userStore'
import { useWalletStore } from '../../../stores/walletStore'

// ─── Skeleton Box ─────────────────────────────────────────────────────────────
const SkeletonBox = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  return <Animated.View style={[style, { opacity: pulseAnim }]} />
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
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

const SKELETON_COUNT = 4

// ─── Category Card ────────────────────────────────────────────────────────────
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

// ─── List Header ──────────────────────────────────────────────────────────────
const ListHeader: React.FC = () => (
  <View style={styles.listHeader}>
    <CustomText style={styles.listHeaderText}>ALL GAMES</CustomText>
  </View>
)

// ─── Skeleton List ────────────────────────────────────────────────────────────
const SkeletonList: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <ListHeader />
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </View>
)

// ─── Home Screen ──────────────────────────────────────────────────────────────
const Home = () => {
  const [activeTopKey, setActiveTopKey] = useState('')
  const [gameCategories, setGameCategories] = useState<IGameCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation();
  const { userDetails } = useUserStore();
  const { setWallet } = useWalletStore();
  
  useFocusEffect(React.useCallback(() => {
    fetchWalletBalance();
  }, []))

  const fetchWalletBalance = useCallback(async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    try {
      const { isSuccess, data } = await Repository.User.getUserBalance(userId);
      if (isSuccess && data) setWallet(data);
    } catch { }
  }, [userDetails?.ID]);

  const navigateToGameDetails = (id: string) => {
    (navigation as any).navigate('GameDetails', { categoryId: id })
  }

  const fetchAllGameCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const catResponse = await Repository.Game.getAllGameCategories()
      const { isSuccess, data, message } = catResponse
      if (!isSuccess || !data) {
        Toast.error(`${message}`, { placement: 'bottom', duration: 3000 })
      } else {
        setGameCategories(data)
      }
    } catch (error: any) {
      Toast.error(`${error.message}`, { placement: 'bottom', duration: 3000 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchAllGameCategories()
    }, [fetchAllGameCategories]),
  )

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar
        activeKey={activeTopKey}
        onPress={(item) => setActiveTopKey(item.key)}
      />
      {isLoading && gameCategories.length === 0 ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={gameCategories}
          keyExtractor={(item) => item.ID}
          renderItem={({ item }) => <CategoryCard item={item} onPress={(id) => navigateToGameDetails(id)} />}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchAllGameCategories}
              tintColor={Colors.GOLD}
              colors={[Colors.GOLD]}
            />
          }
        />
      )}
    </ImageBackground>
  )
}

export default Home
