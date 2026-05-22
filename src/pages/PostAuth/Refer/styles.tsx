import { StyleSheet } from "react-native";
import { Colors } from "../../../utils/Colors";
import { rf, rh, rw } from "../../../utils/responsive";
import { FontFamilyWithWeight } from "../../../utils/FontFamilyWithWeight";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: rh(4),
  },
  banner: {
    width: '90%',
    height: rh(30),
    marginTop: rh(2),
    borderRadius: rw(3),
    overflow: 'hidden',
  },
  card: {
    width: '90%',
    backgroundColor: Colors.WHITE,
    borderRadius: rw(3),
    marginTop: rh(2),
    paddingVertical: rh(2),
    paddingHorizontal: rw(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: FontFamilyWithWeight[800],
    fontSize: rf(5),
    color: Colors.BLAKISH_GRAY,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rw(2),
    paddingVertical: rh(0.8),
    paddingHorizontal: rw(4),
    gap: rw(2.5),
  },
  codeText: {
    fontFamily: FontFamilyWithWeight[700],
    fontSize: rf(5),
    color: Colors.WHITE,
    letterSpacing: 1.5,
  },
  copyBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIcon: {
    width: rw(5),
    height: rw(5),
    tintColor: Colors.WHITE,
  },
  infoText: {
    width: '90%',
    marginTop: rh(1.5),
    fontFamily: FontFamilyWithWeight[400],
    fontSize: rf(4),
    color: Colors.WHITE_75,
    lineHeight: rh(2.6),
  },
  shareBtn: {
    width: '90%',
    marginTop: rh(2.5),
    borderRadius: rw(3),
    overflow: 'hidden',
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(1.8),
    gap: rw(2),
  },
  shareIcon: {
    width: rw(5),
    height: rw(5),
    tintColor: Colors.BLAKISH_GRAY,
  },
  shareBtnText: {
    fontFamily: FontFamilyWithWeight[700],
    fontSize: rf(5),
    color: Colors.BLAKISH_GRAY,
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: Colors.GOLD,
    marginTop: rh(2.5),
    opacity: 0.5,
  },
  historyBtn: {
    marginTop: rh(1.5),
    paddingVertical: rh(1),
  },
  historyBtnText: {
    fontFamily: FontFamilyWithWeight[600],
    fontSize: rf(6),
    color: Colors.GOLD,
  },
});
