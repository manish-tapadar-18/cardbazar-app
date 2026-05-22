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
    paddingHorizontal: rw(2.5),
    paddingVertical: rh(0.65),
    borderRadius: rw(2),
    position: 'absolute',
    zIndex: 99999,
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
    borderColor: 'rgba(255,215,0,0.20)',
    overflow: 'hidden',
    paddingTop: rh(2.5),
  },

  // ── Per-item container ─────────────────────────────────────────────────────
  item: {
    paddingHorizontal: rw(4),
    paddingTop: rh(1),
    paddingBottom: rh(1.5),
  },

  // ── Top row: card image + formatted card name ──────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
    marginBottom: rh(1),
  },
  cardImage: {
    width: rw(14),
    height: rw(14),
  },
  // Gives MaskedView (inside GradientText) a real flex width to render into
  cardNameWrapper: {
    flex: 1,
  },
  cardName: {
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight.inter_700,
    letterSpacing: 0.5,
    flexShrink: 1,
  },

  // ── Gold separator (below top row) ────────────────────────────────────────
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,215,0,0.35)',
    marginBottom: rh(0.8),
  },

  // ── Paired cells row (START TIME | END TIME) ───────────────────────────────
  pairRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: rh(0.6),
  },
  pairSep: {
    width: 1,
    backgroundColor: 'rgba(255,215,0,0.25)',
    alignSelf: 'stretch',
    marginHorizontal: rw(3),
  },

  // ── Inline icon + text ─────────────────────────────────────────────────────
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(1.2),
  },
  emojiIcon: {
    fontSize: rf(3.6),
    lineHeight: rf(4.4),
  },

  // Divider between items inside a card
  groupDivider: {
    height: 1,
    marginHorizontal: rw(4),
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: rh(0.5),
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

// ── LV — full-width label → value row ─────────────────────────────────────────
export const lv = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rh(0.6),
  },
  label: {
    width: rw(32),
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight.inter_400,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.3,
  },
  valueSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  valueText: {
    fontSize: rf(4.2),
    fontFamily: FontFamilyWithWeight.inter_700,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

// ── PC — paired cell (label stacked above value, flex:1 in a pair row) ────────
export const pc = StyleSheet.create({
  cell: { flex: 1 },
  label: {
    fontSize: rf(3.3),
    fontFamily: FontFamilyWithWeight.inter_400,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.3,
    marginBottom: rh(0.25),
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(1.2),
  },
  value: {
    fontSize: rf(3.9),
    fontFamily: FontFamilyWithWeight.inter_700,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
