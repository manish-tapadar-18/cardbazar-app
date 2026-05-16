import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import GradientIconBar from '../../../components/GradientIconBar';
import CustomText from '../../../components/CustomText';
import HorizontalTabBar from '../../../components/HorizontalTabBar';
import DatePickerModal from '../../../components/DatePickerModal';
import PlayHistorySkeleton from '../../../components/PlayHistorySkeleton';
import PlayHistoryCard from '../../../components/PlayHistoryCard';
import EmptyState from '../../../components/EmptyState';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { clearAllStores } from '../../../stores/clearAllStores';
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse';
import { IPlayHistoryItem } from '../../../response/module/IPlayHistoryResponse';
import { IPlayHistoryRequest } from '../../../request/module/IPlayHistoryRequest';
import { styles } from './styles';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DateGroup {
  date: string;       // display label  e.g. "23-12-2022"
  dateKey: string;    // normalised key e.g. "2022-12-23"
  items: IPlayHistoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 14;

const SORT_FILTER = {
  FIELD_NAME: 'USER_GAME_PLAY.CREATED_AT',
  SORT_ORDER: 'DESC' as const,
};

const buildPayload = (
  userId: string,
  categoryId: string,
  date: string
): IPlayHistoryRequest => ({
  filters: {
    search: [
      { FIELD_NAME: 'USER_GAME_PLAY.USER_ID', FIELD_VALUE: userId, OPT: '=' },
      { FIELD_NAME: 'USER_GAME_PLAY.RESULT_PUBLISH', FIELD_VALUE: '', OPT: '=' },
      { FIELD_NAME: 'USER_GAME_PLAY.DATE', FIELD_VALUE: date, OPT: '=' },
      { FIELD_NAME: 'GAME_CATEGORY.ID', FIELD_VALUE: categoryId, OPT: '=' },
    ],
    sortFilter: SORT_FILTER,
  },
});


// ─── Screen ───────────────────────────────────────────────────────────────────
const PlayHistory = () => {
  const { userDetails } = useUserStore();

  const [categories, setCategories] = useState<IGameCategoryResponse[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [history, setHistory] = useState<IPlayHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { setAdminDetails } = useAdminDetailsStore();
  const flatListRef = useRef<FlatList<DateGroup>>(null);
  const isFetchingMore = useRef(false);
  const activeCatRef = useRef('');
  const activeDateRef = useRef('');

  // ── Fetch user — logout if INACTIVE ───────────────────────────────────────
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
  const fetchHistory = useCallback(async (
    categoryId: string,
    date: string,
    page: number,
    append: boolean
  ) => {
    const userId = userDetails?.ID;
    if (!userId || !categoryId) return;
    if (page === 0) setIsLoading(true);
    try {
      const payload = buildPayload(userId, categoryId, date);
      const { isSuccess, data, message } = await Repository.PlayHistory.getPlayHistory(
        payload, PER_PAGE * page, PER_PAGE
      );
      if (isSuccess && data) {
        setTotal(data.TOTAL);
        setHistory(prev => append ? [...prev, ...data.DATA] : data.DATA);
      } else {
        Toast.error(message ?? 'Failed to load play history.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingMore.current = false;
    }
  }, [userDetails?.ID]);

  // ── Fetch categories → auto-select first → fetch history ─────────────────
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
        setHistory([]);
        fetchHistory(firstId, activeDateRef.current, 0, false);
      } else {
        Toast.error(message ?? 'Failed to load categories.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsCatLoading(false);
    }
  }, [fetchHistory]);

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
    setHistory([]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    fetchHistory(tab.ID, activeDateRef.current, 0, false);
  };

  // ── Date confirmed — keep active category ─────────────────────────────────
  const onDateConfirmed = (date: string) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    activeDateRef.current = date;
    setPageNum(0);
    setHistory([]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    fetchHistory(activeCatRef.current, date, 0, false);
  };

  // ── Clear date — keep active category ─────────────────────────────────────
  const onClearDate = () => {
    setSelectedDate('');
    activeDateRef.current = '';
    setPageNum(0);
    setHistory([]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    fetchHistory(activeCatRef.current, '', 0, false);
  };

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = () => {
    setIsRefreshing(true);
    setPageNum(0);
    fetchHistory(activeCatRef.current, activeDateRef.current, 0, false);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    if (distanceFromEnd < 0) return;
    if (history.length === 0) return;
    if (isLoading || isFetchingMore.current) return;
    if (history.length >= total) return;

    isFetchingMore.current = true;
    const next = pageNum + 1;
    setPageNum(next);
    fetchHistory(activeCatRef.current, activeDateRef.current, next, true);
  };

  // ── Group flat history by date (handles pagination merge automatically) ────
  const groupedHistory = useMemo<DateGroup[]>(() => {
    const map = new Map<string, DateGroup>();
    for (const item of history) {
      const dateKey = moment(item.DATE).utc().format('YYYY-MM-DD');
      const display  = moment(item.DATE).utc().format('DD-MM-YYYY');
      if (!map.has(dateKey)) {
        map.set(dateKey, { date: display, dateKey, items: [] });
      }
      map.get(dateKey)!.items.push(item);
    }
    return Array.from(map.values());
  }, [history]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: DateGroup }) => (
    <PlayHistoryCard date={item.date} items={item.items} />
  );

  const ListFooter = () => {
    if (history.length === 0 || history.length >= total) return null;
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
        image={Images.HISTORY}
        title="No Play History Found"
        subtitle="Select a different category or date to view your history."
      />
    );
  };

  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
      <GradientIconBar />

      {/* ── Category Tabs ─────────────────────────────────────────────────── */}
      {!isCatLoading && categories.length > 0 && (
        <HorizontalTabBar
          tabs={categories}
          activeKey={activeCategory}
          onPress={onTabPress}
        />
      )}

      {/* ── Date Filter Bar ───────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#2A0D5C', '#3A1A72', '#2A0D5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.dateBar}>
          <Pressable style={styles.datePill} onPress={() => setShowDatePicker(true)}>
            <Image source={Images.CLOCK} style={styles.datePillIcon} resizeMode="contain" />
            <CustomText style={styles.datePillText}>
              {selectedDate
                ? moment(selectedDate).format('DD/MM/YY')
                : 'FILTER DATE'}
            </CustomText>
          </Pressable>
          <Pressable
            style={[styles.clearBtn, !selectedDate && { opacity: 0.3 }]}
            onPress={onClearDate}
            disabled={!selectedDate}
          >
            <CustomText style={styles.clearText}>✕</CustomText>
          </Pressable>
        </View>
      </LinearGradient>

      {/* ── List / Skeleton ───────────────────────────────────────────────── */}
      {isLoading && pageNum === 0 ? (
        <PlayHistorySkeleton />
      ) : (
        <FlatList
          ref={flatListRef}
          data={groupedHistory}
          keyExtractor={item => item.dateKey}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
          style={styles.flex1}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          initialNumToRender={PER_PAGE}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Date Picker Modal ─────────────────────────────────────────────── */}
      <DatePickerModal
        visible={showDatePicker}
        onConfirm={onDateConfirmed}
        onClose={() => setShowDatePicker(false)}
      />
    </ImageBackground>
  );
};

export default PlayHistory;
