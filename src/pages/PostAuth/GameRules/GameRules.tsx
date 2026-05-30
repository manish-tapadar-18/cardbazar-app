import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, ScrollView, ImageBackground, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import GradientIconBar from '../../../components/GradientIconBar';
import GradientText from '../../../components/GradientText';
import GradientSpacer from '../../../components/GradientSpacer';
import HorizontalTabBar from '../../../components/HorizontalTabBar';
import SeriesCard from '../../../components/SeriesCard';
import { styles } from './styles';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';
import { useFocusEffect } from '@react-navigation/native';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse';
import { IGameRulesItem } from '../../../response/module/IGameRulesResponse';
import { IGameRulesRequest } from '../../../request/module/IGameRulesRequest';

const SkeletonBox = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return <Animated.View style={[style, { opacity: pulseAnim }]} />;
};

const SeriesCardSkeleton = () => (
  <View style={styles.wrapper}>
    <View style={styles.badgeRow}>
      <SkeletonBox style={styles.badge} />
    </View>
    <View style={styles.card}>
      <SkeletonBox style={styles.line} />
      <SkeletonBox style={[styles.line, { width: '70%' }]} />
      <SkeletonBox style={[styles.line, { width: '60%' }]} />
    </View>
  </View>
);

const EmptyGameRules = () => (
  <View style={styles.emptyContainer}>
    <LinearGradient
      colors={Colors.GRADIENT.GOLD}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.emptyIconCircle}
    >
      <Text style={styles.emptyIcon}>🎴</Text>
    </LinearGradient>
    <Text style={styles.emptyTitle}>No Game Rules</Text>
    <Text style={styles.emptySubtitle}>No game rules available{'\n'}for this category yet.</Text>
  </View>
);

const GameRules = () => {
  const { setAdminDetails, adminDetails } = useAdminDetailsStore();
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [gameCategoryTabs, setGameCategoryTabs] = useState<IGameCategoryResponse[]>([]);
  const [gameRules, setGameRules] = useState<IGameRulesItem[]>([]);
  const gameRulesPayload: IGameRulesRequest = {
    "filters": {
      "search": [],
      "sortFilter": {
        "FIELD_NAME": "GAME_RULES.CREATED_AT",
        "SORT_ORDER": "ASC"
      }
    }
  }
  const filteredGameRules = useMemo(
    () => gameRules.filter(rule => rule.CATEGORY_ID === activeTab),
    [gameRules, activeTab]
  );

  const getAdminDetails = async () => {
    const adminDetailsResponse = await Repository.User.adminDetails();
    const { isSuccess, data, message } = adminDetailsResponse;
    if (isSuccess && data) {
      return data;
    }
    throw new Error(message ?? 'Failed to fetch admin details');
  }

  useFocusEffect(React.useCallback(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catResponse, rulesResponse,adminDetailsData] = await Promise.all([
          Repository.Game.getAllGameCategories(),
          Repository.Game.getAllGameRules(gameRulesPayload),
          getAdminDetails(),
        ]);
        setAdminDetails(adminDetailsData);
        const { isSuccess: catSuccess, data: catData, message: catMsg } = catResponse;
        if (!catSuccess || !catData) {
          Toast.error(`${catMsg}`, { placement: "center", duration: 3000 });
        } else {
          setGameCategoryTabs(catData);
          if (catData.length) {
            setActiveTab(catData[0].ID);
          }
        }

        const { isSuccess: rulesSuccess, data: rulesData, message: rulesMsg } = rulesResponse;
        if (!rulesSuccess || !rulesData) {
          Toast.error(`${rulesMsg}`, { placement: "center", duration: 3000 });
        } else {
          setGameRules(rulesData.DATA);
        }
      } catch (error: any) {
        Toast.error(`${error.message}`, { placement: "center", duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []));

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Top icon scroll bar */}
      <GradientIconBar />

      {/* Min / Max Withdrawal */}
      <View style={styles.withdrawalContainer}>
        <View style={styles.withdrawalRow}>
          <GradientText
            colors={Colors.GRADIENT.GOLD}
            style={styles.withdrawalLabel}
          >
            MIN. Deposit
          </GradientText>
          <GradientText
            colors={Colors.GRADIENT.TEXT_WHITE}
            style={styles.withdrawalValue}
          >
            INR {adminDetails?.MIN_DEPOSIT ? adminDetails?.MIN_DEPOSIT: 0}
          </GradientText>
        </View>
        <View style={styles.withdrawalRow}>
          <GradientText
            colors={Colors.GRADIENT.GOLD}
            style={styles.withdrawalLabel}
          >
            MAX. Deposit
          </GradientText>
          <GradientText
            colors={Colors.GRADIENT.TEXT_WHITE}
            style={styles.withdrawalValue}
          >
            INR {adminDetails?.MAX_DEPOSIT ? adminDetails?.MAX_DEPOSIT: 0}
          </GradientText>
        </View>
      </View>

      {/* Gradient divider */}
      <GradientSpacer
        colors={Colors.GRADIENT.SPACER}
        height={2}
      />

      {/* Card Bazaar tab bar */}
      {isLoading ? (
        <View style={styles.tabBarRow}>
          {[1, 2, 3].map((i) => (
            <SkeletonBox key={i} style={styles.tabPill} />
          ))}
        </View>
      ) : (
        <HorizontalTabBar
          tabs={gameCategoryTabs}
          activeKey={activeTab}
          onPress={(tab) => setActiveTab(tab.ID)}
        />
      )}

      {/* Series cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading
          ? [1, 2, 3].map((i) => <SeriesCardSkeleton key={i} />)
          : filteredGameRules.length === 0
            ? <EmptyGameRules />
            : filteredGameRules.map((rule) => (
              <SeriesCard
                key={rule.ID}
                detail={{
                  seriesName: rule.TYPE_NAME,
                  singleRate: `Single INR ${rule.BASE_AMOUNT} = INR ${rule.GAIN_AMOUNT}`,
                  minBet: `Minimum Bet Amount = INR  ${rule.MIN_BET}`,
                  maxBet: `Maximum Bet Amount = INR ${rule.MAX_BET}`,
                }}
              />
            ))
        }
      </ScrollView>
    </ImageBackground>
  );
};

export default GameRules;


