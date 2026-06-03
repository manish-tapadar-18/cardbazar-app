import { StyleSheet } from 'react-native';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

export const styles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: rw(5),
    paddingVertical: rh(2),
  },

  // ─── Card (gradient border + dark inner) ─────────────────────────────────
  cardBorder: {
    borderRadius: rh(2),
    padding: 1.5,
    marginBottom: rh(2),
  },
  cardInner: {
    // backgroundColor: 'rgba(18, 4, 45, 0.96)',
    borderRadius: rh(2) - 1.5,
    paddingHorizontal: rw(4.5),
    paddingTop: rh(2.5),
    paddingBottom: rh(2.5),
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
    height: rh(4),
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: rf(4.8),
    fontFamily: FontFamilyWithWeight["inter_700"],
    color: Colors.WHITE,
    flex: 1,
    lineHeight: rf(6),
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.OVERLAY_DARK,
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: Colors.GOLD,
    paddingHorizontal: rw(2.5),
    paddingVertical: rh(0.4),
  },
  lockedBadgeText: {
    fontSize: rf(2.8),
    fontFamily: FontFamilyWithWeight[600],
    color: Colors.GOLD,
  },

  // ─── Gradient Rules ───────────────────────────────────────────────────────
  gradientRule: {
    height: 1,
    borderRadius: 1,
    marginBottom: rh(2),
  },
  footerRule: {
    height: 1,
    borderRadius: 1,
    marginBottom: rh(2.5),
  },

  // ─── Name Row (two-column) ────────────────────────────────────────────────
  nameRow: {
    flexDirection: 'row',
    gap: rw(3),
    marginBottom: rh(1.5),
  },
  halfFieldGroup: {
    flex: 1,
  },

  // ─── Field Group ──────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: rh(1.5),
  },
  fieldLabel: {
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.WHITE_75,
    marginBottom: rh(0.8),
  },

  // ─── Input Row ────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: Colors.WHITE,
    paddingHorizontal: rw(3),
    height: rh(6.5),
  },
  inputRowFocused: {
    borderColor: Colors.GOLD,
    backgroundColor: 'rgba(255,215,0,0.07)',
  },
  inputRowLocked: {
    borderColor: Colors.WHITE,
    backgroundColor: 'rgba(255,255,255,0.03)',
    opacity: 0.85,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: Colors.WHITE,
    paddingHorizontal: 0,
    flex: 1,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[400],
  },

  // ─── Error ────────────────────────────────────────────────────────────────
  errorText: {
    color: Colors.ERROR_RED,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[400],
    marginTop: rh(0.4),
  },

  // ─── Button ───────────────────────────────────────────────────────────────
  buttonContainer: {
    height: rh(7),
    borderRadius: rh(1),
    overflow: 'hidden',
    marginBottom:rh(3)
  },
  buttonText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.4,
  },
});
