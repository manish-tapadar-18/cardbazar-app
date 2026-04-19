import { ImageBackground, Text, View } from 'react-native'
import React from 'react'
import { Images } from '../../../utils/Images'
import { styles } from './styles'

const PlayGame = () => {
    return (
        <ImageBackground
            source={Images.DASHBOARD_SPLASH}
            style={styles.background}
            resizeMode="cover"
        >

        </ImageBackground>
    )
}

export default PlayGame