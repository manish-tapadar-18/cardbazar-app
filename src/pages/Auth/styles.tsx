import { StyleSheet } from "react-native";
import { Colors } from "../../utils/Colors";
import { Fonts } from "../../utils/Fontsizes";
import { FontFamilyWithWeight } from "../../utils/FontFamilyWithWeight";
import { rf, rh } from "../../utils/responsive";
import { Spaces } from "../../utils/Spaces";

export const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerText: {
        color: Colors.WHITE,
        alignSelf: "center",
        fontSize: Fonts.small,
        fontFamily: FontFamilyWithWeight[400]
    },
    authTypeText: {
        fontSize: Fonts.regular,
        fontFamily: FontFamilyWithWeight[500]
    },
    gradientView: {
        width: "50%",
        height: 7,
        backgroundColor: Colors.YELLOW
    },
    formOuterContainer: {
        flex: 1,
    },
    inputStyle: {
        borderWidth: 1,
        borderColor: Colors.GRAY,
        borderRadius: 4
    },
    loginButton: {
        height: rh(6),
    },
    buttonText: {
        color: Colors.DARK_BROWN,
        fontSize: rf(6),
        fontWeight: "bold"
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spaces.regular,
        // justifyContent: "center"
    },
    form: {
        paddingVertical: Spaces.regular,
        gap: Spaces.regular,
    },
    errorText: {
        color: Colors.ERROR_RED,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
        marginTop: rh(0.3),
    },
    editNumber:{
        alignSelf:"center",
        color: Colors.DARK_BROWN,
        fontSize: Fonts.regular,
        fontFamily: FontFamilyWithWeight[600]
    },
    editPen: {
        width: rh(2),
        height: rh(2),
        resizeMode: 'contain'
    }
})