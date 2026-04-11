import { StyleSheet } from "react-native";
import { Colors } from "../../../utils/Colors";
import { rf, rh } from "../../../utils/responsive";

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: rf(4.5),
        fontWeight: '700',
        color: Colors.BLACK,
        marginTop: 20,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
        height: rh(6),
    },
    fullInput: {
        height: rh(6),
    },
    errorText: {
        color: Colors.BLOOD_RED,
        fontSize: rf(3.2),
        marginTop: 2,
    },
    upiLabel: {
        fontSize: rf(3.5),
        fontWeight: '600',
        color: Colors.BLACK,
        marginBottom: 6,
    },
    buttonText: {
        color: Colors.DARK_BROWN,
        fontSize: rf(4),
        fontWeight: '600',
    },
    buttonContainer: {
        height: rh(7),
        marginTop: 24,
        marginBottom: 8,
    },
});
