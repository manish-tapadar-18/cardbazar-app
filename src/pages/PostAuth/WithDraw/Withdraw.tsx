import { ImageBackground } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Images } from '../../../utils/Images'
import GradientIconBar from '../../../components/GradientIconBar'
import { useNavigation } from '@react-navigation/native'
import { styles } from './styles'

const Withdtaw = () => {
    const [activeTopKey, setActiveTopKey] = useState('');
    const navigation = useNavigation<any>();
    
    const handleTopBarPress = useCallback(
        (item: { key: string }) => {
          setActiveTopKey(item.key)
          if (item.key === 'gameRules') navigation.navigate('GameRules')
          else if (item.key === 'referEarn') navigation.navigate('Refer')
          else if (item.key === 'gamesList') navigation.navigate('Home')
        },
        [navigation]
      )
    return (
        <ImageBackground
            source={Images.DASHBOARD_SPLASH}
            style={styles.background}
            resizeMode="cover"
        >
            <GradientIconBar activeKey={activeTopKey} onPress={handleTopBarPress} />
        </ImageBackground>
    )
}

export default Withdtaw