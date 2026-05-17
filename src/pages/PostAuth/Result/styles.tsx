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
    paddingTop: rh(4),
    paddingBottom: rh(12),
  },

  // ── Date-grouped card wrapper ──────────────────────────────────────────────
  groupWrapper: {
    marginBottom: rh(3),
  },

  // Date badge — absolute, floats above the card
  groupDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: rw(2),
    paddingVertical: rh(0.7),
    borderRadius: rw(2),
    position: 'absolute',
    zIndex: 9999,
    top: -rh(2),
  },
  groupDateText: {
    fontFamily: FontFamilyWithWeight[700],
    fontSize: rf(5),
    color: '#330000',
  },

  // Card body
  groupCard: {
    borderRadius: rw(2.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    overflow: 'hidden',
    paddingTop: rh(2),
  },

  // Row — schedule name on left, image+card name on right
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.4),
    gap: rw(7),
  },
  groupScheduleName: {
    flex: 1,
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  groupRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(2),
    flexShrink: 0,
  },
  groupCardImage: {
    width: rw(6),
    height: rw(6),
  },
  groupCardName: {
    fontSize: rf(5),
    color: Colors.WHITE,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Divider between rows inside a card
  groupDivider: {
    height: 1,
    marginHorizontal: rw(4),
    backgroundColor: '#FFFFFF',
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
