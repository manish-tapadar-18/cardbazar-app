import { StyleSheet } from "react-native";
import { Colors } from "../../../utils/Colors";
import { FontFamilyWithWeight } from "../../../utils/FontFamilyWithWeight";
import { rf, rh, rw } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  flex1: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: rw(4),
    paddingTop: rh(2),
    paddingBottom: rh(12),
  },
  separator: {
    height: rh(1.5),
  },

  // ── Result card ────────────────────────────────────────────────────────────
  card: {
    borderRadius: rw(3.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    overflow: 'hidden',
  },

  // Date header
  cardHeader: {
    paddingHorizontal: rw(4),
    paddingTop: rh(1.5),
    paddingBottom: rh(1.2),
  },
  dateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: rw(3.5),
    paddingVertical: rh(0.5),
    borderRadius: rw(5),
  },
  dateText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[800],
    letterSpacing: 0.4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: rw(4),
  },

  // Card body
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.8),
    gap: rw(4),
  },
  imageWrapper: {
    width: rw(18),
    height: rw(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: rw(16),
    height: rw(16),
    transform: [{ rotate: '-10deg' }],
  },
  cardInfo: {
    flex: 1,
    gap: rh(0.5),
  },
  scheduleName: {
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  cardName: {
    color: Colors.WHITE,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
    textTransform: 'capitalize',
  },
  gameName: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[400],
  },

  // ── Footer loader ──────────────────────────────────────────────────────────
  footerLoader: {
    paddingVertical: rh(2),
    alignItems: 'center',
  },
  footerText: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
  },
});
