import React from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DemoStackParamList } from '../../types/NavigationStack';
import { useDemoStore, DemoCartItem } from '../../stores/demoStore';
import { Colors } from '../../utils/Colors';
import { rf, rh, rw } from '../../utils/responsive';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import CustomText from '../../components/CustomText';
import { Images } from '../../utils/Images';
import { useLanguageModalStore } from '../../stores/languageModalStore';

type Nav = NativeStackNavigationProp<DemoStackParamList, 'CardList'>;

type CardGame = Omit<DemoCartItem, 'quantity'> & { players: string };

const CARD_GAMES: CardGame[] = [
    {
        id: '1',
        name: 'Teen Patti Classic',
        description: 'Traditional 3-card Indian poker — test your bluff!',
        price: 299,
        suit: '♠',
        players: '2–6 players',
    },
    {
        id: '2',
        name: 'Rummy Pro Set',
        description: 'Premium 2-deck rummy set with jokers & scorepad',
        price: 449,
        suit: '♥',
        players: '2–6 players',
    },
    {
        id: '3',
        name: 'Poker Championship Pack',
        description: 'Casino-grade cards with 200 clay chips & dealer button',
        price: 599,
        suit: '♦',
        players: '2–8 players',
    },
    {
        id: '4',
        name: 'Andar Bahar Deluxe',
        description: 'Classic Indian card game with premium dealer mat',
        price: 349,
        suit: '♣',
        players: '2–10 players',
    },
    {
        id: '5',
        name: 'Blackjack Master Set',
        description: 'Vegas-style blackjack with full felt mat & chips',
        price: 499,
        suit: '♠',
        players: '2–7 players',
    },
    {
        id: '6',
        name: 'Flash (28 Cards)',
        description: 'Popular 28-card flash game pack — quick & exciting',
        price: 199,
        suit: '♥',
        players: '4 players',
    },
    {
        id: '7',
        name: 'Bridge Card Set',
        description: 'Tournament-quality bridge set with bidding pad',
        price: 379,
        suit: '♦',
        players: '4 players',
    },
    {
        id: '8',
        name: 'Solitaire Premium Deck',
        description: 'Linen-finish single deck — perfect for solo play',
        price: 249,
        suit: '♣',
        players: '1 player',
    },
];

const suitColor = (suit: string) =>
    suit === '♥' || suit === '♦' ? '#FF4D4D' : Colors.WHITE;

export default function CardList() {
    const navigation = useNavigation<Nav>();
    const { cart, addToCart, removeFromCart, updateQuantity, clearDemo } = useDemoStore();
    const { openModal } = useLanguageModalStore();

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    const cartItem = (id: string) => cart.find((c) => c.id === id);

    const handleAdd = (game: CardGame) => {
        addToCart({
            id: game.id,
            name: game.name,
            price: game.price,
            suit: game.suit,
            description: game.description,
        });
    };

    const handleDecrease = (id: string) => {
        const item = cartItem(id);
        if (!item) { return; }
        if (item.quantity === 1) {
            removeFromCart(id);
        } else {
            updateQuantity(id, item.quantity - 1);
        }
    };

    const renderGame = ({ item }: { item: CardGame }) => {
        const inCart = cartItem(item.id);
        const isRed = item.suit === '♥' || item.suit === '♦';
        return (
            <View style={styles.gameCard}>
                {/* Suit watermark */}
                <CustomText style={[styles.suitWatermark, { color: isRed ? 'rgba(255,77,77,0.07)' : 'rgba(255,255,255,0.05)' }]}>
                    {item.suit}
                </CustomText>

                <View style={styles.gameCardContent}>
                    <View style={styles.gameLeft}>
                        <View style={[styles.suitBadge, { borderColor: isRed ? '#FF4D4D' : Colors.GOLD }]}>
                            <CustomText style={[styles.suitBadgeText, { color: isRed ? '#FF4D4D' : Colors.GOLD }]}>
                                {item.suit}
                            </CustomText>
                        </View>
                    </View>

                    <View style={styles.gameInfo}>
                        <CustomText style={styles.gameName}>{item.name}</CustomText>
                        <CustomText style={styles.gameDesc}>{item.description}</CustomText>
                        <View style={styles.gameMeta}>
                            <CustomText style={styles.gamePlayers}>{item.players}</CustomText>
                            <CustomText style={styles.gamePrice}>
                                ₹{item.price.toLocaleString('en-IN')}
                            </CustomText>
                        </View>
                    </View>
                </View>

                {/* Cart controls */}
                {inCart ? (
                    <View style={styles.qtyRow}>
                        <TouchableOpacity
                            onPress={() => handleDecrease(item.id)}
                            style={styles.qtyBtn}
                        >
                            <CustomText style={styles.qtyBtnText}>−</CustomText>
                        </TouchableOpacity>
                        <CustomText style={styles.qtyCount}>{inCart.quantity}</CustomText>
                        <TouchableOpacity
                            onPress={() => handleAdd(item)}
                            style={styles.qtyBtn}
                        >
                            <CustomText style={styles.qtyBtnText}>+</CustomText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => handleAdd(item)} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtn}
                        >
                            <CustomText style={styles.addBtnText}>Add to Cart</CustomText>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <LinearGradient colors={['#1B0535', '#2D0A6E', '#3A0D7A']} style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#1B0535" />

            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
                <CustomText style={styles.headerTitle}>Card Games</CustomText>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Cart')}
                        style={styles.cartBtn}
                        activeOpacity={0.8}
                    >
                        <Image source={Images.SMALL_CARD} style={styles.cartIcon} resizeMode="contain" />
                        {cartCount > 0 && (
                            <View style={styles.cartBadge}>
                                <CustomText style={styles.cartBadgeText}>{cartCount}</CustomText>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openModal} style={styles.langBtn} activeOpacity={0.8}>
                        <Image source={Images.LANGUAGE} style={styles.langIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearDemo} style={styles.logoutBtn} activeOpacity={0.8}>
                        <Image source={Images.LOGOUT} style={styles.logoutIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Gold divider */}
            <LinearGradient
                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.divider}
            />

            <FlatList
                data={CARD_GAMES}
                keyExtractor={(item) => item.id}
                renderItem={renderGame}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(4),
        paddingTop: rh(5),
        paddingBottom: rh(1.5),
    },
    headerLogo: {
        width: rw(8),
        height: rw(8),
        marginRight: rw(2),
    },
    headerTitle: {
        flex: 1,
        color: Colors.WHITE,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(3),
    },
    cartBtn: {
        position: 'relative',
        padding: rw(1),
    },
    cartIcon: {
        width: rw(6.5),
        height: rw(6.5),
        tintColor: Colors.GOLD,
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#FF4D4D',
        borderRadius: 10,
        minWidth: rw(4.5),
        height: rw(4.5),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    cartBadgeText: {
        color: Colors.WHITE,
        fontSize: rf(2.5),
        fontFamily: FontFamilyWithWeight[700],
    },
    langBtn: { padding: rw(1) },
    langIcon: {
        width: rw(6),
        height: rw(6),
        tintColor: Colors.WHITE_55,
    },
    logoutBtn: { padding: rw(1) },
    logoutIcon: {
        width: rw(6),
        height: rw(6),
        tintColor: 'rgba(255,77,77,0.85)',
    },

    divider: {
        height: 1,
        marginHorizontal: rw(4),
        marginBottom: rh(1),
    },

    list: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(4),
        gap: rh(1.5),
    },

    gameCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: rw(4),
        overflow: 'hidden',
    },
    suitWatermark: {
        position: 'absolute',
        right: rw(3),
        top: rh(0.5),
        fontSize: rf(18),
        fontFamily: FontFamilyWithWeight[900],
    },
    gameCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: rh(1.5),
    },
    gameLeft: {
        marginRight: rw(3),
        marginTop: rh(0.3),
    },
    suitBadge: {
        width: rw(10),
        height: rw(10),
        borderRadius: rw(5),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    suitBadgeText: {
        fontSize: rf(5),
        lineHeight: rf(6),
    },
    gameInfo: { flex: 1 },
    gameName: {
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[600],
        marginBottom: rh(0.4),
    },
    gameDesc: {
        color: Colors.WHITE_55,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
        lineHeight: rf(4.5),
        marginBottom: rh(0.6),
    },
    gameMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    gamePlayers: {
        color: 'rgba(255,215,0,0.65)',
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
    },
    gamePrice: {
        color: Colors.GOLD,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[700],
    },

    addBtn: {
        borderRadius: 10,
        paddingVertical: rh(1),
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[600],
    },

    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,215,0,0.08)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.25)',
        gap: rw(4),
        paddingVertical: rh(0.8),
    },
    qtyBtn: {
        width: rw(8),
        height: rw(8),
        borderRadius: rw(4),
        backgroundColor: 'rgba(255,215,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        color: Colors.GOLD,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rf(6),
    },
    qtyCount: {
        color: Colors.WHITE,
        fontSize: rf(4.5),
        fontFamily: FontFamilyWithWeight[700],
        minWidth: rw(7),
        textAlign: 'center',
    },
});
