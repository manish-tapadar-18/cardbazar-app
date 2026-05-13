import { ImageBackground } from 'react-native'
import React from 'react'
import { Images } from '../../../utils/Images'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'

const LanguageOptions = () => {
  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar />
    </ImageBackground>
  )
}

export default LanguageOptions