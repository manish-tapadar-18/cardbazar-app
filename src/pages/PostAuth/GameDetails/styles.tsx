import { StyleSheet } from "react-native";
import { rh, rw, rf } from "../../../utils/responsive";
import { FontFamilyWithWeight } from "../../../utils/FontFamilyWithWeight";
import { Colors } from "../../../utils/Colors";

export const styles = StyleSheet.create({
  // ─── Screen ────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
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
  tabPillSkeleton: {
    height: rh(4),
    width: rw(22),
    borderRadius: rh(2),
    backgroundColor: 'rgba(140,80,220,0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: rh(1),
    paddingBottom: rh(4),
  },

  // ─── Section Header ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: rw(4),
    marginTop: rh(1.8),
    marginBottom: rh(1.2),
  },
  sectionLine: {
    flex: 1,
    height: 1.5,
  },
  sectionTitle: {
    color: Colors.WHITE,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[700],
    marginHorizontal: rw(3),
    letterSpacing: 2,
  },

  // ─── Game Card ──────────────────────────────────────────────────────────────
  cardWrapper: {
    marginHorizontal: rw(4),
    marginVertical: rh(0.55),
    borderRadius: rh(1.2),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rw(3.5),
    paddingVertical: rh(1.3),
    minHeight: rh(8.5),
  },
  cardIcon: {
    width: rw(13),
    height: rw(13),
    marginRight: rw(3),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: Colors.BROWN,
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[700],
    marginBottom: rh(0.4),
  },

  // ─── Time Texts ─────────────────────────────────────────────────────────────
  runningTime: {
    color: Colors.BLOOD_RED,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[500],
    opacity: 0.92,
  },
  upcomingTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  upcomingTime: {
    color: Colors.BLOOD_RED,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
    opacity: 0.92,
  },
  upcomingTimeSpacer: {
    color: Colors.TRANSPARENT,
  },
  expiredTime: {
    color: Colors.BLOOD_RED,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
    opacity: 0.92,
  },

  // ─── Skeleton Card ───────────────────────────────────────────────────────────
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rw(3.5),
    paddingVertical: rh(1.3),
    minHeight: rh(8.5),
    backgroundColor: 'rgba(60,24,102,0.85)',
  },
  skeletonIcon: {
    width: rw(13),
    height: rw(13),
    borderRadius: rw(2),
    backgroundColor: 'rgba(140,80,220,0.5)',
    marginRight: rw(3),
  },
  skeletonCardTitle: {
    width: '70%',
    height: rh(2.6),
    borderRadius: 4,
    backgroundColor: 'rgba(140,80,220,0.5)',
    marginBottom: rh(0.8),
  },
  skeletonCardSubtitle: {
    width: '50%',
    height: rh(2),
    borderRadius: 4,
    backgroundColor: 'rgba(140,80,220,0.4)',
  },

  // ─── Empty State ─────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: rh(8),
    paddingHorizontal: rw(8),
  },
  emptyGlowRing: {
    width: rw(42),
    height: rw(42),
    borderRadius: rw(21),
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rh(3.5),
  },
  emptyIconCircle: {
    width: rw(28),
    height: rw(28),
    borderRadius: rw(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: rw(14),
    height: rw(14),
    tintColor: Colors.BLACK,
  },
  emptyTitle: {
    color: Colors.GOLD,
    fontSize: rf(4.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: rh(2),
  },
  emptyDivider: {
    height: 1.5,
    width: rw(50),
    borderRadius: 1,
    marginBottom: rh(2),
  },
  emptySubtitle: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
    lineHeight: rf(5.2),
    letterSpacing: 0.3,
  },
  emptyText: {
    color: Colors.WHITE_75,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
