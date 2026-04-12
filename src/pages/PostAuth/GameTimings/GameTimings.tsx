import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageBackground, ScrollView, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { styles } from './styles';
import GradientIconBar from '../../../components/GradientIconBar';
import HorizontalTabBar from '../../../components/HorizontalTabBar';
import GradientSpacer from '../../../components/GradientSpacer';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse';
import { IGameItem, IScheduleDetail } from '../../../response/module/IGetAllGamesListResponse';
import { IGameListFilterRequest } from '../../../request/module/IGameListFilterRequest';
import { useTranslation } from '../../../hooks/useTranslation';


const formatTime = (time: string) => moment(time, 'HH:mm').format('hh:mm A');



const SkeletonBox = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return <Animated.View style={[style, { opacity: pulseAnim }]} />;
};

const TimingCardSkeleton = () => (
  <View style={styles.wrapper}>
    <View style={styles.badgeRow}>
      <SkeletonBox style={styles.badgeSkeleton} />
    </View>
    <View style={styles.cardSkeleton}>
      <SkeletonBox style={styles.skeletonLine} />
      <SkeletonBox style={[styles.skeletonLine, { width: '70%' }]} />
    </View>
  </View>
);

// ─── Timing Card ──────────────────────────────────────────────────────────────

type TimingCardProps = {
  schedule: IScheduleDetail;
};

const TimingCard: React.FC<TimingCardProps> = ({ schedule }) => {
  const { t } = useTranslation();
  return(
  <View style={styles.wrapper}>
    <View style={styles.badgeRow}>
      <LinearGradient
        colors={Colors.GRADIENT.GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.badge}
      >
        <Text style={styles.badgeText}>{schedule.NAME}</Text>
      </LinearGradient>
    </View>
    <View style={styles.card}>
      <View style={styles.timingRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeValue}>{formatTime(schedule.START_TIME)}</Text>
          <Text style={styles.startLabel}>{t('start_time')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.timeColumn}>
          <Text style={styles.timeValue}>{formatTime(schedule.END_TIME)}</Text>
          <Text style={styles.endLabel}>{t('end_time')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.timeColumn}>
          <Text style={styles.timeValue}>{formatTime(schedule.RESULT_TIME)}</Text>
          <Text style={styles.resultLabel}>{t('result_time')}</Text>
        </View>
      </View>
    </View>
  </View>
)};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyTimings = () => (
  <View style={styles.emptyContainer}>
    <LinearGradient
      colors={Colors.GRADIENT.GOLD}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.emptyIconCircle}
    >
      <Text style={styles.emptyIcon}>⏰</Text>
    </LinearGradient>
    <Text style={styles.emptyTitle}>No Timings Available</Text>
    <Text style={styles.emptySubtitle}>No schedule found{'\n'}for this category.</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const GameTimings = () => {
  const [activeTopKey, setActiveTopKey] = useState('gameRules');
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [games, setGames] = useState<IGameItem[]>([]);
  const [categoryTabs, setCategoryTabs] = useState<IGameCategoryResponse[]>([]);
  
  const buildPayload = (): IGameListFilterRequest => ({
    filters: {
      search: [
        { FIELD_NAME: 'GAME_MASTER.NAME', FIELD_VALUE: '', OPT: 'LIKE' },
        { FIELD_NAME: 'GAME_MASTER.CATEGORY_ID', FIELD_VALUE: '', OPT: '=' },
        { FIELD_NAME: 'GAME_MASTER.GAME_DATE', FIELD_VALUE: moment().format('YYYY-MM-DD'), OPT: '>=' },
        { FIELD_NAME: 'GAME_MASTER.GAME_DATE', FIELD_VALUE: '', OPT: '<=' },
      ],
      sortFilter: { FIELD_NAME: 'GAME_MASTER.GAME_DATE', SORT_ORDER: 'DESC' },
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      const fetchGames = async () => {
        setLoading(true);
        try {
          const response = await Repository.Game.getAllGamesList(buildPayload());
          const { isSuccess, data, message } = response;
          if (!isSuccess || !data) {
            Toast.error(`Error: ${message}`, { placement: 'bottom', duration: 3000 });
            return;
          }

          const gameList = data.DATA;
          setGames(gameList);

          // Extract unique categories preserving order from response
          const seen = new Set<string>();
          const tabs: IGameCategoryResponse[] = [];
          gameList.forEach((game) => {
            if (!seen.has(game.CATEGORY_ID)) {
              seen.add(game.CATEGORY_ID);
              tabs.push({
                ID: game.CATEGORY_ID,
                NAME: game.CATEGORY_NAME,
                DESCRIPTION: '',
                IMAGE_ID: null,
                STATUS: 'ACTIVE',
                CREATED_AT: '',
                UPDATED_AT: '',
                CREATED_BY: '',
                UPDATED_BY: '',
                ORDER_BY: 0,
                PLAY_OPTIONS: '',
                IMAGE_PATH: null,
                CREATED_BY_FIRST_NAME: '',
                CREATED_BY_LAST_NAME: '',
                UPDATED_BY_FIRST_NAME: '',
                UPDATED_BY_LAST_NAME: '',
              });
            }
          });

          setCategoryTabs(tabs);
          if (tabs.length > 0) {
            setActiveTab(tabs[0].ID);
          }
        } catch (error: any) {
          Toast.error(error.message, { placement: 'bottom', duration: 3000 });
        } finally {
          setLoading(false);
        }
      };
      fetchGames();
    }, [])
  );

  const activeSchedules = useMemo(() => {
    return games
      .filter((game) => game.CATEGORY_ID === activeTab)
      .flatMap((game) => game.SCHEDULE_DETAILS.filter((s) => s.STATUS === 'ACTIVE'));
  }, [games, activeTab]);

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Top icon bar */}
      <GradientIconBar
        activeKey={activeTopKey}
        onPress={(item) => setActiveTopKey(item.key)}
      />

      <GradientSpacer colors={Colors.GRADIENT.SPACER} height={2} />

      {/* Category tab bar */}
      {isLoading ? (
        <View style={styles.tabBarRow}>
          {[1, 2, 3].map((i) => (
            <SkeletonBox key={i} style={styles.tabPill} />
          ))}
        </View>
      ) : (
        <HorizontalTabBar
          tabs={categoryTabs}
          activeKey={activeTab}
          onPress={(tab) => setActiveTab(tab.ID)}
          activeGradientColors={Colors.GRADIENT.GOLD}
        />
      )}

      {categoryTabs.length > 0 && <GradientSpacer colors={Colors.GRADIENT.SPACER} height={2} />}

      {/* Schedule cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading
          ? [1, 2, 3].map((i) => <TimingCardSkeleton key={i} />)
          : activeSchedules.length === 0
          ? <EmptyTimings />
          : activeSchedules.map((schedule) => (
              <TimingCard key={schedule.ID} schedule={schedule} />
            ))}
      </ScrollView>
    </ImageBackground>
  );
};

export default GameTimings;
