import { StyleSheet } from 'react-native';
import { rh, rw, rf } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import { Colors } from '../../../utils/Colors';

export const styles = StyleSheet.create({

  // ─── Screen ────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  scrollContent: {
    paddingHorizontal: rw(4),
    paddingTop: rh(2),
    paddingBottom: rh(6),
  },

  // ─── Warning Banner ────────────────────────────────────────────────────────
  warningBanner: {
    borderRadius: rh(1.2),
    paddingVertical: rh(1.6),
    paddingHorizontal: rw(4),
    marginBottom: rh(2.5),
  },
  warningText: {
    color: Colors.WHITE,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[700],
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: rf(5),
  },

  // ─── Timer Row ─────────────────────────────────────────────────────────────
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rh(2.5),
    paddingHorizontal: rw(1),
  },
  timerLabel: {
    color: Colors.WHITE_75,
    fontSize: rf(3.4),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 0.8,
  },
  timerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(2),
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.22)',
    paddingHorizontal: rw(3),
    paddingVertical: rh(0.8),
  },
  timerIcon: {
    width: rw(4.5),
    height: rw(4.5),
    tintColor: Colors.GOLD,
  },
  timerText: {
    color: Colors.GOLD,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
    minWidth: rw(14),
    textAlign: 'center',
  },

  // ─── Section Label ─────────────────────────────────────────────────────────
  sectionLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(2.8),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.5,
    marginBottom: rh(1.5),
    paddingHorizontal: rw(1),
  },

  // ─── Payment Item Row ──────────────────────────────────────────────────────
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,8,72,0.85)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(4),
    marginBottom: rh(1.5),
    gap: rw(3.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  paymentLogo: {
    width: rw(13),
    height: rw(13),
    resizeMode: 'contain',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    color: Colors.WHITE,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
    marginBottom: rh(0.3),
  },
  paymentSubtitle: {
    color: Colors.WHITE_55,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[400],
  },
  paymentChevron: {
    width: rw(4),
    height: rw(4),
    tintColor: Colors.GOLD,
  },

  // ─── QR Block ──────────────────────────────────────────────────────────────
  qrBlock: {
    backgroundColor: 'rgba(30,8,72,0.85)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    padding: rw(5),
    marginBottom: rh(1.5),
    alignItems: 'center',
  },
  qrTitle: {
    color: Colors.GOLD,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: rh(2.5),
  },
  qrImage: {
    width: rw(55),
    height: rw(55),
    resizeMode: 'contain',
    borderRadius: rh(1),
  },

  // ─── Loading ───────────────────────────────────────────────────────────────
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,8,72,0.85)',
    borderRadius: rh(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    padding: rw(4),
    marginBottom: rh(1.5),
  },
  loadingText: {
    color: Colors.WHITE_55,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    marginLeft: rw(3),
  },

  // ─── Payment Status Modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5,1,18,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(8),
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1A0545',
    borderRadius: rh(2),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    alignItems: 'center',
    paddingHorizontal: rw(6),
    paddingTop: rh(1),
    paddingBottom: rh(3.5),
    elevation: 10,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalIconWrap: {
    marginTop: -rw(8),
    marginBottom: rh(2.5),
  },
  modalGlowRing: {
    width: rw(20),
    height: rw(20),
    borderRadius: rw(10),
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconCircle: {
    width: rw(14),
    height: rw(14),
    borderRadius: rw(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: {
    width: rw(7),
    height: rw(7),
    tintColor: Colors.BLACK,
  },
  modalTitle: {
    color: Colors.GOLD,
    fontSize: rf(4.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: rh(1.8),
  },
  modalDivider: {
    height: 1.5,
    width: '80%',
    borderRadius: 1,
    marginBottom: rh(2),
  },
  modalMessage: {
    color: Colors.WHITE_75,
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[400],
    textAlign: 'center',
    lineHeight: rf(5.2),
    letterSpacing: 0.3,
    marginBottom: rh(3.5),
  },
  modalOkBtn: {
    width: '70%',
    borderRadius: rh(1.2),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOkBtnGradient: {
    paddingVertical: rh(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOkBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.5,
  },

  // ─── Bottom Banner ─────────────────────────────────────────────────────────
  bottomBanner: {
    height: rh(15),
    marginTop: rh(3),
    borderRadius: rh(1.5),
    overflow: 'hidden',
  },
  bottomBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
});
