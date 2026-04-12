import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Image, StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import CustomText from "./CustomText";
import { rh, rw } from "../utils/responsive";
import { Images } from "../utils/Images";
// import LottieView from "lottie-react-native";
import { useUserStore } from "../stores/userStore";
import { FontFamilyWithWeight } from "../utils/FontFamilyWithWeight";
import { clearAllStores } from "../stores/clearAllStores";
import { Colors } from "../utils/Colors";
import LinearGradient from "react-native-linear-gradient";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguageModalStore } from "../stores/languageModalStore";

type DrawerMenuItem = {
  label: string;
  icon: any;
  route?: string;
  tab: string;
  screen?: string;
  languageKey: string;
};

const MENU_ITEMS: DrawerMenuItem[] = [
  { label: "Home", icon: Images.HOME, tab: "HomeTab", screen: "Home", languageKey: "home_menu" },
  { label: "My Account", icon: Images.ACCOUNT, tab: "HomeTab", screen: "Account", languageKey: "my_account" },
  { label: "Game Rules", icon: Images.TROPHY, tab: "HomeTab", screen: "GameRules", languageKey: "game_rules" },
  { label: "Game Timing", icon: Images.CLOCK, tab: "HomeTab", screen: "GameTimings", languageKey: "game_timing" },
  { label: "Transaction History", icon: Images.TRANSACTION, tab: "HomeTab", screen: "TransactionHistory", languageKey: "transaction_history" },
  { label: "Play History", icon: Images.WITHDRAWAL, tab: "PlayHistoryTab", screen: "PlayHistory", languageKey: "play_history" },
  { label: "Refer & Earn", icon: Images.USERS, tab: "HomeTab", screen: "Refer", languageKey: "refer_earn" },
  { label: "Share", icon: Images.SHARE, tab: "HomeTab", screen: "ShareApp", languageKey: "share" },
  { label: "Switch Language", icon: Images.LANGUAGE, tab: "HomeTab", screen: "LanguageOptions", languageKey: "switch_language" },
];

const ROUTE_MAP: Record<string, string> = {
  "Home": "Home",
  "My Account": "Account",
  "Game Rules": "GameRules",
  "Game Timing": "GameTimings",
  "Transaction History": "TransactionHistory",
  "Play History": "PlayHistory",
  "Refer & Earn": "Refer",
  "Share": "ShareApp",
  "Switch Language": "LanguageOptions",
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { t } = useTranslation();
  const { openModal } = useLanguageModalStore();

  const navigateTo = (tab: string, screen?: string) => {
    if (screen === 'LanguageOptions') {
      props.navigation.closeDrawer();
      openModal();
      return;
    }
    props.navigation.navigate("MainTabs", {
      screen: tab,
      params: screen ? { screen } : undefined,
    });
  };

  const getActiveRouteName = (state: any): string => {
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  const activeRoute = getActiveRouteName(props.state);

  const { userDetails } = useUserStore();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={['#0D0120', '#1B0535', '#2D0A6E', '#3A0D7A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Background texture */}
        <Image source={Images.TOP_DRAWER} style={styles.headerBgImage} />

        {/* Floating card-suit watermarks */}
        <CustomText style={[styles.suitMark, styles.suitTL]}>♠</CustomText>
        <CustomText style={[styles.suitMark, styles.suitTR]}>♥</CustomText>
        <CustomText style={[styles.suitMark, styles.suitBL]}>♦</CustomText>
        <CustomText style={[styles.suitMark, styles.suitBR]}>♣</CustomText>
        {/* Avatar + user info row */}
        <View style={styles.avatarRow}>
          {/* Initials avatar with gold ring */}
          <View style={styles.avatarOuter}>
            <LinearGradient
              colors={[Colors.GOLD, Colors.ORANGE, Colors.GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientRing}
            >
              <View style={styles.avatarInner}>
                <CustomText style={styles.avatarInitials}>
                  {`${userDetails?.FIRST_NAME?.[0] ?? ""}${userDetails?.LAST_NAME?.[0] ?? ""}`.toUpperCase()}
                </CustomText>
              </View>
            </LinearGradient>
          </View>

          {/* Name + phone */}
          <View style={styles.userInfo}>
            <CustomText
              numberOfLines={1}
              style={styles.userName}
            >
              {`${userDetails?.FIRST_NAME ?? ""} ${userDetails?.LAST_NAME ?? ""}`}
            </CustomText>
            <View style={styles.phoneRow}>
              <Image source={Images.PHONE} style={styles.phoneIcon} resizeMode="contain" />
              <CustomText style={styles.phoneText}>
                {userDetails?.MOBILE ?? ""}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Wallet balance pill */}
        <LinearGradient
          colors={['rgba(255,215,0,0.18)', 'rgba(255,165,0,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balancePill}
        >
          <Image source={Images.WALLET} style={styles.balanceIcon} resizeMode="contain" />
          <View>
            <CustomText style={styles.balanceLabel}>Wallet Balance</CustomText>
            <CustomText style={styles.balanceValue}>
              {`₹ ${Number(userDetails?.USER_BALANCE ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </CustomText>
          </View>
        </LinearGradient>

        {/* Gold divider */}
        <LinearGradient
          colors={["transparent", Colors.GOLD, Colors.ORANGE, Colors.GOLD, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerDivider}
        />
      </LinearGradient>

      {/* ── Menu Items ── */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item, index) => {
          const isActive = activeRoute === ROUTE_MAP[item.label];
          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              onPress={() => navigateTo(item.tab, item.screen)}
              style={styles.menuItemWrapper}
            >
              {isActive ? (
                <LinearGradient
                  colors={[Colors.TAB_ACTIVE_BG, Colors.SECONDARY_BG]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.menuItemActive}
                >
                  <View style={styles.activeIndicator} />
                  <View style={styles.iconWrapper}>
                    <Image
                      source={item.icon}
                      tintColor={Colors.GOLD}
                      style={styles.menuIcon}
                    />
                  </View>
                  <CustomText children={t(item.languageKey)} style={styles.menuLabelActive} />
                </LinearGradient>
              ) : (
                <View style={styles.menuItem}>
                  <View style={styles.iconWrapperInactive}>
                    <Image
                      source={item.icon}
                      tintColor={Colors.BLAKISH_GRAY}
                      style={styles.menuIcon}
                    />
                  </View>
                  <CustomText children={t(item.languageKey)} style={styles.menuLabel} />
                </View>
              )}

              {/* Subtle divider between items (not last) */}
              {index < MENU_ITEMS.length - 1 && !isActive && (
                <View style={styles.itemDivider} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Footer Divider ── */}
      <LinearGradient
        colors={["transparent", Colors.GRAY, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.footerDivider}
      />

      {/* ── Logout ── */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => clearAllStores()}
        style={styles.logoutBtn}
      >
        <View style={styles.logoutIconWrapper}>
          <Image
            source={Images.LOGOUT}
            tintColor={Colors.ERROR_RED}
            style={styles.menuIcon}
          />
        </View>
        <CustomText children={t("logout")} style={styles.logoutLabel} />
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.WHITE,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingStart: 0,
    paddingEnd: 0,
  },

  // ── Header ──────────────────────────────────────
  header: {
    paddingTop: Platform.OS === "ios" ? rh(6) : rh(3.5),
    paddingBottom: rh(2),
    paddingHorizontal: rw(5),
    marginBottom: rh(1),
    overflow: "hidden",
  },
  headerBgImage: {
    ...StyleSheet.absoluteFill,
    width: undefined,
    height: undefined,
    opacity: 0.15,
  },
  // Floating card-suit watermarks
  suitMark: {
    position: "absolute",
    fontSize: rh(8),
    fontFamily: FontFamilyWithWeight[900],
    color: Colors.GOLD,
    opacity: 0.07,
  },
  suitTL: { top: rh(-1), left: rw(1) },
  suitTR: { top: rh(-0.5), right: rw(2), color: Colors.ERROR_RED, opacity: 0.09 },
  suitBL: { bottom: rh(1), left: rw(2), color: Colors.ERROR_RED, opacity: 0.07 },
  suitBR: { bottom: rh(0.5), right: rw(1) },
  // Mini logo
  headerLogo: {
    position: "absolute",
    top: Platform.OS === "ios" ? rh(5.5) : rh(3),
    right: rw(4),
    width: rw(9),
    height: rw(9),
    opacity: 0.55,
  },
  // Avatar row
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(4),
    marginBottom: rh(2),
  },
  avatarOuter: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  avatarGradientRing: {
    width: rh(8.5),
    height: rh(8.5),
    borderRadius: rh(4.25),
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
  },
  avatarInner: {
    flex: 1,
    width: "100%",
    borderRadius: rh(4.25),
    backgroundColor: Colors.DEEP_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: Colors.GOLD,
    fontSize: rh(2.8),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
    gap: rh(0.6),
  },
  userName: {
    color: Colors.WHITE,
    fontSize: rh(2.3),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(1.5),
  },
  phoneIcon: {
    width: rh(1.8),
    height: rh(1.8),
    tintColor: Colors.WHITE_55,
  },
  phoneText: {
    color: Colors.WHITE_75,
    fontSize: rh(1.7),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.5,
  },
  // Wallet balance pill
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(3),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.2),
    marginBottom: rh(1.5),
  },
  balanceIcon: {
    width: rh(3.2),
    height: rh(3.2),
    tintColor: Colors.GOLD,
  },
  balanceLabel: {
    color: Colors.WHITE_55,
    fontSize: rh(1.5),
    fontFamily: FontFamilyWithWeight[400],
    letterSpacing: 0.3,
  },
  balanceValue: {
    color: Colors.GOLD,
    fontSize: rh(2.2),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
  },
  // Referral badge
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(1.5),
    marginBottom: rh(1.8),
  },
  referralIcon: {
    width: rh(1.8),
    height: rh(1.8),
    tintColor: Colors.WHITE_55,
  },
  referralLabel: {
    color: Colors.WHITE_55,
    fontSize: rh(1.6),
    fontFamily: FontFamilyWithWeight[400],
  },
  referralCodeBadge: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
    borderRadius: 6,
    paddingHorizontal: rw(2),
    paddingVertical: 2,
  },
  referralCode: {
    color: Colors.GOLD,
    fontSize: rh(1.6),
    fontFamily: FontFamilyWithWeight[600],
    letterSpacing: 1,
  },
  headerDivider: {
    height: 1,
    opacity: 0.7,
  },

  // ── Menu ────────────────────────────────────────
  menuContainer: {
    paddingHorizontal: rw(3),
    paddingTop: rh(0.5),
  },
  menuItemWrapper: {
    borderRadius: rh(1.2),
    overflow: "hidden",
    marginVertical: rh(0.15),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rh(1.5),
    paddingHorizontal: rw(3),
    gap: rw(3.5),
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rh(1.5),
    paddingHorizontal: rw(3),
    gap: rw(3.5),
    borderRadius: rh(1.2),
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: rh(0.8),
    bottom: rh(0.8),
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.GOLD,
  },
  iconWrapper: {
    width: rh(4),
    height: rh(4),
    borderRadius: rh(2),
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperInactive: {
    width: rh(4),
    height: rh(4),
    borderRadius: rh(2),
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: rh(2.2),
    height: rh(2.2),
    resizeMode: "contain",
  },
  menuLabel: {
    fontSize: rh(1.9),
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.BLAKISH_GRAY,
    letterSpacing: 0.2,
  },
  menuLabelActive: {
    fontSize: rh(1.9),
    fontFamily: FontFamilyWithWeight[600],
    color: Colors.WHITE,
    letterSpacing: 0.2,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.GRAY,
    marginLeft: rw(3) + rh(4) + rw(3.5),
    opacity: 0.6,
  },

  // ── Footer ──────────────────────────────────────
  footerDivider: {
    height: 1,
    marginHorizontal: rw(5),
    marginVertical: rh(1.5),
    opacity: 0.5,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rh(1.5),
    paddingHorizontal: rw(6),
    gap: rw(3.5),
    marginHorizontal: rw(3),
    borderRadius: rh(1.2),
    backgroundColor: "rgba(252, 3, 3, 0.06)",
  },
  logoutIconWrapper: {
    width: rh(4),
    height: rh(4),
    borderRadius: rh(2),
    backgroundColor: "rgba(252, 3, 3, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutLabel: {
    fontSize: rh(1.9),
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.ERROR_RED,
    letterSpacing: 0.2,
  },
  bottomPadding: {
    height: rh(3),
  },
});
