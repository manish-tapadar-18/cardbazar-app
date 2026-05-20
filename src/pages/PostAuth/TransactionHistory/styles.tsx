import { StyleSheet } from 'react-native';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    flex1: {
        flex: 1,
    },

    // ─── Filter Bar ──────────────────────────────────────────────────────────────
    filterBar: {
        paddingTop: rh(1),
        paddingBottom: rh(0.8),
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(3),
    },
    filterScroll: {
        flex: 1,
    },
    filterScrollContent: {
        alignItems: 'center',
        gap: rw(2),
        paddingRight: rw(2),
    },

    // ─── Type Chips ──────────────────────────────────────────────────────────────
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(3.5),
        paddingVertical: rh(0.65),
        borderRadius: rw(8),
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        gap: rw(1.2),
    },
    chipDot: {
        width: rw(2),
        height: rw(2),
        borderRadius: rw(1),
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    chipText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(3),
        color: Colors.WHITE_55,
        letterSpacing: 0.4,
    },

    // ─── Right Controls: Date + Clear ────────────────────────────────────────────
    rightControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
        paddingLeft: rw(2),
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.12)',
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.5),
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.65),
        borderRadius: rw(8),
        borderWidth: 1.5,
        borderColor: Colors.GOLD,
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    datePillIcon: {
        width: rw(3.2),
        height: rw(3.2),
        tintColor: Colors.GOLD,
    },
    datePillText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(3),
        color: Colors.GOLD,
        letterSpacing: 0.3,
    },
    clearBtn: {
        width: rw(7),
        height: rw(7),
        borderRadius: rw(3.5),
        backgroundColor: 'rgba(252,3,3,0.15)',
        borderWidth: 1.5,
        borderColor: Colors.ERROR_RED,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearIcon: {
        width: rw(3.5),
        height: rw(3.5),
        tintColor: Colors.ERROR_RED,
    },
    clearText: {
        fontFamily: FontFamilyWithWeight[900],
        fontSize: rf(3),
        color: Colors.ERROR_RED,
    },

    // ─── Active Date Indicator Strip ─────────────────────────────────────────────
    activeDateStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rw(2),
        paddingVertical: rh(0.5),
        paddingHorizontal: rw(4),
    },
    activeDateStripText: {
        fontFamily: FontFamilyWithWeight[500],
        fontSize: rf(3),
        color: Colors.WHITE_55,
        letterSpacing: 0.3,
    },
    activeDateStripValue: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(3),
        color: Colors.GOLD,
    },

    // ─── Table Header ────────────────────────────────────────────────────────────
    tableHeaderGradient: {
        flexDirection: 'row',
        paddingVertical: rh(1.2),
    },
    tableHeaderCell: {
        flex: 1,
        alignItems: 'center',
    },
    tableHeaderText: {
        fontFamily: FontFamilyWithWeight[900],
        fontSize: rf(4),
        color: Colors.BROWN,
        letterSpacing: 0.5,
    },

    // ─── FlatList ────────────────────────────────────────────────────────────────
    listContent: {
        flexGrow: 1,
        paddingTop: rh(1),
        paddingBottom: rh(10),
    },

    // ─── Transaction Card — layout handled inline in TransactionHistory.tsx ─────
    // (card gradient, LV rows, ShineStatus are co-located with renderItem)

    // ─── Empty State ──────────────────────────────────────────────────────────────
    emptyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: rh(8),
    },
    emptyText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },

    // ─── Footer Loader ────────────────────────────────────────────────────────────
    footerLoader: {
        paddingVertical: rh(2),
        alignItems: 'center',
    },
    footerText: {
        fontFamily: FontFamilyWithWeight[400],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },
});
