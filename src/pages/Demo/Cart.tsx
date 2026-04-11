import React from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Alert,
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

type Nav = NativeStackNavigationProp<DemoStackParamList, 'Cart'>;

export default function Cart() {
    const navigation = useNavigation<Nav>();
    const { cart, address, removeFromCart, updateQuantity, clearCart } = useDemoStore();

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleDecrease = (item: DemoCartItem) => {
        if (item.quantity === 1) {
            Alert.alert('Remove Item', `Remove "${item.name}" from cart?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.id) },
            ]);
        } else {
            updateQuantity(item.id, item.quantity - 1);
        }
    };

    const handlePlaceOrder = () => {
        if (!address.trim()) {
            Alert.alert(
                'Delivery Address Required',
                'Please add your delivery address before placing the order.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Add Address', onPress: () => navigation.navigate('MyAddress', { fromCart: true }) },
                ],
            );
            return;
        }
        clearCart();
        navigation.reset({
            index: 0,
            routes: [{ name: 'SuccessOrder', params: { totalAmount: total, itemCount } }],
        });
    };

    const suitColor = (suit: string) =>
        suit === '♥' || suit === '♦' ? '#FF4D4D' : Colors.GOLD;

    const renderItem = ({ item }: { item: DemoCartItem }) => (
        <View style={styles.cartItem}>
            <View style={[styles.suitCircle, { borderColor: suitColor(item.suit) }]}>
                <CustomText style={[styles.suitText, { color: suitColor(item.suit) }]}>
                    {item.suit}
                </CustomText>
            </View>

            <View style={styles.itemInfo}>
                <CustomText style={styles.itemName} numberOfLines={1}>{item.name}</CustomText>
                <CustomText style={styles.itemPrice}>
                    ₹{item.price.toLocaleString('en-IN')}
                </CustomText>
            </View>

            <View style={styles.qtyControls}>
                <TouchableOpacity
                    onPress={() => handleDecrease(item)}
                    style={styles.qtyBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <CustomText style={styles.qtyBtnText}>−</CustomText>
                </TouchableOpacity>
                <CustomText style={styles.qtyValue}>{item.quantity}</CustomText>
                <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.qtyBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <CustomText style={styles.qtyBtnText}>+</CustomText>
                </TouchableOpacity>
            </View>

            <View style={styles.itemTotal}>
                <CustomText style={styles.itemTotalText}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </CustomText>
                <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.trashBtn}
                >
                    <Image source={Images.TRASH} style={styles.trashIcon} resizeMode="contain" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#1B0535', '#2D0A6E', '#3A0D7A']} style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#1B0535" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Image source={Images.LEFT_ARROW} style={styles.backIcon} resizeMode="contain" />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>My Cart</CustomText>
                <CustomText style={styles.headerCount}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </CustomText>
            </View>

            <LinearGradient
                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.divider}
            />

            {/* Empty state */}
            {cart.length === 0 ? (
                <View style={styles.emptyState}>
                    <CustomText style={styles.emptySuit}>♠</CustomText>
                    <CustomText style={styles.emptyTitle}>Your cart is empty</CustomText>
                    <CustomText style={styles.emptySubtitle}>
                        Browse our card games and add them to your cart
                    </CustomText>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.browseBtn}
                        >
                            <CustomText style={styles.browseBtnText}>Browse Games</CustomText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Bottom section */}
                    <View style={styles.bottomSection}>
                        {/* Address row */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MyAddress', { fromCart: true })}
                            style={styles.addressRow}
                            activeOpacity={0.8}
                        >
                            <View style={styles.addressLeft}>
                                <Image source={Images.HOME} style={styles.addressIcon} resizeMode="contain" />
                                <View style={styles.addressTextWrap}>
                                    {address.trim() ? (
                                        <>
                                            <CustomText style={styles.addressLabel}>Delivery Address</CustomText>
                                            <CustomText style={styles.addressValue} numberOfLines={1}>
                                                {address}
                                            </CustomText>
                                        </>
                                    ) : (
                                        <>
                                            <CustomText style={styles.noAddressLabel}>No delivery address</CustomText>
                                            <CustomText style={styles.noAddressHint}>Tap to add address</CustomText>
                                        </>
                                    )}
                                </View>
                            </View>
                            <Image source={Images.ANGLE_DOWN} style={[styles.chevron, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />
                        </TouchableOpacity>

                        {/* Price summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <CustomText style={styles.summaryLabel}>
                                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                                </CustomText>
                                <CustomText style={styles.summaryValue}>
                                    ₹{total.toLocaleString('en-IN')}
                                </CustomText>
                            </View>
                            <View style={styles.summaryRow}>
                                <CustomText style={styles.summaryLabel}>Delivery</CustomText>
                                <CustomText style={[styles.summaryValue, { color: Colors.GREEN }]}>FREE</CustomText>
                            </View>
                            <View style={styles.summaryRow}>
                                <CustomText style={styles.summaryLabel}>Payment</CustomText>
                                <CustomText style={[styles.summaryValue, { color: Colors.GOLD }]}>
                                    Cash on Delivery
                                </CustomText>
                            </View>

                            <LinearGradient
                                colors={['transparent', 'rgba(255,215,0,0.3)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.summaryDivider}
                            />

                            <View style={styles.totalRow}>
                                <CustomText style={styles.totalLabel}>Total</CustomText>
                                <CustomText style={styles.totalValue}>
                                    ₹{total.toLocaleString('en-IN')}
                                </CustomText>
                            </View>
                        </View>

                        {/* Place order button */}
                        <TouchableOpacity onPress={handlePlaceOrder} activeOpacity={0.85}>
                            <LinearGradient
                                colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.placeOrderBtn}
                            >
                                <CustomText style={styles.placeOrderText}>
                                    Place Order · ₹{total.toLocaleString('en-IN')}
                                </CustomText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
    backBtn: { marginRight: rw(3) },
    backIcon: {
        width: rw(5.5),
        height: rw(5.5),
        tintColor: Colors.WHITE,
    },
    headerTitle: {
        flex: 1,
        color: Colors.WHITE,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
    },
    headerCount: {
        color: Colors.WHITE_55,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[400],
    },

    divider: {
        height: 1,
        marginHorizontal: rw(4),
        marginBottom: rh(1),
    },

    list: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(2),
        gap: rh(1.2),
    },

    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        padding: rw(3),
        gap: rw(3),
    },
    suitCircle: {
        width: rw(9),
        height: rw(9),
        borderRadius: rw(4.5),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    suitText: { fontSize: rf(4.5) },

    itemInfo: { flex: 1 },
    itemName: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[600],
        marginBottom: rh(0.3),
    },
    itemPrice: {
        color: Colors.WHITE_55,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
    },

    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.08)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        paddingHorizontal: rw(1),
        gap: rw(1.5),
    },
    qtyBtn: {
        width: rw(6),
        height: rw(6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        color: Colors.GOLD,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rf(6),
    },
    qtyValue: {
        color: Colors.WHITE,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[700],
        minWidth: rw(5),
        textAlign: 'center',
    },

    itemTotal: { alignItems: 'flex-end', gap: rh(0.6) },
    itemTotalText: {
        color: Colors.GOLD,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[700],
    },
    trashBtn: {},
    trashIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: 'rgba(255,77,77,0.75)',
    },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(10),
        gap: rh(2),
    },
    emptySuit: {
        fontSize: rf(20),
        color: 'rgba(255,255,255,0.08)',
        fontFamily: FontFamilyWithWeight[900],
    },
    emptyTitle: {
        color: Colors.WHITE,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[600],
        textAlign: 'center',
    },
    emptySubtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        lineHeight: rf(5),
    },
    browseBtn: {
        borderRadius: 12,
        paddingHorizontal: rw(8),
        paddingVertical: rh(1.5),
    },
    browseBtnText: {
        color: Colors.WHITE,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
    },

    // Bottom section
    bottomSection: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(3),
        gap: rh(1.5),
    },

    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: rw(3.5),
    },
    addressLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(3),
    },
    addressIcon: {
        width: rw(5.5),
        height: rw(5.5),
        tintColor: Colors.GOLD,
    },
    addressTextWrap: { flex: 1 },
    addressLabel: {
        color: Colors.WHITE_55,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
    },
    addressValue: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[500],
    },
    noAddressLabel: {
        color: '#FF4D4D',
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[500],
    },
    noAddressHint: {
        color: Colors.WHITE_55,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
    },
    chevron: {
        width: rw(4),
        height: rw(4),
        tintColor: Colors.WHITE_55,
    },

    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        padding: rw(4),
        gap: rh(0.8),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: Colors.WHITE_55,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[400],
    },
    summaryValue: {
        color: Colors.WHITE,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[500],
    },
    summaryDivider: {
        height: 1,
        marginVertical: rh(0.5),
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: Colors.WHITE,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[700],
    },
    totalValue: {
        color: Colors.GOLD,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
    },

    placeOrderBtn: {
        borderRadius: 14,
        paddingVertical: rh(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeOrderText: {
        color: Colors.WHITE,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.3,
    },
});
