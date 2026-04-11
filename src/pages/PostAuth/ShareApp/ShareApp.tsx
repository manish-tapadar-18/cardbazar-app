import { ImageBackground, View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import React from 'react'
import { Images } from '../../../utils/Images'
import { styles } from './styles'
import LinearGradient from 'react-native-linear-gradient'
import GradientIconBar from '../../../components/GradientIconBar'
import Share from 'react-native-share'
import CustomText from '../../../components/CustomText'
import { useTranslation } from '../../../hooks/useTranslation'

const ShareApp = () => {

  const handleShare = async () => {
    try {
      await Share.open({
        title: 'Card Bazaar',
        message: 'Play Card Bazaar – the best card game app! Download now:',
        url: 'https://cardbazaar.app',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert('Error', 'Something went wrong while sharing.');
      }
    }
  };
const { t } = useTranslation();
  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar
        activeKey={'referEarn'}
        onPress={() => {}}
      />

      <View style={styles.content}>
        <Image
          source={Images.SHARE_BANNER}
          style={styles.bannerImage}
          resizeMode="contain"
        />

        <CustomText style={styles.title}>
          {t('share_app')}
        </CustomText>

        <TouchableOpacity onPress={handleShare} activeOpacity={0.85}>
          <LinearGradient
            colors={['#F5A623', '#F5A623', '#E8860A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <Image source={Images.SHARE} style={styles.shareIcon} resizeMode="contain" />
            <CustomText style={styles.shareButtonText}>{t('share')}</CustomText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

export default ShareApp
