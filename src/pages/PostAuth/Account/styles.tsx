import { StyleSheet } from 'react-native';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';

export const styles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  bg: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: rw(4),
    paddingTop: rh(2),
    paddingBottom: rh(4),
  },

  // ─── Section Card ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_08,
    paddingHorizontal: rw(4),
    paddingTop: rh(1.5),
    paddingBottom: rh(2),
    marginBottom: rh(2),
  },

  // ─── Section Header ───────────────────────────────────────────────────────
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rh(1.5),
    gap: rw(2),
  },
  sectionAccent: {
    width: rw(1),
    height: rh(2.5),
    borderRadius: 4,
    backgroundColor: Colors.GOLD,
  },
  sectionTitle: {
    fontSize: rf(4.2),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.WHITE,
    flex: 1,
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
    gap: rw(1),
  },
  lockedBadgeText: {
    fontSize: rf(2.8),
    fontFamily: FontFamilyWithWeight[600],
    color: Colors.GOLD,
  },

  // ─── Field Label ──────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.WHITE_75,
    marginBottom: rh(0.6),
    marginTop: rh(1.2),
  },

  // ─── Input Row ────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    gap: rw(3),
  },
  halfInput: {
    flex: 1,
    height: rh(6),
    color:Colors.WHITE
  },
  fullInput: {
    height: rh(6),
  },

  // ─── Error ────────────────────────────────────────────────────────────────
  errorText: {
    color: Colors.ERROR_RED,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[400],
    marginTop: rh(0.4),
  },

  // ─── Divider ──────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER_WHITE_08,
    marginVertical: rh(1.5),
  },

  // ─── Button ───────────────────────────────────────────────────────────────
  buttonContainer: {
    height: rh(7),
    marginTop: rh(1),
    borderRadius: rh(1),
    overflow: 'hidden',
  },
  buttonText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.4,
  },
});
