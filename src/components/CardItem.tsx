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

export const formatCardName = (name: string): string => {
  const parts = name.split('-');
  if (parts.length < 2) return name.toUpperCase();
  return `${parts[0].toUpperCase()} - ${parts[1].toUpperCase()}`;
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
