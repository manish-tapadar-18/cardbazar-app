import { StyleSheet } from "react-native";
import { rf, rh, rw } from "../../../utils/responsive";
import { Fonts } from "../../../utils/Fontsizes";
import { FontFamilyWithWeight } from "../../../utils/FontFamilyWithWeight";
import { Colors } from "../../../utils/Colors";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: rh(2),
    paddingBottom: rh(4),
  },
  tabBarRow: {
    flexDirection: 'row',
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.2),
    gap: rw(3),
  },
  tabPill: {
    height: rh(4),
    width: rw(22),
    borderRadius: rh(2),
    backgroundColor: Colors.DARK_VIOLET,
  },
  // ─── Timing Card ─────────────────────────────────────────────────────────────
  wrapper: {
    marginHorizontal: rw(4),
    marginBottom: rh(2.5),
  },
  badgeRow: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: -rh(2),
  },
  badge: {
    paddingHorizontal: rw(6),
    paddingVertical: rh(0.9),
    borderRadius: rh(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSkeleton: {
    height: rh(4),
    width: rw(40),
    borderRadius: rh(1.5),
    backgroundColor: Colors.DARK_VIOLET,
  },
  badgeText: {
    fontSize: rf(4),
    fontWeight:"bold",
    color: Colors.BADGE_TEXT,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: rh(1.5),
    paddingTop: rh(3.8),
    paddingBottom: rh(2.5),
    paddingHorizontal: rw(4),
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_08,
  },
  cardSkeleton: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: rh(1.5),
    paddingTop: rh(3.8),
    paddingBottom: rh(2.5),
    paddingHorizontal: rw(4),
    alignItems: 'center',
    gap: rh(0.8),
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_08,
  },
  skeletonLine: {
    height: rh(1.6),
    width: '85%',
    borderRadius: rh(0.8),
    backgroundColor: Colors.DARK_VIOLET,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: rh(5),
    backgroundColor: Colors.BORDER_WHITE_12,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    gap: rh(0.4),
  },
  timeValue: {
    fontSize: rf(3.5),
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  startLabel: {
    fontSize: rf(3.5),
    fontWeight: "bold",
    color: Colors.GREEN,
    letterSpacing: 0.4,
  },
  endLabel: {
    fontSize: rf(3.5),
    fontWeight: "bold",
    color: '#FF6B9D',
    letterSpacing: 0.4,
  },
  resultLabel: {
    fontSize: rf(3.5),
    fontWeight: "bold",
    color: Colors.GOLD,
    letterSpacing: 0.4,
  },
  // ─── Empty State ─────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(6),
    gap: rh(1.5),
  },
  emptyIconCircle: {
    width: rw(22),
    height: rw(22),
    borderRadius: rw(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rh(1),
  },
  emptyIcon: {
    fontSize: rw(9),
  },
  emptyTitle: {
    fontSize: Fonts.medium,
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.GOLD,
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontSize: Fonts.smaller,
    fontFamily: FontFamilyWithWeight[400],
    color: Colors.WHITE_55,
    textAlign: 'center',
    lineHeight: rh(2.8),
  },
});
