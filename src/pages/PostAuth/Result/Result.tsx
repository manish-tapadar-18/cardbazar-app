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
import GradientText from '../../../components/GradientText';
import CustomText from '../../../components/CustomText';
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

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

// Each flat list item is a published schedule detail with its parent game context
type FlatResultItem = IResultScheduleDetail & {
  GAME_DATE: string;
  GAME_NAME: string;
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

// ─── Screen ───────────────────────────────────────────────────────────────────
const Result = () => {
  const { userDetails } = useUserStore();

  const [categories, setCategories] = useState<IGameCategoryResponse[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [resultList, setResultList] = useState<FlatResultItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const flatListRef = useRef<FlatList<FlatResultItem>>(null);
  const isFetchingMore = useRef(false);
  const activeCatRef = useRef('');
  const hasInteracted = useRef(false); // true only after user has actually scrolled
  const hasMore = useRef(true);        // false when all pages are loaded

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
        // No more pages when this page's end exceeds the total game count
        hasMore.current = (page + 1) * PER_PAGE < data.TOTAL;

        // Flatten: each published schedule detail becomes one list row
        const flat: FlatResultItem[] = [];
        data.DATA.forEach(game => {
          game.SCHEDULE_DETAILS
            .filter(s => s.RESULT_PUBLISH !== 0)
            .forEach(s => {
              flat.push({ ...s, GAME_DATE: game.GAME_DATE, GAME_NAME: game.NAME });
            });
        });

        setResultList(prev => append ? [...prev, ...flat] : flat);
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
        setResultList([]);
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
      fetchUserDetails();
      fetchCategories();
    }, [])
  );

  // ── Category tab press ────────────────────────────────────────────────────
  const onTabPress = (tab: IGameCategoryResponse) => {
    if (tab.ID === activeCategory) return;
    setActiveCategory(tab.ID);
    activeCatRef.current = tab.ID;
    setPageNum(0);
    setResultList([]);
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
  // hasInteracted guard ensures this never fires on first render.
  // onScrollBeginDrag (below) sets hasInteracted = true only after real scroll.
  // onEndReachedThreshold={0.3} means it fires when 30% from the bottom = 70% scrolled.
  const onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    if (!hasInteracted.current) return;
    if (distanceFromEnd < 0) return;
    if (resultList.length === 0) return;
    if (isLoading || isFetchingMore.current) return;
    if (!hasMore.current) return;

    isFetchingMore.current = true;
    const next = pageNum + 1;
    setPageNum(next);
    fetchResults(activeCatRef.current, next, true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: FlatResultItem }) => {
    const imageUri = item.CARD_IMAGE_URL
      ? `${ENV.BASE_URL}/${item.CARD_IMAGE_URL}`
      : null;

    return (
      <LinearGradient
        colors={['#2D0A6E', '#3C1866', '#4C186B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Date header */}
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateBadge}
          >
            <CustomText style={styles.dateText}>
              {moment(item.GAME_DATE).utc().format('DD MMM YYYY')}
            </CustomText>
          </LinearGradient>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Card body */}
        <View style={styles.cardBody}>
          <View style={styles.imageWrapper}>
            <Image
              source={imageUri ? { uri: imageUri } : Images.SMALL_CARD}
              defaultSource={Images.SMALL_CARD}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.cardInfo}>
            <GradientText colors={Colors.GRADIENT.GOLD} style={styles.scheduleName}>
              {item.NAME}
            </GradientText>
            <CustomText style={styles.cardName}>
              {formatCardName(item.CARD_NAME)}
            </CustomText>
            <CustomText style={styles.gameName} numberOfLines={1}>
              {item.GAME_NAME}
            </CustomText>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const ListFooter = () => {
    if (!hasMore.current || resultList.length === 0) return null;
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
          activeGradientColors={Colors.GRADIENT.GOLD}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={resultList}
        keyExtractor={(item) => item.ID}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        style={styles.flex1}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
