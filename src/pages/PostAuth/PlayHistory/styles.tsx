import { StyleSheet } from 'react-native';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    flex1: { flex: 1 },

    // ─── Date filter bar ─────────────────────────────────────────────────────────
    dateBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: rw(4),
        paddingVertical: rh(0.8),
        gap: rw(2),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.5),
        paddingHorizontal: rw(3.5),
        paddingVertical: rh(0.65),
        borderRadius: rw(8),
        borderWidth: 1.5,
        borderColor: Colors.GOLD,
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    datePillIcon: {
        width: rw(3.5),
        height: rw(3.5),
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
        // backgroundColor: 'rgba(252, 3, 3, 0.84)',
        borderWidth: 1.5,
        borderColor: Colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: {
        fontFamily: FontFamilyWithWeight[900],
        fontSize: rf(4),
        color: Colors.WHITE,
    },

    // ─── FlatList ────────────────────────────────────────────────────────────────
    listContent: {
        flexGrow: 1,
        paddingHorizontal: rw(3),
        paddingTop: rh(4),
        paddingBottom: rh(10),
        gap: rh(1.2),
    },

    // ─── History Card ─────────────────────────────────────────────────────────────
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: rw(3),
        paddingHorizontal: rw(3),
        paddingVertical: rh(1.4),
        gap: rw(3),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardImage: {
        width: rw(13),
        height: rw(13),
        resizeMode: 'contain',
    },
    cardMiddle: {
        flex: 1,
        gap: rh(0.4),
    },
    scheduleName: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.GOLD,
        letterSpacing: 0.3,
    },
    categoryName: {
        fontFamily: FontFamilyWithWeight[500],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
        marginTop: rh(0.3),
    },
    timeText: {
        fontFamily: FontFamilyWithWeight[400],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: rh(0.6),
    },
    amountText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.WHITE,
    },
    statusBadge: {
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.4),
        borderRadius: rw(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontFamily: FontFamilyWithWeight[800],
        fontSize: rf(2.5),
        color: Colors.WHITE,
        letterSpacing: 0.5,
    },

    // ─── Footer loader ────────────────────────────────────────────────────────────
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
