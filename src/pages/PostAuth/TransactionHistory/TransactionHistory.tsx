import React, { useCallback, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
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
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 14;
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const SORT_FILTER = {
    FIELD_NAME: 'USER_TRANSACTION.CREATED_AT',
    SORT_ORDER: 'DESC' as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TypeFilter = '' | 'ADD' | 'WITHDRAWAL' | 'PLAY_GAME' | 'SETTLE_GAME';
type TxStyle   = 'deposit' | 'withdrawal' | 'gameplay' | 'win';

interface FilterItem {
    label: string;
    value: TypeFilter;
    color: string;
}

// ─── Filter config ─────────────────────────────────────────────────────────────
const FILTERS: FilterItem[] = [
    { label: 'ALL',         value: '',            color: Colors.GOLD    },
    { label: 'DEPOSIT',     value: 'ADD',         color: Colors.GREEN   },
    { label: 'WITHDRAWAL',  value: 'WITHDRAWAL',  color: '#F6AAAD'      },
    { label: 'GAME PLAY',   value: 'PLAY_GAME',   color: Colors.YELLOW  },
    { label: 'SETTLE GAME', value: 'SETTLE_GAME', color: Colors.WHITE   },
];

// ─── Payload builder ──────────────────────────────────────────────────────────
const buildPayload = (userId: string, typeFilter: TypeFilter, date: string): ITransactionRequest => {
    const search: ITransactionRequest['filters']['search'] = [
        { FIELD_NAME: 'USER_TRANSACTION.USER_ID',  FIELD_VALUE: userId, OPT: '=' },
        { FIELD_NAME: 'USER_TRANSACTION.DATE',     FIELD_VALUE: date,   OPT: '=' },
    ];
    if (typeFilter !== '') {
        search.push({ FIELD_NAME: 'USER_TRANSACTION.TYPE', FIELD_VALUE: typeFilter, OPT: '=' });
    }
    return { filters: { search, sortFilter: SORT_FILTER } };
};

// ─────────────────────────────────────────────────────────────────────────────
// Transaction-type helpers
// ─────────────────────────────────────────────────────────────────────────────

function getTxStyle(type: string): TxStyle {
    switch (type) {
        case 'ADD':          return 'deposit';
        case 'WITHDRAWAL':   return 'withdrawal';
        case 'PLAY_GAME':    return 'gameplay';
        case 'SETTLE_GAME':  return 'win';
        default:             return 'deposit';
    }
}

/** Display label shown inside the shining badge (right side) */
function getTxLabel(type: string): string {
    switch (type) {
        case 'ADD':          return 'DEPOSIT';
        case 'WITHDRAWAL':   return 'WITHDRAWAL';
        case 'PLAY_GAME':    return 'GAME PLAY';
        case 'SETTLE_GAME':  return 'WIN';
        default:             return type;
    }
}

/** Left-side headline for non-game transactions */
function getTxTitle(type: string): string {
    switch (type) {
        case 'ADD':         return 'BALANCE\nCREDIT';
        case 'WITHDRAWAL':  return 'WITHDRAWAL';
        default:            return 'TRANSACTION';
    }
}

/** Emoji icon shown next to the headline */
function getTxIcon(type: string): string {
    switch (type) {
        case 'ADD':         return '💰';
        case 'WITHDRAWAL':  return '💸';
        case 'PLAY_GAME':   return '🎮';
        case 'SETTLE_GAME': return '🏆';
        default:            return '💳';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ShineStatus — animated gradient text badge (no border, just shining text)
// ─────────────────────────────────────────────────────────────────────────────

const TX_GRADIENT: Record<TxStyle, string[]> = {
    win:        ['#43E97B', '#38F9D7', '#00FF55', '#43E97B', '#38F9D7'],
    deposit:    ['#66FF33', '#00FF88', '#3BD414', '#66FF33', '#00FF88'],
    withdrawal: ['#FF4444', '#FF8C00', '#FF4444', '#FF0055', '#FF4444'],
    gameplay:   ['#FFE600', '#FFD700', '#FFA500', '#FFE600', '#FFD700'],
};

function txFontSize(label: string): number {
    if (label.length >= 10) return rf(3.0); // WITHDRAWAL
    if (label.length >= 8)  return rf(3.4); // GAME PLAY
    if (label.length >= 6)  return rf(3.9); // DEPOSIT
    return rf(4.6);                          // WIN
}

function shineWidth(label: string): number {
    if (label === 'WIN')        return rw(18);
    if (label === 'DEPOSIT')    return rw(24);
    if (label === 'GAME PLAY')  return rw(28);
    if (label === 'WITHDRAWAL') return rw(34);
    return rw(26);
}

const ShineStatus: React.FC<{ label: string; type: TxStyle }> = ({ label, type }) => {
    const shimmerX = useSharedValue(-rw(16));

    React.useEffect(() => {
        shimmerX.value = -rw(16);
        shimmerX.value = withRepeat(
            withTiming(rw(30), { duration: 1800, easing: Easing.linear }),
            -1,
            false,
        );
        return () => cancelAnimation(shimmerX);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animShine = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerX.value }, { skewX: '-18deg' }],
    }));

    const width = shineWidth(label);

    return (
        <MaskedView
            style={[txStyles.shineWrapper, { width }]}
            maskElement={
                <View style={[txStyles.shineWrapper, { width, backgroundColor: 'transparent' }]}>
                    <CustomText
                        style={[txStyles.resultText, { fontSize: txFontSize(label) }]}
                        numberOfLines={1}
                    >
                        {label}
                    </CustomText>
                </View>
            }
        >
            <LinearGradient
                colors={TX_GRADIENT[type]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[txStyles.shineWrapper, { width }]}
            />
            <Animated.View style={[txStyles.shineBar, animShine]}>
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.80)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </MaskedView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LV — label → value row  (Inter font, full width)
// ─────────────────────────────────────────────────────────────────────────────

const LV: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <View style={lvStyles.row}>
        <CustomText style={lvStyles.label}>{label}</CustomText>
        <View style={lvStyles.valueSide}>
            {typeof value === 'string' || typeof value === 'number'
                ? <CustomText style={lvStyles.valueText}>{value}</CustomText>
                : value}
        </View>
    </View>
);

const lvStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(0.55),
    },
    label: {
        width: rw(32),
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight.inter_400,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 0.3,
    },
    valueSide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    valueText: {
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Inline card styles (scoped to this file)
// ─────────────────────────────────────────────────────────────────────────────

const txStyles = StyleSheet.create({
    cardWrapper: {
        marginHorizontal: rw(3),
        marginVertical: rh(0.7),
    },
    card: {
        borderRadius: rw(3.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.22)',
        overflow: 'hidden',
        paddingHorizontal: rw(4),
        paddingTop: rh(1.6),
        paddingBottom: rh(1.6),
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: rh(0.9),
    },
    titleBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
        flex: 1,
        marginRight: rw(2),
    },
    txIcon: {
        fontSize: rf(6.5),
        lineHeight: rf(8),
    },
    txTitleText: {
        fontSize: rf(5.2),
        fontFamily: FontFamilyWithWeight.inter_700,
        letterSpacing: 0.5,
        flexShrink: 1,
    },
    // ShineStatus
    shineWrapper: {
        height: rf(5.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    shineBar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: rw(12),
    },
    resultText: {
        fontFamily: FontFamilyWithWeight.inter_700,
        letterSpacing: 1.2,
        color: Colors.WHITE,
        backgroundColor: 'transparent',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,215,0,0.32)',
        marginBottom: rh(0.8),
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.2),
    },
    inrText: {
        fontSize: rf(4.4),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: '#FFD700',
        lineHeight: rf(5),
    },
    emojiIcon: {
        fontSize: rf(3.6),
        lineHeight: rf(4.4),
    },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const TransactionHistory = () => {
    const { userDetails } = useUserStore();

    const [transactions, setTransactions] = useState<ITransactionItem[]>([]);
    const [total, setTotal]               = useState(0);
    const [pageNum, setPageNum]           = useState(0);
    const [typeFilter, setTypeFilter]     = useState<TypeFilter>('');
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [isLoading, setIsLoading]       = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { setAdminDetails } = useAdminDetailsStore();
    const flatListRef      = useRef<FlatList<ITransactionItem>>(null);
    const isFetchingMore   = useRef(false);

    // ── Fetch user details — logout if INACTIVE ───────────────────────────────
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
    const fetchTransactions = useCallback(async (
        type: TypeFilter,
        date: string,
        page: number,
        append: boolean,
    ) => {
        const userId = userDetails?.ID;
        if (!userId) return;
        if (page === 0) setIsLoading(true);
        try {
            const payload = buildPayload(userId, type, date);
            const { isSuccess, data, message } = await Repository.Transaction.getTransactionList(
                payload, PER_PAGE * page, PER_PAGE,
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
        }, []),
    );

    // ── Type chip press ───────────────────────────────────────────────────────
    const onTypePress = (filter: TypeFilter) => {
        setTypeFilter(filter);
        setPageNum(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        fetchTransactions(filter, selectedDate, 0, false);
    };

    // ── Date confirmed ────────────────────────────────────────────────────────
    const onDateConfirmed = (date: string) => {
        setShowDatePicker(false);
        setSelectedDate(date);
        setPageNum(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        fetchTransactions(typeFilter, date, 0, false);
    };

    // ── Clear filters ─────────────────────────────────────────────────────────
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
        if (distanceFromEnd < 0) return;
        if (transactions.length === 0) return;
        if (isLoading || isFetchingMore.current) return;
        if (transactions.length >= total) return;

        isFetchingMore.current = true;
        const next = pageNum + 1;
        setPageNum(next);
        fetchTransactions(typeFilter, selectedDate, next, true);
    };

    // ─── Render helpers ──────────────────────────────────────────────────────
    const renderItem = ({ item }: { item: ITransactionItem }) => {
        const txStyle    = getTxStyle(item.TYPE);
        const txLabel    = getTxLabel(item.TYPE);
        const txIcon     = getTxIcon(item.TYPE);
        const isGameType = item.TYPE === 'PLAY_GAME' || item.TYPE === 'SETTLE_GAME';

        // Left-side headline: game category for game types, else type title
        const headlineText = isGameType
            ? (item.GAME_CATEGORY_NAME?.toUpperCase() ?? 'CARD GAME')
            : getTxTitle(item.TYPE);

        return (
            <View style={txStyles.cardWrapper}>
                <LinearGradient
                    colors={Colors.GRADIENT.GRADIENTHEADER}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={txStyles.card}
                >
                    {/* ── Top Row: icon + headline  |  shining type badge ── */}
                    <View style={txStyles.topRow}>
                        <View style={txStyles.titleBlock}>
                            <CustomText style={txStyles.txIcon}>{txIcon}</CustomText>
                            <GradientText
                                colors={Colors.GRADIENT.GOLD}
                                locations={Colors.GRADIENT.GOLD_LOCATIONS}
                                style={txStyles.txTitleText}
                                angle={180}
                                numberOfLines={2}
                            >
                                {headlineText}
                            </GradientText>
                        </View>

                        {/* Shining type label — no border, right side */}
                        <ShineStatus label={txLabel} type={txStyle} />
                    </View>

                    {/* ── Gold separator ── */}
                    <View style={txStyles.separator} />

                    {/* ── AMOUNT ── */}
                    <LV
                        label="AMOUNT"
                        value={
                            <View style={txStyles.inlineRow}>
                                <CustomText style={txStyles.inrText}>₹</CustomText>
                                <CustomText style={lvStyles.valueText}>
                                    {Math.abs(item.AMOUNT)}
                                </CustomText>
                            </View>
                        }
                    />

                    {/* ── CATEGORY (game transactions only) ── */}
                    {item.GAME_CATEGORY_NAME ? (
                        <LV label="CATEGORY" value={item.GAME_CATEGORY_NAME} />
                    ) : null}

                    {/* ── GAME NAME (game transactions only) ── */}
                    {item.GAME_MASTER_SCHEDULE_NAME ? (
                        <LV label="GAME NAME" value={item.GAME_MASTER_SCHEDULE_NAME} />
                    ) : null}

                </LinearGradient>
            </View>
        );
    };

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

    // ─── Derived ─────────────────────────────────────────────────────────────
    const isDefaultState    = typeFilter === '' && selectedDate === TODAY;
    const activeTypeConfig  = FILTERS.find(f => f.value === typeFilter);

    return (
        <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
            <GradientIconBar />

            {/* ── Filter Bar ────────────────────────────────────────────────── */}
            <LinearGradient
                colors={Colors.GRADIENT.GRADIENTHEADER}
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
                {!isDefaultState && (
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

            {/* ── Transaction List / Skeleton ────────────────────────────────── */}
            {isLoading ? (
                <TransactionSkeleton />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={transactions}
                    keyExtractor={item => item.ID}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => null}
                    ListEmptyComponent={ListEmpty}
                    ListFooterComponent={ListFooter}
                    contentContainerStyle={styles.listContent}
                    style={{ flex: 1 }}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    initialNumToRender={PER_PAGE}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── Date Picker Modal ──────────────────────────────────────────── */}
            <DatePickerModal
                visible={showDatePicker}
                onConfirm={onDateConfirmed}
                onClose={() => setShowDatePicker(false)}
            />
        </ImageBackground>
    );
};

export default TransactionHistory;
