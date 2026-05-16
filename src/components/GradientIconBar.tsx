import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import HorizontalIconBar, { HorizontalIconBarItem } from './HorizontalIconBar';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageModalStore } from '../stores/languageModalStore';
import { useNavigation, useRoute } from '@react-navigation/native';

const ROUTE_ACTIVE_KEY: Record<string, string> = {
  GameTimings: 'gameRules',
  Refer: 'referEarn',
  Home: 'gamesList',
};

const GradientIconBar: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useLanguageModalStore();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const activeKey = ROUTE_ACTIVE_KEY[route.name] ?? '';

  const topBarItems: HorizontalIconBarItem[] = [
    { key: 'gamesList', image: Images.CLOCK, text: t('games_list') },
    { key: 'gameRules', image: Images.TROPHY, text: t('game_rules') },
    { key: 'referEarn', image: Images.USERS, text: t('refer_earn') },
    { key: 'switchLang', image: Images.LANGUAGE, text: t('switch_language') },
  ];

  const handlePress = (item: HorizontalIconBarItem) => {
    if (item.key === 'switchLang') {
      openModal();
      return;
    }
    if (item.key === 'gameRules') navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { screen: 'GameTimings' },
    });
    else if (item.key === 'referEarn') navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { screen: 'Refer' },
    });
    else if (item.key === 'gamesList') navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { screen: 'Home' },
    });
  };

  return (
    <LinearGradient
      colors={Colors.GRADIENT.GRADIENTHEADER}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <HorizontalIconBar
        items={topBarItems}
        activeKey={activeKey}
        onPress={handlePress}
      />
    </LinearGradient>
  );
};

export default GradientIconBar;