import { StyleSheet } from "react-native";
import { Colors } from "../../../utils/Colors";

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    bannerImage: {
        width: 260,
        height: 260,
        marginBottom: 32,
    },
    title: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 36,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        gap: 10,
    },
    shareIcon: {
        width: 22,
        height: 22,
        tintColor: Colors.BLACK,
    },
    shareButtonText: {
        color: Colors.BLACK,
        fontSize: 20,
        fontWeight: '700',
    },
})
