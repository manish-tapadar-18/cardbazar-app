import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import GradientIconBar from '../../../components/GradientIconBar';
import CustomText from '../../../components/CustomText';
import GradientText from '../../../components/GradientText';
import HorizontalTabBar from '../../../components/HorizontalTabBar';
import EmptyState from '../../../components/EmptyState';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { ENV } from '../../../utils/env';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { clearAllStores } from '../../../stores/clearAllStores';
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse';
import { IResultScheduleDetail } from '../../../response/module/IGameResultResponse';
import { IGameResultRequest } from '../../../request/module/IGameResultRequest';
import { styles } from './styles';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

type FlatResultItem = IResultScheduleDetail & {
  GAME_DATE: string;
  GAME_NAME: string;
};

type DateGroup = {
  GAME_DATE: string;
  items: FlatResultItem[];
};

const SORT_FILTER = {
  FIELD_NAME: 'GAME_MASTER.GAME_DATE',
  SORT_ORDER: 'DESC' as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (categoryId: string): IGameResultRequest => ({
  filters: {
    search: [
      { FIELD_NAME: 'GAME_MASTER.NAME', FIELD_VALUE: '', OPT: 'LIKE' },
      { FIELD_NAME: 'GAME_MASTER.CATEGORY_ID', FIELD_VALUE: categoryId, OPT: '=' },
      { FIELD_NAME: 'GAME_CATEGORY.STATUS', FIELD_VALUE: 'ACTIVE', OPT: '=' },
      {
        FIELD_NAME: 'GAME_MASTER.GAME_DATE',
        FIELD_VALUE: moment().format('YYYY-MM-DD'),
        OPT: '<=',
      },
    ],
    sortFilter: SORT_FILTER,
  },
});

const formatCardName = (name: string | null): string => {
  if (!name) return '';
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Merges new flat items into existing date groups.
// Items for an already-present date are appended; new dates create new groups.
const mergeIntoGroups = (prev: DateGroup[], newItems: FlatResultItem[]): DateGroup[] => {
  const map = new Map<string, FlatResultItem[]>(
    prev.map(g => [g.GAME_DATE, [...g.items]])
  );
  newItems.forEach(item => {
    const existing = map.get(item.GAME_DATE);
    if (existing) {
      existing.push(item);
    } else {
      map.set(item.GAME_DATE, [item]);
    }
  });
  return Array.from(map.entries()).map(([GAME_DATE, items]) => ({ GAME_DATE, items }));
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const Result = () => {
  const { userDetails } = useUserStore();

  const [categories, setCategories] = useState<IGameCategoryResponse[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [resultGroups, setResultGroups] = useState<DateGroup[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setAdminDetails } = useAdminDetailsStore();
  const flatListRef = useRef<FlatList<DateGroup>>(null);
  const isFetchingMore = useRef(false);
  const activeCatRef = useRef('');
  const hasInteracted = useRef(false);
  const hasMore = useRef(true);

  // ── Auth guard — logout if INACTIVE ───────────────────────────────────────
  const fetchUserDetails = useCallback(async () => {
    const email = userDetails?.EMAIL;
    if (!email) return;
    try {
      const { isSuccess, data } = await Repository.User.userDetails({ EMAIL: email });
      if (isSuccess && data?.STATUS === 'INACTIVE') clearAllStores();
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to verify session.');
    }
  }, [userDetails?.EMAIL]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (
    categoryId: string,
    page: number,
    append: boolean
  ) => {
    if (!categoryId) return;
    if (page === 0) setIsLoading(true);
    try {
      const payload = buildPayload(categoryId);
      const { isSuccess, data, message } = await Repository.Game.getGameResults(
        payload,
        PER_PAGE * page,
        PER_PAGE
      );
      if (isSuccess && data) {
        hasMore.current = (page + 1) * PER_PAGE < data.TOTAL;

        const flat: FlatResultItem[] = [];
        data.DATA.forEach(game => {
          game.SCHEDULE_DETAILS
            .filter(s => s.RESULT_PUBLISH !== 0)
            .forEach(s => {
              flat.push({ ...s, GAME_DATE: game.GAME_DATE, GAME_NAME: game.NAME });
            });
        });

        setResultGroups(prev =>
          append ? mergeIntoGroups(prev, flat) : mergeIntoGroups([], flat)
        );
      } else {
        Toast.error(message ?? 'Failed to load results.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingMore.current = false;
    }
  }, []);

  // ── Fetch categories → auto-select first → fetch results ──────────────────
  const fetchCategories = useCallback(async () => {
    setIsCatLoading(true);
    try {
      const { isSuccess, data, message } = await Repository.Game.getAllGameCategories();
      if (isSuccess && data && data.length > 0) {
        setCategories(data);
        const firstId = data[0].ID;
        setActiveCategory(firstId);
        activeCatRef.current = firstId;
        setPageNum(0);
        setResultGroups([]);
        hasInteracted.current = false;
        hasMore.current = true;
        fetchResults(firstId, 0, false);
      } else {
        Toast.error(message ?? 'Failed to load categories.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsCatLoading(false);
    }
  }, [fetchResults]);

  useFocusEffect(
    useCallback(() => {
      const fetchAdminDetails = async () => {
        const { isSuccess, data } = await Repository.User.adminDetails();
        if (isSuccess && data != null) setAdminDetails(data);
      };
      fetchUserDetails();
      fetchCategories();
      fetchAdminDetails();
    }, [])
  );

  // ── Category tab press ────────────────────────────────────────────────────
  const onTabPress = (tab: IGameCategoryResponse) => {
    if (tab.ID === activeCategory) return;
    setActiveCategory(tab.ID);
    activeCatRef.current = tab.ID;
    setPageNum(0);
    setResultGroups([]);
    hasInteracted.current = false;
    hasMore.current = true;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    fetchResults(tab.ID, 0, false);
  };

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = () => {
    setIsRefreshing(true);
    setPageNum(0);
    hasInteracted.current = false;
    hasMore.current = true;
    fetchResults(activeCatRef.current, 0, false);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    if (!hasInteracted.current) return;
    if (distanceFromEnd < 0) return;
    if (resultGroups.length === 0) return;
    if (isLoading || isFetchingMore.current) return;
    if (!hasMore.current) return;

    isFetchingMore.current = true;
    const next = pageNum + 1;
    setPageNum(next);
    fetchResults(activeCatRef.current, next, true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: DateGroup }) => (
    <View style={styles.groupWrapper}>
      {/* Date badge — floats above the card */}
      <LinearGradient
        colors={['#FFD700', '#D4940A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.groupDateBadge}
      >
        <CustomText style={styles.groupDateText}>
          {moment(item.GAME_DATE).utc().format('DD-MM-YYYY')}
        </CustomText>
      </LinearGradient>

      {/* Card body */}
      <LinearGradient
        colors={['#260030', '#44004F' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.groupCard}
      >
        {item.items.map((schedule, index) => {
          const imageUri = schedule.CARD_IMAGE_URL
            ? `${ENV.BASE_URL}/${schedule.CARD_IMAGE_URL}`
            : null;
          return (
            <React.Fragment key={schedule.ID}>
              <View style={styles.groupRow}>
                <GradientText
                  colors={Colors.GRADIENT.GOLD}
                  style={styles.groupScheduleName}
                  angle={180}
                >
                  {schedule.NAME}
                </GradientText>

                <View style={styles.groupRowRight}>
                  <Image
                    source={imageUri ? { uri: imageUri } : Images.SMALL_CARD}
                    defaultSource={Images.SMALL_CARD}
                    style={styles.groupCardImage}
                    resizeMode="contain"
                  />
                  <CustomText style={styles.groupCardName} numberOfLines={1}>
                    {formatCardName(schedule.CARD_NAME)}
                  </CustomText>
                </View>
              </View>

              {index < item.items.length - 1 && (
                <View style={styles.groupDivider} />
              )}
            </React.Fragment>
          );
        })}
      </LinearGradient>
    </View>
  );

  const ListFooter = () => {
    if (!hasMore.current || resultGroups.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <CustomText style={styles.footerText}>Loading more...</CustomText>
      </View>
    );
  };

  const ListEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        image={Images.RESULT}
        title="No Results Found"
        subtitle="No published results for this category."
      />
    );
  };

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar />

      {!isCatLoading && categories.length > 0 && (
        <HorizontalTabBar
          tabs={categories}
          activeKey={activeCategory}
          onPress={onTabPress}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={resultGroups}
        keyExtractor={(item) => item.GAME_DATE}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        style={styles.flex1}
        onScrollBeginDrag={() => { hasInteracted.current = true; }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        initialNumToRender={PER_PAGE}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
};

export default Result;
