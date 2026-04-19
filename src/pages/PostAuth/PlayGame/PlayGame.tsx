import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView, Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { rh } from '../../../utils/responsive';
import CustomText from '../../../components/CustomText';
import { HomeStackParamList } from '../../../navigation/RouteTypes';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';
import { useWalletStore } from '../../../stores/walletStore';
import { IGameRulesItem } from '../../../response/module/IGameRulesResponse';
import { ENV } from '../../../utils/env';
import { styles } from './styles';
import { IGameTypeResponse } from '../../../response/module/IGameTypeResponse';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlayOption {
  ID: number;
  NAME: string;
  IMAGE_URL: string;
  TYPE?: string;
  typeOrder?: number;
  cardOrder?: number;
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCardName = (name: string): string => {
  const parts = name.split('-');
  if (parts.length < 2) return name.toUpperCase();
  return `${parts[0].toUpperCase()} - ${parts[1].toUpperCase()}`;
};

// Group by TYPE field (backup: _.groupBy by card.TYPE, sorted by typeOrder/cardOrder)
const groupBySuit = (options: PlayOption[]): CardGroup[] => {
  const sorted = [...options].sort((a, b) => (a.typeOrder ?? 0) - (b.typeOrder ?? 0));
  const map: Record<string, PlayOption[]> = {};
  for (const opt of sorted) {
    const suit = opt.TYPE ?? opt.NAME.split('-')[0] ?? 'other';
    if (!map[suit]) map[suit] = [];
    map[suit].push(opt);
  }
  return Object.entries(map).map(([suitKey, cards]) => ({
    suitKey,
    suitLabel: suitKey.toUpperCase(),
    cards: [...cards].sort((a, b) => (a.cardOrder ?? 0) - (b.cardOrder ?? 0)),
  }));
};

// ─── Card Item ────────────────────────────────────────────────────────────────
const CardItem: React.FC<{
  card: PlayOption;
  isSelected: boolean;
  onPress: (card: PlayOption) => void;
}> = ({ card, isSelected, onPress }) => {
  const imageUri = `${ENV.BASE_URL}/${card.IMAGE_URL}`;
  return (
    <Pressable
      onPress={() => onPress(card)}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {isSelected && (
        <View style={styles.checkBadge}>
          <CustomText style={styles.checkMark}>✓</CustomText>
        </View>
      )}
      <CustomText style={styles.cardLabel} numberOfLines={1}>
        {formatCardName(card.NAME)}
      </CustomText>
      <Image
        source={{ uri: imageUri }}
        defaultSource={Images.SMALL_CARD}
        style={styles.cardImage}
        resizeMode="contain"
      />
    </Pressable>
  );
};

// ─── Divider with Label ───────────────────────────────────────────────────────
const SectionDivider: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <CustomText style={styles.dividerLabel}>{label}</CustomText>
    <View style={styles.dividerLine} />
  </View>
);

// ─── PlayGame Screen ──────────────────────────────────────────────────────────
const PlayGame: React.FC = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'PlayGame'>>();
  const navigation = useNavigation<any>();
  const { bottom } = useSafeAreaInsets();

  const { GAME_MASTER_SCHEDULE_ID, GAME_CATEGORY, cardImages } = route.params;

  const userDetails = useUserStore(s => s.userDetails);
  const adminDetails = useAdminDetailsStore(s => s.adminDetails);
  const { balance, setWallet } = useWalletStore();

  // ── Parse card groups (grouped by TYPE, sorted by typeOrder/cardOrder) ───
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
      Toast.error(error.message);
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
    }
  }, [GAME_CATEGORY]);

  // ── Fetch live wallet balance ─────────────────────────────────────────────
  const fetchWalletBalance = useCallback(async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    try {
      const { isSuccess, data } = await Repository.User.getUserBalance(userId);
      if (isSuccess && data) setWallet(data);
    } catch { }
  }, [userDetails?.ID, setWallet]);

  useEffect(() => {
    fetchGameTypes();
    fetchGameRules();
    fetchWalletBalance();
  }, [fetchGameTypes, fetchGameRules, fetchWalletBalance]);

  // ── Dropdown group select ────────────────────────────────────────────────
  const selectGroup = (index: number) => {
    setCurrentGroupIndex(index);
    setIsDropdownOpen(false);
    setSelectedCardIds(new Set());
    flatListRef.current?.scrollToIndex({ index, animated: true });
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

  // ── Add line items — supports multiple selected cards at once ────────────
  const onAddLineItem = () => {
    // 1. Validate amount
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Toast.error('Please enter a valid amount.', { placement: 'bottom', duration: 2500 });
      return;
    }

    // 2. Validate card selection
    if (selectedCardIds.size === 0) {
      Toast.error('Please select at least one card.', { placement: 'bottom', duration: 2500 });
      return;
    }

    // 3. Find rule matching CATEGORY_ID and TYPE_ID (backup: both must match)
    const activeRule = gameRules.find(
      r => r.CATEGORY_ID === GAME_CATEGORY && r.TYPE_ID === (gameType[0]?.ID ?? '')
    );
    if (!activeRule) {
      Toast.error('No rules found for this game.', { placement: 'bottom', duration: 2500 });
      return;
    }

    // 4. Min/max validation
    const min = parseFloat(activeRule.MIN_BET);
    const max = parseFloat(activeRule.MAX_BET);
    if (numAmount < min) {
      Toast.error(`Minimum bet is ₹${min}.`, { placement: 'bottom', duration: 2500 });
      return;
    }
    if (numAmount > max) {
      Toast.error(`Maximum bet is ₹${max}.`, { placement: 'bottom', duration: 2500 });
      return;
    }

    // 5. Collect all selected cards across all groups
    const allCards = cardGroups.flatMap(g => g.cards);
    const selectedCards = allCards.filter(c => selectedCardIds.has(c.ID));

    // 6. Duplicate check
    const duplicates = selectedCards.filter(c => lineItems.some(i => i.card.ID === c.ID));
    if (duplicates.length > 0) {
      Toast.error('Some selected cards are already added.', { placement: 'bottom', duration: 2500 });
      return;
    }

    // 7. Add all selected cards and reset (backup: setGames([...games, ...selectedCards]) + clear)
    setLineItems(prev => [
      ...prev,
      ...selectedCards.map(card => ({ card, amount })),
    ]);
    setAmount('');
    setSelectedCardIds(new Set());
  };

  // ── Remove line item ─────────────────────────────────────────────────────
  const removeLineItem = (cardId: number) => {
    setLineItems(prev => prev.filter(i => i.card.ID !== cardId));
  };

  // ── Submit bets ──────────────────────────────────────────────────────────
  const onPlayGame = () => {
    if (lineItems.length === 0) {
      Toast.error('Please add at least one bet before playing.', { placement: 'bottom', duration: 2500 });
      return;
    }

    const totalAmount = lineItems.reduce((sum, i) => sum + parseFloat(i.amount), 0);

    if (totalAmount > balance) {
      Toast.error('Insufficient balance.', { placement: 'bottom', duration: 2500 });
      return;
    }

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

    Alert.alert('Request Body', JSON.stringify(body, null, 2));
  };

  // ── Track horizontal scroll page ─────────────────────────────────────────
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentGroupIndex(idx);
      setSelectedCardIds(new Set());
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  // ── Render card group page ───────────────────────────────────────────────
  const renderGroupPage = ({ item }: { item: CardGroup }) => (
    <View style={styles.groupPage}>
      {item.cards.map(card => (
        <CardItem
          key={card.ID}
          card={card}
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
  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.bg} resizeMode="cover">

      {/* ── Header ─────────────────────────────────────────────────────────── */}


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
        keyboardVerticalOffset={0}
      >
        {/* ── Dropdown ───────────────────────────────────────────────────── */}
        <Pressable onPress={() => setIsDropdownOpen(true)} style={styles.dropdown}>
          <CustomText style={styles.dropdownText}>
            {currentGroup?.suitLabel ?? '—'}
          </CustomText>
          <Image source={Images.ANGLE_DOWN} style={styles.angleDown} tintColor={Colors.GOLD} />
        </Pressable>

        {/* ── Horizontally paged card sets ────────────────────────────────── */}
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
            style={styles.cardFlatList}
          />
        )}

        {/* ── Amount input + line items (scrollable) ──────────────────────── */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount row */}
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter Amount Rs."
              placeholderTextColor={Colors.GRAY_ALT}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              returnKeyType="done"
              onSubmitEditing={onAddLineItem}
            />
            <Pressable onPress={onAddLineItem} style={styles.addBtn}>
              <CustomText style={styles.addBtnText}>+</CustomText>
            </Pressable>
          </View>

          {/* Line items */}
          {lineItems.length > 0 && (
            <View style={styles.lineItemsSection}>
              <SectionDivider label="ADDED LINE ITEMS" />
              {lineItems.map(item => {
                const isPendingDelete = confirmDeleteId === item.card.ID;
                return (
                  <View key={item.card.ID} style={styles.lineItem}>
                    <CustomText style={styles.lineItemName} numberOfLines={1}>
                      {formatCardName(item.card.NAME)}
                    </CustomText>
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
                        <CustomText style={styles.lineItemAmount}>INR {item.amount}</CustomText>
                        <Pressable
                          onPress={() => setConfirmDeleteId(item.card.ID)}
                          style={styles.trashBtn}
                          hitSlop={12}
                        >
                          <Image source={Images.TRASH} style={styles.trashIcon} tintColor="#cc2200" />
                        </Pressable>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* ── Play Game button ────────────────────────────────────────────── */}
        <Pressable
          onPress={onPlayGame}
          disabled={isPlaying}
          style={[styles.playBtnWrapper]}
        >
          <LinearGradient
            colors={isPlaying ? [Colors.DISABLED_BG, Colors.DISABLED_BG] : Colors.GRADIENT.GOLD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.playBtnGradient, { paddingBottom: bottom || rh(2) }]}
          >
            <CustomText style={styles.playBtnText}>
              {isPlaying ? 'PLACING BETS...' : 'PLAY GAME'}
            </CustomText>
          </LinearGradient>
        </Pressable>
      </KeyboardAvoidingView>

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
