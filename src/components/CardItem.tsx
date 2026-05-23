import React from 'react';
import { Image, Pressable, View } from 'react-native';
import CustomText from './CustomText';
import { Images } from '../utils/Images';
import { ENV } from '../utils/env';
import { styles } from '../pages/PostAuth/PlayGame/styles';

export interface PlayOption {
  ID: number;
  NAME: string;
  IMAGE_URL: string;
  TYPE?: string;
  typeOrder?: number;
  cardOrder?: number;
}

const RANK_MAP: Record<string, string> = { a: 'ACE', k: 'KING', q: 'QUEEN', j: 'JACK' };

export const formatCardName = (name: string | null): string => {
  if (!name) return '';
  return name.split('-').map(p => RANK_MAP[p.toLowerCase()] ?? p.toUpperCase()).join(' ');
};

interface CardItemProps {
  card: PlayOption;
  isSelected: boolean;
  onPress: (card: PlayOption) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, isSelected, onPress }) => {
  const imageUri = `${ENV.BASE_URL}/${card.IMAGE_URL}`;
  return (
    <Pressable
      onPress={() => onPress(card)}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {isSelected && (
        <View style={styles.checkBadge}>
          <CustomText style={styles.checkMark}>✓</CustomText>
        </View>
      )}
      <CustomText style={styles.cardLabel} numberOfLines={1}>
        {formatCardName(card.NAME)}
      </CustomText>
      <Image
        source={{ uri: imageUri }}
        defaultSource={Images.SMALL_CARD}
        style={styles.cardImage}
        resizeMode="contain"
      />
    </Pressable>
  );
};

export default CardItem;
