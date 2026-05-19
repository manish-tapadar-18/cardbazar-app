import { StyleSheet } from 'react-native';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

export const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(5),
        paddingTop: rh(3),
        paddingBottom: rh(4),
    },

    // ─── Page Header ──────────────────────────────────────────────────────────
    pageHeaderContainer: {
        alignItems: 'center',
        marginBottom: rh(3),
    },
    pageHeaderIcon: {
        width: rw(16),
        height: rw(16),
        borderRadius: rw(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: rh(1.5),
    },
    pageHeaderIconText: {
        fontSize: rf(9),
    },
    pageTitle: {
        fontSize: rf(6.5),
        fontFamily: FontFamilyWithWeight[700],
        color: Colors.WHITE,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    pageSubtitle: {
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[400],
        color: Colors.WHITE_55,
        textAlign: 'center',
        marginTop: rh(0.5),
        lineHeight: rf(5.5),
    },

    // ─── Card Container ───────────────────────────────────────────────────────
    cardBorder: {
        borderRadius: rh(2.5),
        padding: 1.5,
        marginBottom: rh(2.5),
    },
    cardInner: {
        borderRadius: rh(2.5) - 1.5,
        paddingHorizontal: rw(5),
        paddingTop: rh(2.5),
        paddingBottom: rh(3),
    },

    // ─── Section Header ───────────────────────────────────────────────────────
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
        marginBottom: rh(1.5),
    },
    sectionAccent: {
        width: rw(1),
        height: rh(3.5),
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: rf(4.5),
        fontFamily: FontFamilyWithWeight[700],
        color: Colors.WHITE,
        flex: 1,
    },

    // ─── Gradient Rule ────────────────────────────────────────────────────────
    gradientRule: {
        height: 1,
        borderRadius: 1,
        marginBottom: rh(2.5),
    },

    // ─── Star Rating ──────────────────────────────────────────────────────────
    ratingContainer: {
        alignItems: 'center',
        paddingVertical: rh(1),
    },
    ratingLabel: {
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[500],
        color: Colors.WHITE_75,
        marginBottom: rh(1.5),
        textAlign: 'center',
    },
    ratingValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: rh(1.5),
        gap: rw(2),
    },
    ratingValueBadge: {
        paddingHorizontal: rw(3.5),
        paddingVertical: rh(0.5),
        borderRadius: rh(1.2),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.4)',
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    ratingValueText: {
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[600],
        color: Colors.GOLD,
        textAlign: 'center',
    },
    ratingHintText: {
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
        color: Colors.WHITE_55,
        textAlign: 'center',
    },
    errorText: {
        color: Colors.ERROR_RED,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
        marginTop: rh(0.8),
        textAlign: 'center',
    },

    // ─── Feedback Textarea ────────────────────────────────────────────────────
    fieldLabel: {
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[500],
        color: Colors.WHITE_75,
        marginBottom: rh(0.8),
    },
    textAreaWrapper: {
        borderRadius: rh(1.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: rw(3.5),
        minHeight: rh(18),
    },
    textAreaWrapperFocused: {
        borderColor: Colors.GOLD,
        backgroundColor: 'rgba(255,215,0,0.06)',
    },
    textAreaInput: {
        flex: 1,
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[400],
        textAlignVertical: 'top',
        minHeight: rh(14),
        padding: 0,
        lineHeight: rf(6),
    },
    wordCountRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: rh(0.8),
        gap: rw(1),
    },
    wordCountText: {
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
        color: Colors.WHITE_55,
    },
    wordCountWarning: {
        color: Colors.ORANGE,
    },
    wordCountError: {
        color: Colors.ERROR_RED,
    },
    textAreaErrorText: {
        color: Colors.ERROR_RED,
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
        marginTop: rh(0.4),
    },

    // ─── Submit Button ────────────────────────────────────────────────────────
    buttonContainer: {
        height: rh(7.5),
        borderRadius: rh(1.5),
        overflow: 'hidden',
        marginTop: rh(1),
    },
    buttonText: {
        color: Colors.DARK_BROWN,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.6,
    },
});
