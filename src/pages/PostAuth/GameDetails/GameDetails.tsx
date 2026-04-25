import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import moment from 'moment'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Images } from '../../../utils/Images'
import { Colors } from '../../../utils/Colors'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { IScheduleDetail } from '../../../response/module/IGetAllGamesListResponse'
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse'
import HorizontalTabBar from '../../../components/HorizontalTabBar'
import { HomeStackParamList } from '../../../navigation/RouteTypes'
import { useUserStore } from '../../../stores/userStore'
import { useWalletStore } from '../../../stores/walletStore'

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

const getRemainingTime = (endTime: string): string => {
  const diff = moment(endTime, 'HH:mm').diff(moment())
  if (diff <= 0) return '00:00:00'
  return moment.utc(diff).format('HH:mm:ss')
}

const formatTime = (time: string) => moment(time, 'HH:mm').format('hh:mm A')

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
  }, [pulseAnim])

  return <Animated.View style={[style, { opacity: pulseAnim }]} />
}

// ─── Tab Bar Skeleton ─────────────────────────────────────────────────────────
const TabBarSkeleton: React.FC = () => (
  <View style={styles.tabBarRow}>
    {[1, 2, 3, 4].map((i) => (
      <SkeletonBox key={i} style={styles.tabPillSkeleton} />
    ))}
  </View>
)

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <View style={styles.cardWrapper}>
    <View style={styles.skeletonCard}>
      <SkeletonBox style={styles.skeletonIcon} />
      <View style={styles.cardContent}>
        <SkeletonBox style={styles.skeletonCardTitle} />
        <SkeletonBox style={styles.skeletonCardSubtitle} />
      </View>
    </View>
  </View>
)

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
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

// ─── Game Card ────────────────────────────────────────────────────────────────
const GameCard: React.FC<{ schedule: IScheduleDetail, isEnabled: boolean, onGameCardClick?: (schedule: IScheduleDetail) => void }> = ({ schedule, isEnabled, onGameCardClick }) => {
  const status = getStatus(schedule)
  return (
    <Pressable
      disabled={!isEnabled}
      onPress={() => {
        onGameCardClick?.(schedule)
      }}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <Image source={Images.CARD_ICON} style={styles.cardIcon} resizeMode="contain" />
        <View style={styles.cardContent}>
          <CustomText style={styles.cardTitle}>{schedule.NAME}</CustomText>
          {status === 'RUNNING' && (
            <CustomText style={styles.runningTime}>
              Ends in {getRemainingTime(schedule.END_TIME)}
            </CustomText>
          )}
          {status === 'UPCOMING' && (
            <View style={styles.upcomingTimeRow}>
              <CustomText style={styles.upcomingTime}>
                Starts at {formatTime(schedule.START_TIME)}
              </CustomText>
              <CustomText style={styles.upcomingTimeSpacer}>{'    '}</CustomText>
              <CustomText style={styles.upcomingTime}>
                Ends at {formatTime(schedule.END_TIME)}
              </CustomText>
            </View>
          )}
          {status === 'EXPIRED' && (
            <CustomText style={styles.expiredTime}>
              Ended at {formatTime(schedule.END_TIME)}
            </CustomText>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    {/* Outer glow ring */}
    <View style={styles.emptyGlowRing}>
      {/* Inner gold gradient circle */}
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconCircle}
      >
        <Image source={Images.GAME_LIST} style={styles.emptyIcon} resizeMode="contain" />
      </LinearGradient>
    </View>

    <CustomText style={styles.emptyTitle}>NO GAMES TODAY</CustomText>

    {/* Gold divider */}
    <LinearGradient
      colors={['transparent', Colors.GOLD, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.emptyDivider}
    />

    <CustomText style={styles.emptySubtitle}>
      There are no active games available{'\n'}for this category right now.{'\n'}Pull down to refresh.
    </CustomText>
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

  // Reset highlight when user navigates back to this screen
  

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
  // buildPayload depends on activeTab so getGameListByCategoryId re-runs
  // whenever the user switches tabs
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
          <EmptyState />
        ) : (
          <>
            {categorized.running.length > 0 && (
              <>
                <SectionHeader title="RUNNING" />
                {categorized.running.map(s => (
                  <GameCard onGameCardClick={(schedule: IScheduleDetail) => onGameCardClick(schedule)} key={s.ID} schedule={s} isEnabled={true} />
                ))}
              </>
            )}
            {categorized.upcoming.length > 0 && (
              <>
                <SectionHeader title="UPCOMING" />
                {categorized.upcoming.map(s => (
                  <GameCard key={s.ID} schedule={s} isEnabled={false} />
                ))}
              </>
            )}
            {categorized.expired.length > 0 && (
              <>
                <SectionHeader title="EXPIRED" />
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
