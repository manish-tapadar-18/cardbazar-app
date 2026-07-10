import { Dimensions, StyleSheet } from 'react-native';
import { rh, rw, rf } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import { Colors } from '../../../utils/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// scrollContent has paddingHorizontal: rw(4) on each side; chips have marginHorizontal: rw(1) each
const CHIP_H_MARGIN = rw(1);
const CHIP_WIDTH = (SCREEN_WIDTH - rw(4) * 2 - CHIP_H_MARGIN * 2 * 4) / 4;

export const styles = StyleSheet.create({

  // ─── Screen ────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rw(4),
    paddingTop: rh(2.5),
    paddingBottom: rh(8),
  },

  // ─── Page Header ──────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rh(3),
    paddingBottom: rh(2.5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,215,0,0.15)',
  },
  pageIconCircle: {
    width: rw(13),
    height: rw(13),
    borderRadius: rw(6.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rw(3.5),
  },
  pageIcon: {
    width: rw(6.5),
    height: rw(6.5),
    tintColor: Colors.BLACK,
  },
  pageTitleGroup: {
    flex: 1,
  },
  pageTitle: {
    color: Colors.WHITE,
    fontSize: rf(5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.5,
  },
  pageSubtitle: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
    marginTop: rh(0.3),
    letterSpacing: 0.4,
  },

  // ─── Deposit Limits Bar ────────────────────────────────────────────────────
  limitsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY_BG,
    borderRadius: rh(1.2),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(5),
    marginBottom: rh(3),
  },
  limitItem: {
    flex: 1,
    alignItems: 'center',
  },
  limitLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.6,
    marginBottom: rh(0.4),
  },
  limitValue: {
    color: Colors.GOLD,
    fontSize: rf(4.2),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  limitDivider: {
    width: 1,
    height: rh(4),
    backgroundColor: 'rgba(255,215,0,0.2)',
    marginHorizontal: rw(2),
  },

  // ─── Section Label ─────────────────────────────────────────────────────────
  sectionLabel: {
    color: Colors.WHITE_75,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 1,
    marginBottom: rh(1.8),
  },

  // ─── Chips Grid ────────────────────────────────────────────────────────────
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: rh(1),
  },
  chip: {
    width: CHIP_WIDTH,
    marginHorizontal: CHIP_H_MARGIN,
    marginBottom: rh(1.8),
    paddingVertical: rh(1.6),
    borderRadius: rh(1),
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.22)',
    backgroundColor: Colors.PRIMARY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: Colors.GOLD,
    backgroundColor: 'rgba(255,215,0,0.13)',
  },
  chipText: {
    color:Colors.WHITE,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
  },
  chipTextSelected: {
    color: Colors.GOLD,
  },
  otherChip: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,215,0,0.35)',
  },
  otherChipSelected: {
    borderStyle: 'solid',
    borderColor: Colors.GOLD,
    backgroundColor: 'rgba(255,215,0,0.13)',
  },

  // ─── Other Amount Input ─────────────────────────────────────────────────────
  otherInputCard: {
    backgroundColor: 'rgba(59,212,20,0.12)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    padding: rw(4),
    marginBottom: rh(2.5),
  },
  otherInputHint: {
    color: Colors.WHITE_55,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
    marginBottom: rh(1.2),
    letterSpacing: 0.3,
  },
  otherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  otherInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: rh(1),
    backgroundColor: 'rgba(15,4,40,0.6)',
    paddingHorizontal: rw(3),
    height: rh(6.5),
  },
  currencySymbol: {
    color: Colors.GOLD,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    marginRight: rw(1.5),
  },
  otherInput: {
    flex: 1,
    color: Colors.WHITE,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[600],
    padding: 0,
  },
  setAmountBtn: {
    borderRadius: rh(1),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  setAmountBtnGradient: {
    height: rh(5),
    paddingHorizontal: rw(4.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  setAmountBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },

  // ─── Gateway Loading ────────────────────────────────────────────────────────
  gatewayLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,8,72,0.85)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    padding: rw(4),
    marginBottom: rh(2.5),
  },
  gatewayLoadingText: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    marginLeft: rw(3),
  },

  // ─── Gateway Card ───────────────────────────────────────────────────────────
  gatewaySectionLabel: {
    color: Colors.WHITE_75,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 1,
    marginBottom: rh(1.5),
  },
  gatewayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,212,20,0.12)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    padding: rw(4),
    marginBottom: rh(3),
    elevation: 3,
    // shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  gatewayIconCircle: {
    width: rw(13),
    height: rw(13),
    borderRadius: rw(6.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rw(3.5),
  },
  gatewayIcon: {
    width: rw(6.5),
    height: rw(6.5),
    tintColor: Colors.BLACK,
  },
  gatewayInfo: {
    flex: 1,
  },
  gatewayLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(2.8),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.5,
    marginBottom: rh(0.3),
  },
  gatewayName: {
    color: Colors.WHITE,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  gatewayActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(1.5),
    backgroundColor: 'rgba(59,212,20,0.12)',
    borderRadius: rh(0.8),
    paddingHorizontal: rw(2.5),
    paddingVertical: rh(0.5),
    borderWidth: 1,
    borderColor: 'rgba(59,212,20,0.3)',
  },
  gatewayActiveDot: {
    width: rw(2),
    height: rw(2),
    borderRadius: rw(1),
    backgroundColor: Colors.GREEN,
  },
  gatewayActiveText: {
    color: Colors.GREEN,
    fontSize: rf(2.6),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 0.5,
  },

  // ─── Add Money Button ───────────────────────────────────────────────────────
  addMoneyBtnWrapper: {
    borderRadius: rh(1.5),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  addMoneyBtnGradient: {
    paddingVertical: rh(2.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyBtnText: {
    color: Colors.BLACK,
    fontSize: rf(4.2),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 2,
  },

  // ─── UTR Link ───────────────────────────────────────────────────────────────
  utrLinkRow: {
    alignItems: 'center',
    marginTop: rh(2.5),
    paddingVertical: rh(1),
  },
  utrLinkText: {
    color: Colors.GOLD,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[500],
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },

  // ─── Blocked Overlay ────────────────────────────────────────────────────────
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,1,25,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(8),
  },
  overlayGlowRing: {
    width: rw(50),
    height: rw(50),
    borderRadius: rw(25),
    backgroundColor: 'rgba(255,215,0,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rh(3.5),
  },
  overlayIconCircle: {
    width: rw(30),
    height: rw(30),
    borderRadius: rw(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIcon: {
    width: rw(15),
    height: rw(15),
    tintColor: Colors.BLACK,
  },
  overlayTitle: {
    color: Colors.GOLD,
    fontSize: rf(4.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: rh(2),
  },
  overlayDivider: {
    height: 1.5,
    width: rw(58),
    borderRadius: 1,
    marginBottom: rh(2),
  },
  overlaySubtitle: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
    lineHeight: rf(5.4),
    letterSpacing: 0.3,
    marginBottom: rh(4.5),
  },
  refreshBtn: {
    borderRadius: rh(1.5),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  refreshBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(10),
    paddingVertical: rh(1.8),
    gap: rw(2),
  },
  refreshBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.2,
  },
});
