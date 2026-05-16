import { StyleSheet } from "react-native";
import { Colors } from "../../utils/Colors"
import { FontFamilyWithWeight } from "../../utils/FontFamilyWithWeight"
import { Fonts } from "../../utils/Fontsizes"
import { Spaces } from "../../utils/Spaces";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:"flex-end"
    },
    backgroundImage: {
        ...StyleSheet.absoluteFill,
        width: '100%',
        height: '100%',
        resizeMode:"stretch"
    },
    apptext: {
        color: Colors.YELLOW,
        fontSize: Fonts.xxxxxLarge,
        fontFamily: FontFamilyWithWeight[900],
        alignSelf:"center",
        position:"absolute",
        zIndex:9999,
        top:Spaces.large
    },
    bottomButton: {
        height: 60,
        width: '100%'
    },
    bottomButtonText: {
        color: Colors.DARK_BROWN,
        fontSize: Fonts.regular,
        fontFamily: FontFamilyWithWeight[600]
    }
})