import React, { useCallback, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  View,
} from 'react-native'
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
import CardSkeleton from './components/CardSkeleton'
import CategoryCard from './components/CategoryCard'

const SKELETON_COUNT = 4

const ListHeader: React.FC = () => (
  <View style={styles.listHeader}>
    <CustomText style={styles.listHeaderText}>ALL GAMES</CustomText>
  </View>
)

const SkeletonList: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <ListHeader />
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </View>
)

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
