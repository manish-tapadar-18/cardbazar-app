import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import HorizontalIconBar, { HorizontalIconBarItem } from './HorizontalIconBar';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageModalStore } from '../stores/languageModalStore';

type Props = {
  activeKey: string;
  onPress: (item: HorizontalIconBarItem) => void;
};

const GradientIconBar: React.FC<Props> = ({ activeKey, onPress }) => {
  const { t } = useTranslation();
  const { openModal } = useLanguageModalStore();

  const topBarItems: HorizontalIconBarItem[] = [
    { key: 'gameRules', image: Images.TROPHY, text: t('game_rules') },
    { key: 'referEarn', image: Images.USERS, text: t('refer_earn') },
    { key: 'gamesList', image: Images.CLOCK, text: t('games_list') },
    { key: 'switchLang', image: Images.LANGUAGE, text: t('switch_language') },
  ];

  const handlePress = (item: HorizontalIconBarItem) => {
    if (item.key === 'switchLang') {
      openModal();
      return;
    }
    onPress(item);
  };

  return (
    <LinearGradient
      colors={Colors.GRADIENT.HEADER}
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