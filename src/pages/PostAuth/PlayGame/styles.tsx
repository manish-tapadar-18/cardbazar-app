import { Dimensions, StyleSheet } from 'react-native';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import { Colors } from '../../../utils/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Width of a single card: 4 cards per row with horizontal padding + gaps
const CARD_WIDTH = (SCREEN_WIDTH - rw(8) - rw(4.5)) / 4; // (screen - padding*2 - gap*3) / 4
const CARD_HEIGHT = CARD_WIDTH * 1.45;

export const styles = StyleSheet.create({
    // ─── Layout ───────────────────────────────────────────────────────────────
    bg: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: rh(2),
    },
    scrollContainer: {
        flexGrow: 1,
    },
    amountZone: {
        paddingHorizontal: rw(4),
        paddingVertical: rh(4),
        justifyContent: 'center' as const,
    },

    // ─── Header ───────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(3),
        paddingBottom: rh(1),
        gap: rw(3),
    },
    backBtn: {
        padding: rw(1.5),
    },
    backIcon: {
        width: rh(2.8),
        height: rh(2.8),
        resizeMode: 'contain',
    },
    walletPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.OVERLAY_DARK,
        borderRadius: rh(1.5),
        borderWidth: 1,
        borderColor: Colors.BORDER_WHITE_12,
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.8),
        gap: rw(2),
    },
    walletIcon: {
        width: rh(3.5),
        height: rh(3.5),
        resizeMode: 'contain',
    },
    balanceText: {
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rh(2.4),
    },
    walletLabel: {
        color: Colors.WHITE_75,
        fontSize: rf(2.8),
        fontFamily: FontFamilyWithWeight[400],
        lineHeight: rh(1.8),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
    },
    actionBtn: {
        width: rh(4.5),
        height: rh(4.5),
        borderRadius: rh(1),
        backgroundColor: Colors.OVERLAY_DARK,
        borderWidth: 1,
        borderColor: Colors.BORDER_WHITE_12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    whatsappBtn: {
        backgroundColor: Colors.WHITE,
        borderColor: Colors.TRANSPARENT,
    },
    actionIcon: {
        width: rh(2.8),
        height: rh(2.8),
        resizeMode: 'contain',
    },

    // ─── Dropdown ─────────────────────────────────────────────────────────────
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.PRIMARY_BG,
        borderRadius: rh(2),
        borderWidth: 1,
        borderColor: Colors.GOLD,
        paddingHorizontal: rw(6),
        paddingVertical: rh(1),
        marginTop: rh(1.5),
        marginBottom: rh(1),
        gap: rw(2),
    },
    dropdownText: {
        color: Colors.GOLD,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1,
    },
    angleDown: {
        width: rw(4),
        height: rw(4),
        resizeMode: 'contain',
    },

    // ─── Card FlatList ────────────────────────────────────────────────────────
    cardFlatList: {
        flexGrow: 0,
        height: CARD_HEIGHT + rh(5), // card height + label space
    },
    groupPage: {
        width: SCREEN_WIDTH,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: rw(4),
        gap: rw(1.5),
        paddingTop: rh(0.5),
        paddingBottom: rh(1),
    },

    // ─── Card ─────────────────────────────────────────────────────────────────
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.WHITE,
        borderRadius: rw(2.5),
        alignItems: 'center',
        paddingTop: rh(0.8),
        paddingBottom: rh(1),
        borderWidth: 2,
        borderColor: 'transparent',
        // subtle shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        position: 'relative',
    },
    cardSelected: {
        borderColor: '#22cc44',
        elevation: 6,
        shadowColor: '#22cc44',
        shadowOpacity: 0.4,
    },
    checkBadge: {
        position: 'absolute',
        top: rh(0.4),
        right: rw(1.5),
        width: rw(5),
        height: rw(5),
        borderRadius: rw(2.5),
        backgroundColor: '#22cc44',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    checkMark: {
        color: Colors.WHITE,
        fontSize: rf(2.8),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rw(5.2),
    },
    cardLabel: {
        color: Colors.DARK_GRAY,
        fontSize: rf(2.5),
        fontFamily: FontFamilyWithWeight[600],
        textAlign: 'center',
        marginBottom: rh(0.5),
        paddingHorizontal: rw(0.5),
    },
    cardImage: {
        width: '88%',
        height: CARD_HEIGHT - rh(4),
        borderRadius: rw(1.5),
    },

    // ─── Amount Row ───────────────────────────────────────────────────────────
    amountRow: {
        flexDirection: 'row',
        marginHorizontal: rw(4),
        marginTop: rh(2),
        marginBottom: rh(1),
        borderRadius: rw(3),
        overflow: 'hidden',
        backgroundColor: Colors.WHITE,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
    },
    amountInput: {
        flex: 1,
        paddingHorizontal: rw(4),
        paddingVertical: rh(1.8),
        color: Colors.BLACK,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[400],
    },
    addBtn: {
        width: rw(15),
        backgroundColor: Colors.DEEP_PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.5,
    },

    // ─── Line Items ───────────────────────────────────────────────────────────
    lineItemsSection: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
        paddingHorizontal: rw(3),
        paddingTop: rh(0.5),
        paddingBottom: rh(2),
    },
    lineItemsScroll: {
        flex: 1,
    },
    emptyLineItems: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(8),
        paddingVertical: rh(4),
    },
    emptyIconCircle: {
        width: rw(22),
        height: rw(22),
        borderRadius: rw(11),
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: rh(2.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.25)',
    },
    emptyIcon: {
        fontSize: rf(10),
    },
    emptyTitle: {
        color: Colors.WHITE,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1.2),
    },
    emptySubtitle: {
        color: Colors.WHITE_75,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        lineHeight: rh(2.8),
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rh(1.5),
        gap: rw(2),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,215,0,0.35)',
    },
    dividerLabel: {
        color: Colors.GOLD,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1,
    },
    lineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: rw(3),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        marginBottom: rh(1),
        overflow: 'hidden',
    },
    lineItemThumb: {
        width: rw(14),
        alignSelf: 'stretch',
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,215,0,0.15)',
        paddingVertical: rh(1),
    },
    lineItemThumbImg: {
        width: rw(10),
        height: rh(6),
    },
    lineItemContent: {
        flex: 1,
        paddingHorizontal: rw(3),
    },
    lineItemName: {
        color: Colors.WHITE,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
    },
    lineItemAmount: {
        color: Colors.GOLD,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[700],
        paddingHorizontal: rw(2),
    },
    trashBtn: {
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(3),
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,215,0,0.15)',
    },
    trashIcon: {
        width: rh(2.4),
        height: rh(2.4),
        resizeMode: 'contain',
    },
    deleteConfirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(2),
        gap: rw(2),
    },
    cancelDeleteBtn: {
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.7),
        borderRadius: rw(1.5),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    cancelDeleteText: {
        color: Colors.WHITE_75,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[500],
    },
    confirmDeleteBtn: {
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.7),
        borderRadius: rw(1.5),
        backgroundColor: '#cc2200',
    },
    confirmDeleteText: {
        color: Colors.WHITE,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[600],
    },

    // ─── Play Game Button ─────────────────────────────────────────────────────
    playBtnWrapper: {
        backgroundColor: Colors.TRANSPARENT,
    },
    playBtnGradient: {
        height: rh(7.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtnText: {
        color: Colors.BLACK,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1.5,
    },

    // ─── Dropdown Modal ───────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: rh(14),
    },
    dropdownModal: {
        width: rw(55),
        backgroundColor: Colors.PRIMARY_BG,
        borderRadius: rw(3),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.GOLD,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    dropdownModalHeader: {
        paddingVertical: rh(1.2),
        paddingHorizontal: rw(4),
        alignItems: 'center',
    },
    dropdownModalTitle: {
        color: Colors.WHITE,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[600],
        letterSpacing: 0.8,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(1.8),
        paddingHorizontal: rw(5),
    },
    dropdownItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,215,0,0.15)',
    },
    dropdownItemActive: {
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    dropdownItemText: {
        flex: 1,
        color: Colors.WHITE_75,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[500],
    },
    dropdownItemTextActive: {
        color: Colors.GOLD,
        fontFamily: FontFamilyWithWeight[700],
    },
    dropdownItemCheck: {
        color: Colors.GOLD,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[700],
    },
});
