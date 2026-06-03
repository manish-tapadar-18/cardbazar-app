import { StyleSheet } from 'react-native'
import { Colors } from '../../../utils/Colors'
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight'
import { rf, rh, rw } from '../../../utils/responsive'

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  content: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: rw(5),
    paddingTop: rh(3),
    paddingBottom: rh(10),
  },

  // ─── Balance card ──────────────────────────────────────────────────────────
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: rw(4),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    paddingVertical: rh(2.5),
    marginBottom: rh(3),
  },
  balanceLabel: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight["600"],
    letterSpacing: 1,
    marginBottom: rh(0.5),
  },
  balanceAmount: {
    color: Colors.GOLD,
    fontSize: rf(5.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
  },
  minAmountText: {
    color: Colors.WHITE_55,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight["600"],
    marginTop: rh(0.5),
  },

  // ─── Form container ────────────────────────────────────────────────────────
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rw(4),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: rw(5),
    gap: rh(0.5),
  },

  // ─── Field group ───────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: rh(1.5),
  },
  inputLabel: {
    color: Colors.WHITE_75,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[600],
    marginBottom: rh(0.8),
    letterSpacing: 0.3,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rw(3),
    height: rh(6.5),
    paddingHorizontal: rw(4),
    color: Colors.WHITE,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[700],
  },
  inputBoxDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: Colors.ERROR_RED,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[700],
    marginTop: rh(0.5),
  },

  // ─── Global error ──────────────────────────────────────────────────────────
  globalError: {
    color: Colors.ERROR_RED,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[600],
    textAlign: 'center',
    marginTop: rh(1),
    marginBottom: rh(1),
  },

  // ─── Submit button ─────────────────────────────────────────────────────────
  submitBtnWrapper: {
    marginTop: rh(2.5),
    borderRadius: rh(1.5),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  submitBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(2),
  },
  submitBtnText: {
    color: Colors.BLACK,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
  },

  // ─── Section divider ───────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: rh(1.5),
  },
})
