import React, { useCallback, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import GradientIconBar from '../../../components/GradientIconBar';
import CustomText from '../../../components/CustomText';
import GradientText from '../../../components/GradientText';
import DatePickerModal from '../../../components/DatePickerModal';
import TransactionSkeleton from '../../../components/TransactionSkeleton';
import EmptyState from '../../../components/EmptyState';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { clearAllStores } from '../../../stores/clearAllStores';
import { ITransactionItem } from '../../../response/module/ITransactionResponse';
import { ITransactionRequest } from '../../../request/module/ITransactionRequest';
import { styles } from './styles';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 14;
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const SORT_FILTER = {
    FIELD_NAME: 'USER_TRANSACTION.CREATED_AT',
    SORT_ORDER: 'DESC' as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TypeFilter = '' | 'ADD' | 'WITHDRAWAL' | 'PLAY_GAME' | 'SETTLE_GAME';

interface FilterItem {
    label: string;
    value: TypeFilter;
    color: string;
}

// ─── Filter config — each chip has its own accent color ──────────────────────
const FILTERS: FilterItem[] = [
    { label: 'ALL', value: '', color: Colors.GOLD },
    { label: 'DEPOSIT', value: 'ADD', color: Colors.GREEN },
    { label: 'WITHDRAWAL', value: 'WITHDRAWAL', color: '#F6AAAD' },
    { label: 'GAME PLAY', value: 'PLAY_GAME', color: Colors.YELLOW },
    { label: 'SETTLE GAME', value: 'SETTLE_GAME', color: Colors.WHITE },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTypeColor = (type: string): string => {
    switch (type) {
        case 'ADD': return Colors.GREEN;
        case 'WITHDRAWAL': return '#F6AAAD';
        case 'PLAY_GAME': return Colors.YELLOW;
        case 'SETTLE_GAME': return Colors.WHITE;
        default: return Colors.WHITE_75;
    }
};

const getTypeLabel = (type: string): string => {
    switch (type) {
        case 'ADD': return 'DEPOSIT';
        case 'WITHDRAWAL': return 'WITHDRAWAL';
        case 'PLAY_GAME': return 'GAME PLAY';
        case 'SETTLE_GAME': return 'SETTLEMENT';
        default: return type;
    }
};

const getTypeGradient = (type: string): string[] => {
    switch (type) {
        case 'ADD': return ['#66FF33', '#3BD414'];
        case 'WITHDRAWAL': return ['#F6AAAD', '#fc0303'];
        case 'PLAY_GAME': return ['#FFE600', '#FFD700'];
        case 'SETTLE_GAME': return ['#FFFFFF', '#CCCCCC'];
        default: return ['#FFFFFF', '#AAAAAA'];
    }
};

// Always sends both date + (optional) type filter together
const buildPayload = (userId: string, typeFilter: TypeFilter, date: string): ITransactionRequest => {
    const search: ITransactionRequest['filters']['search'] = [
        { FIELD_NAME: 'USER_TRANSACTION.USER_ID', FIELD_VALUE: userId, OPT: '=' },
        { FIELD_NAME: 'USER_TRANSACTION.DATE', FIELD_VALUE: date, OPT: '=' },
    ];
    if (typeFilter !== '') {
        search.push({ FIELD_NAME: 'USER_TRANSACTION.TYPE', FIELD_VALUE: typeFilter, OPT: '=' });
    }
    return { filters: { search, sortFilter: SORT_FILTER } };
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const TransactionHistory = () => {
    const { userDetails } = useUserStore();

    const [transactions, setTransactions] = useState<ITransactionItem[]>([]);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { setAdminDetails } = useAdminDetailsStore();
    const flatListRef = useRef<FlatList<ITransactionItem>>(null);
    // Prevents onEndReached firing multiple times while a page request is in flight
    const isFetchingMore = useRef(false);

    // ── Fetch user details — logout if INACTIVE ───────────────────────────────
    const fetchUserDetails = useCallback(async () => {
        const email = userDetails?.EMAIL;
        if (!email) return;
        try {
            const { isSuccess, data } = await Repository.User.userDetails({ EMAIL: email });
            if (isSuccess && data?.STATUS === 'INACTIVE') {
                clearAllStores();
            }
        } catch (error: any) {
            Toast.error(error?.message ?? 'Failed to verify session.');
        }
    }, [userDetails?.EMAIL]);

    // ── Core fetch — combines type + date, supports pagination ────────────────
    const fetchTransactions = useCallback(async (
        type: TypeFilter,
        date: string,
        page: number,
        append: boolean
    ) => {
        const userId = userDetails?.ID;
        if (!userId) return;
        if (page === 0) setIsLoading(true);
        try {
            const payload = buildPayload(userId, type, date);
            const { isSuccess, data, message } = await Repository.Transaction.getTransactionList(
                payload, PER_PAGE * page, PER_PAGE
            );
            if (isSuccess && data) {
                setTotal(data.TOTAL);
                setTransactions(prev => append ? [...prev, ...data.DATA] : data.DATA);
            } else {
                Toast.error(message ?? 'Failed to load transactions.');
            }
        } catch (error: any) {
            Toast.error(error?.message ?? 'Something went wrong.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            isFetchingMore.current = false;
        }
    }, [userDetails?.ID]);

    // On screen focus: reset to ALL + today
    useFocusEffect(
        useCallback(() => {
            const fetchAdminDetails = async () => {
                const { isSuccess, data } = await Repository.User.adminDetails();
                if (isSuccess && data != null) setAdminDetails(data);
            };
            fetchAdminDetails();
            fetchUserDetails();
            setTypeFilter('');
            setSelectedDate(TODAY);
            setPageNum(0);
            fetchTransactions('', TODAY, 0, false);
        }, [])
    );

    // ── Type chip press — keeps current date ──────────────────────────────────
    const onTypePress = (filter: TypeFilter) => {
        setTypeFilter(filter);
        setPageNum(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        fetchTransactions(filter, selectedDate, 0, false);
    };

    // ── Date confirmed — keeps current type filter ─────────────────────────────
    const onDateConfirmed = (date: string) => {
        setShowDatePicker(false);
        setSelectedDate(date);
        setPageNum(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        fetchTransactions(typeFilter, date, 0, false);
    };

    // ── Clear — reset to ALL + today ──────────────────────────────────────────
    const onClearFilters = () => {
        setTypeFilter('');
        setSelectedDate(TODAY);
        setPageNum(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        fetchTransactions('', TODAY, 0, false);
    };

    // ── Pull-to-refresh ───────────────────────────────────────────────────────
    const onRefresh = () => {
        setIsRefreshing(true);
        setPageNum(0);
        fetchTransactions(typeFilter, selectedDate, 0, false);
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
        if (distanceFromEnd < 0) return;               // spurious negative event at startup
        if (transactions.length === 0) return;          // skip if initial load hasn't settled
        if (isLoading || isFetchingMore.current) return; // request already in flight
        if (transactions.length >= total) return;       // all pages loaded

        isFetchingMore.current = true;
        const next = pageNum + 1;
        setPageNum(next);
        fetchTransactions(typeFilter, selectedDate, next, true);
    };

    // ─── Render helpers ──────────────────────────────────────────────────────
    const renderItem = ({ item }: { item: ITransactionItem }) => {
        const color = getTypeColor(item.TYPE);
        const typeGradient = getTypeGradient(item.TYPE);
        const hasGameInfo = !!(item.GAME_CATEGORY_NAME || item.GAME_MASTER_SCHEDULE_NAME);

        return (
            <LinearGradient
                colors={['#260030', '#44004F' ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Left accent stripe */}
                <View style={[styles.cardAccentStripe, { backgroundColor: color }]} />

                <View style={styles.cardContent}>
                    {/* Type + Date */}
                    <View style={styles.cardHeaderRow}>
                        <GradientText colors={typeGradient} style={styles.cardTypeLabel} angle={90}>
                            {getTypeLabel(item.TYPE)}
                        </GradientText>
                        <CustomText style={styles.cardDateText}>
                            {moment(item.DATE).utc().format('DD MMM YYYY')}
                        </CustomText>
                    </View>

                    {/* Game info */}
                    {hasGameInfo && (
                        <>
                            <LinearGradient
                                colors={['transparent', 'rgba(255,215,0,0.25)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardDivider}
                            />
                            <View style={styles.gameInfoSection}>
                                {item.GAME_CATEGORY_NAME ? (
                                    <CustomText style={styles.gameCategoryLabel}>
                                        {item.GAME_CATEGORY_NAME.toUpperCase()}
                                    </CustomText>
                                ) : null}
                                {item.GAME_MASTER_SCHEDULE_NAME ? (
                                    <GradientText
                                        colors={['#FFD540', '#FFE600', '#FFA500']}
                                        locations={[0, 0.5, 1]}
                                        style={styles.gameNameLabel}
                                        angle={90}
                                        numberOfLines={1}
                                    >
                                        {item.GAME_MASTER_SCHEDULE_NAME}
                                    </GradientText>
                                ) : null}
                            </View>
                        </>
                    )}

                    {/* Amount */}
                    <LinearGradient
                        colors={['transparent', 'rgba(255,215,0,0.2)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardDivider}
                    />
                    <View style={styles.cardAmountRow}>
                        <GradientText
                            colors={['#FFD540', '#FFE600', '#FFF177', '#FFA500']}
                            locations={[0, 0.35, 0.65, 1]}
                            style={styles.cardAmountText}
                            angle={90}
                        >
                            {`INR ${Math.abs(item.AMOUNT)}`}
                        </GradientText>
                    </View>
                </View>
            </LinearGradient>
        );
    };

    const ItemSeparator = () => null;

    const ListEmpty = () => {
        if (isLoading) return null;
        return (
            <EmptyState
                image={Images.TRANSACTION}
                title="No Transactions Found"
                subtitle="Try changing the filter or selecting a different date."
            />
        );
    };

    const ListFooter = () => {
        if (transactions.length === 0 || transactions.length >= total) return null;
        return (
            <View style={styles.footerLoader}>
                <CustomText style={styles.footerText}>Loading more...</CustomText>
            </View>
        );
    };

    // ─── Derived ────────────────────────────────────────────────────────────────
    const isDefaultState = typeFilter === '' && selectedDate === TODAY;
    const activeTypeConfig = FILTERS.find(f => f.value === typeFilter);

    return (
        <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
            <GradientIconBar />

            {/* ── Filter Bar ────────────────────────────────────────────────────── */}
            <LinearGradient
                colors={['#2A0D5C', '#3A1A72', '#2A0D5C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterBar}
            >
                <View style={styles.filterRow}>

                    {/* Scrollable type chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterScrollContent}
                    >
                        {FILTERS.map(filter => {
                            const isActive = typeFilter === filter.value;
                            return (
                                <Pressable
                                    key={filter.value || 'all'}
                                    onPress={() => onTypePress(filter.value)}
                                    style={[
                                        styles.chip,
                                        isActive && {
                                            borderColor: filter.color,
                                            backgroundColor: `${filter.color}22`,
                                        },
                                    ]}
                                >
                                    <View style={[
                                        styles.chipDot,
                                        { backgroundColor: isActive ? filter.color : 'rgba(255,255,255,0.25)' },
                                    ]} />
                                    <CustomText style={[
                                        styles.chipText,
                                        ...(isActive ? [{ color: filter.color }] : []),
                                    ]}>
                                        {filter.label}
                                    </CustomText>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Fixed right: Date pill + Clear */}
                    <View style={styles.rightControls}>
                        <Pressable style={styles.datePill} onPress={() => setShowDatePicker(true)}>
                            <Image
                                source={Images.CLOCK}
                                style={styles.datePillIcon}
                                resizeMode="contain"
                            />
                            <CustomText style={styles.datePillText}>
                                {moment(selectedDate).format('DD/MM/YY')}
                            </CustomText>
                        </Pressable>

                        <Pressable
                            style={[styles.clearBtn, isDefaultState && { opacity: 0.35 }]}
                            onPress={onClearFilters}
                            disabled={isDefaultState}
                        >
                            <CustomText style={styles.clearText}>✕</CustomText>
                        </Pressable>
                    </View>
                </View>

                {/* Active filter summary strip */}
                {(!isDefaultState) && (
                    <View style={styles.activeDateStrip}>
                        {activeTypeConfig && activeTypeConfig.value !== '' && (
                            <CustomText style={[styles.activeDateStripValue, { color: activeTypeConfig.color }]}>
                                {activeTypeConfig.label}
                            </CustomText>
                        )}
                        {activeTypeConfig && activeTypeConfig.value !== '' && (
                            <CustomText style={styles.activeDateStripText}>·</CustomText>
                        )}
                        <CustomText style={styles.activeDateStripText}>
                            {moment(selectedDate).format('DD MMM YYYY')}
                        </CustomText>
                    </View>
                )}
            </LinearGradient>

            {/* ── Transaction List / Skeleton ────────────────────────────────────── */}
            {isLoading && pageNum === 0 ? (
                <TransactionSkeleton />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={transactions}
                    keyExtractor={item => item.ID}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ItemSeparator}
                    ListEmptyComponent={ListEmpty}
                    ListFooterComponent={ListFooter}
                    contentContainerStyle={styles.listContent}
                    style={{
                        flex: 1,
                    }}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    initialNumToRender={PER_PAGE}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── Date Picker Modal ──────────────────────────────────────────────── */}
            <DatePickerModal
                visible={showDatePicker}
                onConfirm={onDateConfirmed}
                onClose={() => setShowDatePicker(false)}
            />
        </ImageBackground>
    );
};

export default TransactionHistory;
