import React from 'react'
import { View, Image } from 'react-native'
import { styles } from "./styles"
import { Images } from "../../utils/Images"
import CustomButton from '../../components/CustomButton'
import { Colors } from '../../utils/Colors'
import CustomText from '../../components/CustomText'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AuthStackParamList } from '../../types/NavigationStack'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
const Splash = () => {

    const { top, bottom } = useSafeAreaInsets();
    type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
    const navigation = useNavigation<AuthNavigationProp>();

    return (
        <View style={{ justifyContent: "flex-end", flex: 1 }}>
            <Image source={Images.MAIN_SPLASH_SCREEN} style={styles.backgroundImage} />
            <CustomText children={"Card Bazar"} style={{ ...styles.apptext, marginTop: top }} />
            <CustomButton
                title="Start Your Winnings"
                containerStyle={{ ...styles.bottomButton, marginBottom: bottom }}
                textStyle={styles.bottomButtonText}
                onPress={() => { navigation.navigate("Authentication"); }}
                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
            />
        </View>
    )
}

export default Splash