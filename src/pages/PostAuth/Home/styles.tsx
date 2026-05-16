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
    color: Colors.WHITE,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
    marginBottom: rh(0.4),
  },

  // ─── Time Texts ─────────────────────────────────────────────────────────────
  runningTime: {
    color: Colors.WHITE,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[500],
    opacity: 0.92,
  },
  upcomingTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  upcomingTime: {
    color: Colors.WHITE,
    fontSize: rf(3.0),
    fontFamily: FontFamilyWithWeight[400],
    opacity: 0.92,
  },
  upcomingTimeSpacer: {
    color: Colors.TRANSPARENT,
  },
  expiredTime: {
    color: Colors.WHITE,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    opacity: 0.92,
  },

  // ─── List Header ─────────────────────────────────────────────────────────────
  listHeader: {
    paddingHorizontal: rw(4),
    paddingTop: rh(1.8),
    paddingBottom: rh(0.8),
  },
  listHeaderText: {
    color: Colors.WHITE,
    fontSize: rf(5.4),
    fontWeight:"bold",
    letterSpacing: 1.2,
  },

  // ─── Skeleton ────────────────────────────────────────────────────────────────
  skeletonContainer: {
    flex: 1,
  },

  // ─── Category Card ───────────────────────────────────────────────────────────
  categoryCardWrapper: {
    marginHorizontal: rw(4),
    marginVertical: rh(0.8),
    borderRadius: rh(1.5),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  categoryCard: {
    paddingHorizontal: rw(4),
    paddingVertical: rh(2),
    minHeight: rh(17),
    justifyContent: 'space-between',
  },
  categoryName: {
    color: Colors.WHITE,
    fontSize: rf(6.5),
    fontWeight:"bold",
    marginBottom: rh(0.8),
    letterSpacing: 0.5,
  },
  categoryDesc: {
    color: Colors.WHITE_75,
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[400],
    lineHeight: rf(4.8),
    flex: 1,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: rh(1.8),
  },
  contestsBadgeWrapper: {
    borderRadius: rh(3),
    overflow: 'hidden',
  },
  contestsBadge: {
    paddingHorizontal: rw(3),
    paddingVertical: rh(0.8),
  },
  contestsText: {
    color: Colors.BADGE_TEXT,
    fontSize: rf(4),
    fontWeight:"bold",
    letterSpacing: 0.8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(2),
  },
  playIcon: {
    width: rw(8),
    height: rw(8),
  },
  playText: {
    color: Colors.WHITE,
    fontSize: rf(4),
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // ─── Skeleton ────────────────────────────────────────────────────────────────
  skeletonCardInner: {
    backgroundColor: 'rgba(60,24,102,0.85)',
    paddingHorizontal: rw(4),
    paddingVertical: rh(2),
    minHeight: rh(17),
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    width: '55%',
    height: rh(3),
    borderRadius: 4,
    backgroundColor: 'rgba(140,80,220,0.5)',
    marginBottom: rh(1.2),
  },
  skeletonDescLine: {
    width: '80%',
    height: rh(2),
    borderRadius: 4,
    backgroundColor: 'rgba(140,80,220,0.4)',
    marginBottom: rh(0.8),
  },
  skeletonBadge: {
    width: rw(28),
    height: rh(3.5),
    borderRadius: rh(0.8),
    backgroundColor: 'rgba(140,80,220,0.5)',
  },
  skeletonPlayBtn: {
    width: rw(32),
    height: rh(3.5),
    borderRadius: rh(0.8),
    backgroundColor: 'rgba(140,80,220,0.5)',
  },
});
