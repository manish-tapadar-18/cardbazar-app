import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import CustomText from '../../../components/CustomText';
import { HomeStackParamList } from '../../../navigation/RouteTypes';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { useWalletStore } from '../../../stores/walletStore';
import { IGameRulesItem } from '../../../response/module/IGameRulesResponse';
import { styles } from './styles';
import { IGameTypeResponse } from '../../../response/module/IGameTypeResponse';
import CardItem, { PlayOption, formatCardName } from '../../../components/CardItem';
import SectionDivider from '../../../components/SectionDivider';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';
import { ENV } from '../../../utils/env';
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  card: PlayOption;
  amount: string;
}

interface CardGroup {
  suitKey: string;
  suitLabel: string;
  cards: PlayOption[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fixed rotation offsets per slot so each card lands at a slightly different angle
const DEAL_ROTATIONS = [-7, 6, -5, 8, -6, 7, -4, 9, -8, 5, -6, 7, -3, 8];

// ─── Animated card wrapper (deal-from-above animation) ───────────────────────
interface AnimatedCardProps {
  card: PlayOption;
  isSelected: boolean;
  onPress: (card: PlayOption) => void;
  index: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = React.memo(({ card, isSelected, onPress, index }) => {
  const translateY = useSharedValue(-70);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(DEAL_ROTATIONS[index % DEAL_ROTATIONS.length]);
  const scale = useSharedValue(0.78);

  useEffect(() => {
    const delay = index * 75;
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 130 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 180 }));
    rotate.value = withDelay(delay, withSpring(0, { damping: 11, stiffness: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 13, stiffness: 140 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <CardItem card={card} isSelected={isSelected} onPress={onPress} />
    </Animated.View>
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const groupBySuit = (options: PlayOption[]): CardGroup[] => {
  const map = new Map<string, PlayOption[]>();
  for (const opt of options) {
    const suitKey = opt.IMAGE_URL.split('-')[0];
    if (!map.has(suitKey)) map.set(suitKey, []);
    map.get(suitKey)!.push(opt);
  }
  return Array.from(map.entries()).map(([suitKey, cards]) => ({
    suitKey,
    suitLabel: suitKey.toUpperCase(),
    cards,
  }));
};

// ─── PlayGame Screen ──────────────────────────────────────────────────────────
const PlayGame: React.FC = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'PlayGame'>>();
  const { userDetails } = useUserStore();
  const { GAME_MASTER_SCHEDULE_ID, GAME_CATEGORY, cardImages } = route.params;
  const { setAdminDetails } = useAdminDetailsStore();
  const { balance, setWallet } = useWalletStore();

  const cardGroups = useMemo<CardGroup[]>(() => {
    try {
      const opts: PlayOption[] = JSON.parse(cardImages);
      return groupBySuit(opts);
    } catch {
      return [];
    }
  }, [cardImages]);

  // ── State ────────────────────────────────────────────────────────────────
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [amount, setAmount] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [gameRules, setGameRule] = useState<IGameRulesItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [gameType, setGameType] = useState<IGameTypeResponse[]>([]);
  const flatListRef = useRef<FlatList<CardGroup>>(null);

  // ── Fetch game types ─────────────────────────────────────────────────────
  const fetchGameTypes = useCallback(async () => {
    try {
      const response = await Repository.Game.getAllGameTypes();
      if (response.isSuccess && response.data) {
        setGameType(response.data);
      } else {
        Toast.error(response.message);
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to load game types.');
    } finally {
      // reserved for loading state cleanup if added later
    }
  }, []);

  // ── Fetch game rules (sorted by CAT_ORDER_BY ASC, TYPE_NAME DESC) ────────
  const fetchGameRules = useCallback(async () => {
    try {
      const { isSuccess, data, message } = await Repository.Game.getAllGameRules({
        filters: { search: [] },
      });
      if (isSuccess && data && data.DATA.length > 0) {
        const sorted = [...data.DATA].sort((a, b) => {
          if (a.CAT_ORDER_BY !== b.CAT_ORDER_BY) return a.CAT_ORDER_BY - b.CAT_ORDER_BY;
          if (a.TYPE_NAME < b.TYPE_NAME) return 1;
          if (a.TYPE_NAME > b.TYPE_NAME) return -1;
          return 0;
        });
        setGameRule(sorted);
      } else {
        Toast.error(message ?? 'Failed to load game rules.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      // reserved for loading state cleanup if added later
    }
  }, [GAME_CATEGORY]);

  // ── Fetch live wallet balance ─────────────────────────────────────────────
  const fetchWalletBalance = useCallback(async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    try {
      const { isSuccess, data } = await Repository.User.getUserBalance(userId);
      if (isSuccess && data) {
        setWallet(data);
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to refresh wallet balance.');
    } finally {
      // reserved for loading state cleanup if added later
    }
  }, [userDetails?.ID, setWallet]);

  // ── Fetch admin details ──────────────────────────────────────────────────
  const fetchAdminDetails = useCallback(async () => {
    try {
      const { isSuccess, data } = await Repository.User.adminDetails();
      if (isSuccess && data != null) setAdminDetails(data);
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to load admin details.');
    }
  }, [setAdminDetails]);

  // ── Fetch everything in parallel ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchAdminDetails(),
      fetchGameTypes(),
      fetchGameRules(),
      fetchWalletBalance(),
    ]);
  }, [fetchAdminDetails, fetchGameTypes, fetchGameRules, fetchWalletBalance]);

  useFocusEffect(useCallback(() => {
    fetchAll();
  }, [fetchAll]));

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAll]);

  // ── Dropdown group select ────────────────────────────────────────────────
  const selectGroup = (index: number) => {
    try {
      setCurrentGroupIndex(index);
      setIsDropdownOpen(false);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to switch category.');
    }
  };

  // ── Multi-card selection toggle ──────────────────────────────────────────
  const onCardPress = useCallback((card: PlayOption) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(card.ID)) {
        next.delete(card.ID);
      } else {
        next.add(card.ID);
      }
      return next;
    });
  }, []);

  // ── Select / deselect all cards in the current group ─────────────────────
  const onSelectAllToggle = useCallback(() => {
    const group = cardGroups[currentGroupIndex];
    if (!group) return;
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      const allSelected = group.cards.every(c => next.has(c.ID));
      if (allSelected) {
        group.cards.forEach(c => next.delete(c.ID));
      } else {
        group.cards.forEach(c => next.add(c.ID));
      }
      return next;
    });
  }, [cardGroups, currentGroupIndex]);

  // ── Add line items — supports multiple selected cards at once ────────────
  const onAddLineItem = () => {
    Keyboard.dismiss();
    try {
      const numAmount = parseFloat(amount);
      if (!amount || isNaN(numAmount) || numAmount <= 0) {
        Toast.error('Please enter a valid amount.', { placement: 'center', duration: 2500 });
        return;
      }

      if (selectedCardIds.size === 0) {
        Toast.error('Please select at least one card.', { placement: 'center', duration: 2500 });
        return;
      }

      const activeRule = gameRules.find(
        r => r.CATEGORY_ID === GAME_CATEGORY && r.TYPE_ID === (gameType[0]?.ID ?? '')
      );
      if (!activeRule) {
        Toast.error('No rules found for this game.', { placement: 'center', duration: 2500 });
        return;
      }

      const min = parseFloat(activeRule.MIN_BET);
      const max = parseFloat(activeRule.MAX_BET);
      if (numAmount < min) {
        Toast.error(`Minimum bet is ₹${min}.`, { placement: 'center', duration: 2500 });
        return;
      }
      if (numAmount > max) {
        Toast.error(`Maximum bet is ₹${max}.`, { placement: 'center', duration: 2500 });
        return;
      }

      const allCards = cardGroups.flatMap(g => g.cards);
      const selectedCards = allCards.filter(c => selectedCardIds.has(c.ID));

      const duplicates = selectedCards.filter(c => lineItems.some(i => i.card.ID === c.ID));
      if (duplicates.length > 0) {
        Toast.error('Some selected cards are already added.', { placement: 'center', duration: 2500 });
        return;
      }

      setLineItems(prev => [
        ...prev,
        ...selectedCards.map(card => ({ card, amount })),
      ]);
      setAmount('');
      setSelectedCardIds(new Set());
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to add line item.');
    }
  };

  // ── Remove line item ─────────────────────────────────────────────────────
  const removeLineItem = (cardId: number) => {
    try {
      setLineItems(prev => prev.filter(i => i.card.ID !== cardId));
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to remove item.');
    }
  };

  // ── Submit bets ──────────────────────────────────────────────────────────
  const onPlayGame = async () => {
    if (lineItems.length === 0) {
      Toast.error('Please add at least one bet before playing.', { placement: 'center', duration: 2500 });
      return;
    }

    const totalAmount = lineItems.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    if (totalAmount > balance) {
      Toast.error('Insufficient balance.', { placement: 'center', duration: 2500 });
      return;
    }

    setIsPlaying(true);
    try {
      const body = {
        GAME_MASTER_SCHEDULE_ID,
        GAME_TYPE: gameType[0]?.ID ?? '',
        USER_ID: userDetails?.ID ?? '',
        GAME_CATEGORY,
        DATA: lineItems.map(i => ({
          GAME_NUMBER: i.card.ID.toString(),
          AMOUNT: i.amount,
        })),
        SUB_TYPE: gameType[0]?.SUB_TYPE ?? 'single',
      };

      const { isSuccess, message } = await Repository.Game.playGameMultiple(body);

      if (!isSuccess) {
        Toast.error(`${message}`, { placement: 'center', duration: 3000 });
        return;
      }

      Toast.success(`${message}`, { placement: 'center', duration: 3000 });
      setLineItems([]);
      await fetchWalletBalance();
    } catch (error: any) {
      Toast.error(error?.message ?? 'Failed to place bets. Please try again.', { placement: 'center', duration: 3000 });
    } finally {
      setIsPlaying(false);
    }
  };

  // ── Track horizontal scroll page ─────────────────────────────────────────
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentGroupIndex(idx);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  // ── Render card group page ───────────────────────────────────────────────
  const renderGroupPage = ({ item }: { item: CardGroup }) => (
    <View style={[styles.groupPage, item.cards.length < 4 && { justifyContent: 'center' }]}>
      {item.cards.map((card, index) => (
        <AnimatedCard
          key={card.ID}
          card={card}
          index={index}
          isSelected={selectedCardIds.has(card.ID)}
          onPress={onCardPress}
        />
      ))}
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const currentGroup = cardGroups[currentGroupIndex];
  const currentGroupTotal = currentGroup?.cards.length ?? 0;
  const currentGroupSelectedCount = useMemo(
    () => currentGroup?.cards.filter(c => selectedCardIds.has(c.ID)).length ?? 0,
    [currentGroup, selectedCardIds],
  );
  const isAllInGroupSelected = currentGroupTotal > 0 && currentGroupSelectedCount === currentGroupTotal;

  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.bg} resizeMode="cover">

      <View style={styles.flex1}>
        <KeyboardAwareScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.GOLD}
              colors={[Colors.GOLD]}
            />
          }
        >
          {/* ── Dropdown ─────────────────────────────────────────────────── */}
          <Pressable onPress={() => setIsDropdownOpen(true)} style={styles.dropdown}>
            <CustomText style={styles.dropdownText}>
              {currentGroup?.suitLabel ?? '—'}
            </CustomText>
            <Image source={Images.ANGLE_DOWN} style={styles.angleDown} tintColor={Colors.GOLD} />
          </Pressable>

          {/* ── Select All bar ───────────────────────────────────────────── */}
          {currentGroupTotal > 0 && (
            <View style={styles.selectAllBar}>
              <View style={styles.selectionCountRow}>
                <CustomText style={styles.selectionCountNum}>{currentGroupSelectedCount}</CustomText>
                <CustomText style={styles.selectionCountSep}> / </CustomText>
                <CustomText style={styles.selectionCountTotal}>{currentGroupTotal}</CustomText>
                <CustomText style={styles.selectionCountLabel}> SELECTED</CustomText>
              </View>
              <Pressable
                onPress={onSelectAllToggle}
                style={({ pressed }) => [styles.selectAllBtn, pressed && { opacity: 0.75 }]}
              >
                {isAllInGroupSelected ? (
                  <LinearGradient
                    colors={['#FFD700', '#E8900C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.selectAllBtnInner}
                  >
                    <CustomText style={styles.selectAllBtnTextFilled}>✕  DESELECT ALL</CustomText>
                  </LinearGradient>
                ) : (
                  <View style={styles.selectAllBtnOutline}>
                    <CustomText style={styles.selectAllBtnTextOutline}>✓  SELECT ALL</CustomText>
                  </View>
                )}
              </Pressable>
            </View>
          )}

          {/* ── Horizontally paged card sets ──────────────────────────────── */}
          {cardGroups.length > 0 && (
            <FlatList
              ref={flatListRef}
              data={cardGroups}
              renderItem={renderGroupPage}
              keyExtractor={item => item.suitKey}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={getItemLayout}
              extraData={selectedCardIds}
              style={styles.cardFlatList}
              keyboardShouldPersistTaps="always"
            />
          )}
          
          <View style={styles.amountZone}>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter Amount Rs."
                placeholderTextColor={Colors.GRAY_ALT}
                keyboardType="number-pad"
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, '').replace(/^0+/, ''))}
                returnKeyType="done"
                onSubmitEditing={onAddLineItem}
              />
              <Pressable onPress={onAddLineItem} style={styles.addBtn}>
                <CustomText style={styles.addBtnText}>Add</CustomText>
              </Pressable>
            </View>
          </View>

          {/* ── Line items — white section filling remaining height ────────── */}
          <View style={styles.lineItemsSection}>
            {lineItems.length === 0 && (
              <View style={styles.emptyLineItems}>
                <View style={styles.emptyIconCircle}>
                  <CustomText style={styles.emptyIcon}>🃏</CustomText>
                </View>
                <CustomText style={styles.emptyTitle}>No Bets Added Yet</CustomText>
                <CustomText style={styles.emptySubtitle}>
                  Select a card above, enter an amount{'\n'}and tap + to place your bet
                </CustomText>
              </View>
            )}
            {lineItems.length > 0 && (
              <>
                <SectionDivider label="ADDED LINE ITEMS" />
                {lineItems.map(item => {
                  const isPendingDelete = confirmDeleteId === item.card.ID;
                  return (
                    <View key={item.card.ID} style={styles.lineItem}>
                      {/* Card thumbnail */}
                      <View style={styles.lineItemThumb}>
                        <Image
                          source={{ uri: `${ENV.BASE_URL}/${item.card.IMAGE_URL}` }}
                          defaultSource={Images.SMALL_CARD}
                          style={styles.lineItemThumbImg}
                          resizeMode="contain"
                        />
                      </View>
                      {/* Card name */}
                      <View style={styles.lineItemContent}>
                        <CustomText style={styles.lineItemName} numberOfLines={1}>
                          {formatCardName(item.card.NAME)}
                        </CustomText>
                      </View>
                      {/* Amount + delete */}
                      {isPendingDelete ? (
                        <View style={styles.deleteConfirmRow}>
                          <Pressable
                            onPress={() => setConfirmDeleteId(null)}
                            style={styles.cancelDeleteBtn}
                            hitSlop={8}
                          >
                            <CustomText style={styles.cancelDeleteText}>Cancel</CustomText>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              removeLineItem(item.card.ID);
                              setConfirmDeleteId(null);
                            }}
                            style={styles.confirmDeleteBtn}
                            hitSlop={8}
                          >
                            <CustomText style={styles.confirmDeleteText}>Delete</CustomText>
                          </Pressable>
                        </View>
                      ) : (
                        <>
                          <CustomText style={styles.lineItemAmount}>₹{item.amount}</CustomText>
                          <Pressable
                            onPress={() => setConfirmDeleteId(item.card.ID)}
                            style={styles.trashBtn}
                            hitSlop={12}
                          >
                            <Image source={Images.TRASH} style={styles.trashIcon} tintColor="rgba(255,80,80,0.9)" />
                          </Pressable>
                        </>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* ── Play Game button — pinned outside scroll ───────────────────── */}
        {lineItems.length > 0 && <Pressable
          onPress={onPlayGame}
          disabled={isPlaying}
          style={styles.playBtnWrapper}
        >
          <LinearGradient
            colors={isPlaying ? [Colors.DISABLED_BG, Colors.DISABLED_BG] : Colors.GRADIENT.SPACER_CORE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playBtnGradient}
          >
            <CustomText style={styles.playBtnText}>
              {isPlaying ? 'PLACING BETS...' : 'PLAY GAME'}
            </CustomText>
          </LinearGradient>
        </Pressable>}
      </View>

      {/* ── Suit group dropdown modal ───────────────────────────────────────── */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.dropdownModal}>
            <LinearGradient
              colors={Colors.GRADIENT.HEADER}
              style={styles.dropdownModalHeader}
            >
              <CustomText style={styles.dropdownModalTitle}>SELECT CATEGORY</CustomText>
            </LinearGradient>
            {cardGroups.map((group, index) => (
              <Pressable
                key={group.suitKey}
                onPress={() => selectGroup(index)}
                style={[
                  styles.dropdownItem,
                  index === currentGroupIndex && styles.dropdownItemActive,
                  index < cardGroups.length - 1 && styles.dropdownItemBorder,
                ]}
              >
                <CustomText style={styles.dropdownItemText}>
                  {group.suitLabel}
                </CustomText>
                {index === currentGroupIndex && (
                  <CustomText style={styles.dropdownItemCheck}>✓</CustomText>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ImageBackground>
  );
};

export default PlayGame;
