import { StyleSheet } from "react-native";
import { rh, rw } from "../../../utils/responsive";
import { Fonts } from "../../../utils/Fontsizes";
import { FontFamilyWithWeight } from "../../../utils/FontFamilyWithWeight";
import { Colors } from "../../../utils/Colors";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  withdrawalContainer: {
    paddingHorizontal: rw(5),
    paddingVertical: rh(1.8),
    gap: rh(0.6),
    backgroundColor: Colors.OVERLAY_PURPLE,
  },
  withdrawalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  withdrawalLabel: {
    fontSize: Fonts.smaller,
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
  },
  withdrawalValue: {
    fontSize: Fonts.smaller,
    fontFamily: FontFamilyWithWeight[700],
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
  wrapper: {
    marginHorizontal: rw(4),
    marginBottom: rh(2.5),
  },
  badgeRow: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: -rh(1.8),
  },
  badge: {
    height: rh(4),
    width: rw(40),
    borderRadius: rh(1.5),
    backgroundColor: Colors.DARK_VIOLET,
  },
  card: {
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
  line: {
    height: rh(1.6),
    width: '85%',
    borderRadius: rh(0.8),
    backgroundColor: Colors.DARK_VIOLET,
  },
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