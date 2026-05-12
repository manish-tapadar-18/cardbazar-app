import React, { useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { useDeviceModalStore } from '../stores/deviceModalStore';
import { useUserStore } from '../stores/userStore';
import { Repository } from '../repository/Repository';

interface Props {
    onCheckDevice: (userId: string) => void;
}

const DeviceBlockModal: React.FC<Props> = ({ onCheckDevice }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { isDeviceBlockVisible } = useDeviceModalStore();
    const { userDetails } = useUserStore();

    const handleRefresh = async () => {
        if (!userDetails?.EMAIL) return;
        try {
            setIsLoading(true);
            const { isSuccess, data } = await Repository.User.userDetails({ EMAIL: userDetails.EMAIL });
            if (isSuccess && data && data.STATUS !== 'INACTIVE') {
                onCheckDevice(data.ID);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={isDeviceBlockVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#1B0535', '#2D0A6E', '#3A0D7A']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Decorative rings */}
                <View style={styles.ringOuter}>
                    <View style={styles.ringInner} />
                </View>

                <View style={styles.card}>
                    {/* Orange/gold top accent bar */}
                    <LinearGradient
                        colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardTopBar}
                    />

                    {/* Icon */}
                    <View style={styles.iconCircle}>
                        <LinearGradient
                            colors={['#7a3500', '#cc6600']}
                            style={styles.iconGradient}
                        >
                            <CustomText style={styles.icon}>🔒</CustomText>
                        </LinearGradient>
                    </View>

                    <CustomText style={styles.title}>Device Blocked</CustomText>

                    <LinearGradient
                        colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />

                    <View style={styles.messageBox}>
                        <CustomText style={styles.messageText}>
                            Your device blocked. Please try after some time.
                        </CustomText>
                    </View>

                    <CustomText style={styles.footerNote}>
                        Tap Refresh to check your device status again.
                    </CustomText>

                    <CustomButton
                        title={isLoading ? '' : 'Refresh'}
                        onPress={handleRefresh}
                        disabled={isLoading}
                        containerStyle={styles.refreshButton}
                        textStyle={styles.refreshButtonText}
                        gradientColors={[Colors.GOLD_DARK, Colors.GOLD, Colors.ORANGE]}
                        gradientStart={{ x: 0, y: 0 }}
                        gradientEnd={{ x: 1, y: 0 }}
                    />
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={Colors.GOLD}
                            style={styles.loader}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default DeviceBlockModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(6),
    },
    ringOuter: {
        position: 'absolute',
        width: rw(90),
        height: rw(90),
        borderRadius: rw(45),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringInner: {
        width: rw(70),
        height: rw(70),
        borderRadius: rw(35),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.05)',
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        overflow: 'hidden',
        paddingBottom: rh(3.5),
        alignItems: 'center',
    },
    cardTopBar: {
        width: '100%',
        height: rh(0.6),
    },
    iconCircle: {
        marginTop: rh(3),
        marginBottom: rh(2),
        borderRadius: rw(10),
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#cc6600',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    iconGradient: {
        width: rw(18),
        height: rw(18),
        borderRadius: rw(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: rf(7),
    },
    title: {
        color: Colors.GOLD,
        fontSize: rf(7),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
        marginBottom: rh(1.5),
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        width: '80%',
        borderRadius: 1,
        marginBottom: rh(2),
    },
    messageBox: {
        width: '88%',
        backgroundColor: 'rgba(204,102,0,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,165,0,0.25)',
        padding: rw(4),
        marginBottom: rh(2),
        alignItems: 'center',
    },
    messageText: {
        color: Colors.WHITE,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[500],
        textAlign: 'center',
        lineHeight: rh(3),
    },
    footerNote: {
        color: Colors.WHITE_55,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        paddingHorizontal: rw(6),
        marginBottom: rh(2.5),
    },
    refreshButton: {
        width: '88%',
        height: rh(6.5),
        borderRadius: 12,
    },
    refreshButtonText: {
        color: Colors.BLACK,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 0.5,
    },
    loader: {
        marginTop: rh(1.5),
    },
});
