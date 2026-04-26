import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ImageBackground,
  RefreshControl,
  ScrollView,
  View
} from 'react-native'
import moment from 'moment'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Images } from '../../../utils/Images'
import { Colors } from '../../../utils/Colors'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { IScheduleDetail } from '../../../response/module/IGetAllGamesListResponse'
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse'
import HorizontalTabBar from '../../../components/HorizontalTabBar'
import { HomeStackParamList } from '../../../navigation/RouteTypes'
import { useUserStore } from '../../../stores/userStore'
import { useWalletStore } from '../../../stores/walletStore'
import GameDetailsSkeletonBox from './components/GameDetailsSkeletonBox'
import GameDetailsEmptyState from './components/GameDetailsEmptyState'
import GameCard from './components/GameCard'
import GameDetailsSectionHeader from './components/GameDetailsSectionHeader'

// ─── Types ───────────────────────────────────────────────────────────────────
type GameStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED'

interface CategorizedSchedules {
  running: IScheduleDetail[]
  upcoming: IScheduleDetail[]
  expired: IScheduleDetail[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatus = (schedule: IScheduleDetail): GameStatus => {
  const now = moment()
  const start = moment(schedule.START_TIME, 'HH:mm')
  const end = moment(schedule.END_TIME, 'HH:mm')
  if (now.isBefore(start)) return 'UPCOMING'
  if (now.isAfter(end)) return 'EXPIRED'
  return 'RUNNING'
}

// ─── Tab Bar Skeleton ─────────────────────────────────────────────────────────
const TabBarSkeleton: React.FC = () => (
  <View style={styles.tabBarRow}>
    {[1, 2, 3, 4].map((i) => (
      <GameDetailsSkeletonBox key={i} style={styles.tabPillSkeleton} />
    ))}
  </View>
)

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <View style={styles.cardWrapper}>
    <View style={styles.skeletonCard}>
      <GameDetailsSkeletonBox style={styles.skeletonIcon} />
      <View style={styles.cardContent}>
        <GameDetailsSkeletonBox style={styles.skeletonCardTitle} />
        <GameDetailsSkeletonBox style={styles.skeletonCardSubtitle} />
      </View>
    </View>
  </View>
)


// ─── GameDetails Screen ───────────────────────────────────────────────────────
const GameDetails = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'GameDetails'>>()
  const { categoryId } = route.params
  const { userDetails } = useUserStore();
  const { setWallet } = useWalletStore();

  useFocusEffect(
    useCallback(() => {
      setActiveTopKey('');
      fetchWalletBalance();
    }, [])
  )

  const fetchWalletBalance = useCallback(async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    try {
      const { isSuccess, data } = await Repository.User.getUserBalance(userId);
      if (isSuccess && data) setWallet(data);
    } catch { }
  }, [userDetails?.ID]);
  const navigation = useNavigation<any>()
  const [activeTopKey, setActiveTopKey] = useState('')

  const handleTopBarPress = useCallback(
    (item: { key: string }) => {
      setActiveTopKey(item.key)
      if (item.key === 'gameRules') navigation.navigate('GameRules')
      else if (item.key === 'referEarn') navigation.navigate('Refer')
      else if (item.key === 'gamesList') navigation.navigate('Home')
    },
    [navigation]
  )

  const onGameCardClick = (schedule: IScheduleDetail) => {
    const { ID } = schedule
    let index = gameCategories.findIndex((category) => category.ID == categoryId);
    let temp = [...gameCategories];
    let { PLAY_OPTIONS } = temp[index];
    navigation.navigate('PlayGame', { cardImages: PLAY_OPTIONS, GAME_MASTER_SCHEDULE_ID: ID, GAME_CATEGORY: categoryId });
  }

  // ── Categories (tab bar) ──────────────────────────────────────────────────
  const [gameCategories, setGameCategories] = useState<IGameCategoryResponse[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

  // ── Games (card list) ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(categoryId)
  const [schedules, setSchedules] = useState<IScheduleDetail[]>([])
  const [isGamesLoading, setIsGamesLoading] = useState(true)

  // tick drives countdown re-renders every second
  const [, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch: all categories (runs once on mount) ────────────────────────────
  const fetchAllGameCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true)
      const { isSuccess, data, message } = await Repository.Game.getAllGameCategories()
      if (isSuccess && data) {
        setGameCategories(data)
      } else {
        Toast.error(`${message}`, { placement: 'bottom', duration: 3000 })
      }
    } catch (error: any) {
      Toast.error(`${error.message}`, { placement: 'bottom', duration: 3000 })
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [])

  // ── Fetch: games for the active tab ──────────────────────────────────────
  const buildPayload = useCallback(
    () => ({
      filters: {
        search: [
          { FIELD_NAME: 'GAME_MASTER.NAME', FIELD_VALUE: '', OPT: 'LIKE' },
          { FIELD_NAME: 'GAME_MASTER.CATEGORY_ID', FIELD_VALUE: activeTab, OPT: '=' },
          {
            FIELD_NAME: 'GAME_MASTER.GAME_DATE',
            FIELD_VALUE: moment().format('YYYY-MM-DD'),
            OPT: '=',
          },
        ],
        sortFilter: { FIELD_NAME: 'GAME_MASTER.GAME_DATE', SORT_ORDER: 'DESC' },
      },
    }),
    [activeTab]
  )

  const getGameListByCategoryId = useCallback(async () => {
    try {
      setIsGamesLoading(true)
      const response = await Repository.Game.getAllGamesList(buildPayload())
      const { isSuccess, data, message } = response
      if (!isSuccess || !data) {
        Toast.error(`Error: ${message}`, { placement: 'bottom', duration: 3000 })
        return
      }
      const allSchedules = data.DATA.flatMap(game =>
        game.SCHEDULE_DETAILS.filter(s => s.STATUS === 'ACTIVE')
      )
      setSchedules(allSchedules)
    } catch (error: any) {
      Toast.error(error.message, { placement: 'bottom', duration: 3000 })
    } finally {
      setIsGamesLoading(false)
    }
  }, [buildPayload])

  // ── Parallel initial fetch: both fire on mount independently ─────────────
  useEffect(() => {
    fetchAllGameCategories()
  }, [fetchAllGameCategories])

  // Runs on mount AND whenever activeTab changes (tab switch)
  useEffect(() => {
    getGameListByCategoryId()
  }, [getGameListByCategoryId])

  // ── Countdown ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick(t => t + 1), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ── Tab switch: clear stale games instantly so skeleton shows right away ──
  const handleTabPress = useCallback(
    (tab: IGameCategoryResponse) => {
      if (tab.ID === activeTab) return
      setSchedules([])
      setActiveTab(tab.ID)
    },
    [activeTab]
  )

  const categorized = useMemo<CategorizedSchedules>(() => {
    const running: IScheduleDetail[] = []
    const upcoming: IScheduleDetail[] = []
    const expired: IScheduleDetail[] = []
    for (const s of schedules) {
      const status = getStatus(s)
      if (status === 'RUNNING') running.push(s)
      else if (status === 'UPCOMING') upcoming.push(s)
      else expired.push(s)
    }
    return { running, upcoming, expired }
  }, [schedules])

  const hasGames = schedules.length > 0

  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
      <GradientIconBar
        activeKey={activeTopKey}
        onPress={handleTopBarPress}
      />

      {/* ── Category Tab Bar — resolves independently from game list ── */}
      {isCategoriesLoading ? (
        <TabBarSkeleton />
      ) : (
        <HorizontalTabBar
          tabs={gameCategories}
          activeKey={activeTab}
          onPress={handleTabPress}
          activeGradientColors={Colors.GRADIENT.GOLD}
        />
      )}

      {/* ── Game List — resolves independently from tab bar ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isGamesLoading}
            onRefresh={getGameListByCategoryId}
            tintColor={Colors.GOLD}
            colors={[Colors.GOLD]}
          />
        }
      >
        {isGamesLoading && !hasGames ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : !hasGames ? (
          <GameDetailsEmptyState />
        ) : (
          <>
            {categorized.running.length > 0 && (
              <>
                <GameDetailsSectionHeader title="RUNNING" />
                {categorized.running.map(s => (
                  <GameCard onGameCardClick={(schedule: IScheduleDetail) => onGameCardClick(schedule)} key={s.ID} schedule={s} isEnabled={true} />
                ))}
              </>
            )}
            {categorized.upcoming.length > 0 && (
              <>
                <GameDetailsSectionHeader title="UPCOMING" />
                {categorized.upcoming.map(s => (
                  <GameCard key={s.ID} schedule={s} isEnabled={false} />
                ))}
              </>
            )}
            {categorized.expired.length > 0 && (
              <>
                <GameDetailsSectionHeader title="EXPIRED" />
                {categorized.expired.map(s => (
                  <GameCard key={s.ID} schedule={s} isEnabled={false} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
  )
}

export default GameDetails
