import React, { useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Keyboard,
    Image,
    StyleSheet,
    Text,
    Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import CustomTextInput from '../../components/CustomTextInput';
import { Colors } from '../../utils/Colors';
import CustomButton from '../../components/CustomButton';
import { rf, rh, rw } from '../../utils/responsive';
import { styles as authStyles } from './styles';
import { ILoginFormValues } from '../../validations/interfaces';
import { LoginValidationSchema } from '../../validations/schemas/LoginValidationSchema';
import { useFormik } from "formik";
import CustomText from '../../components/CustomText';
import { useUserStore } from '../../stores/userStore';
import { useAdminDetailsStore } from '../../stores/adminDetailsStore';
import { Toast } from '../../utils/toast';
import { Repository } from '../../repository/Repository';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { Images } from '../../utils/Images';
import { useDemoStore } from '../../stores/demoStore';

const DEMO_MOBILE = '9087561198';
const DEMO_PASSWORD = '123456';

const Login = () => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const show = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
        const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
    } = useFormik<ILoginFormValues>({
        initialValues: {
            EMAIL: "",
            PASSWORD: "",
        },
        validationSchema: LoginValidationSchema,
        validateOnMount: false,
        onSubmit: (values) => {
            login(values);
        },
    });

    const { setUserSession, setAuthenticationStatus, setToken } = useUserStore();
    const { setAdminDetails } = useAdminDetailsStore();
    const { setDemoMode } = useDemoStore();

    const getUserDetails = async (email: string) => {
        const userDetailsResponse = await Repository.User.userDetails({ EMAIL: email });
        const { isSuccess, data, message } = userDetailsResponse;
        if (isSuccess && data) return data;
        throw new Error(message ?? 'Failed to fetch user details');
    };

    const getAdminDetails = async () => {
        const adminDetailsResponse = await Repository.User.adminDetails();
        const { isSuccess, data, message } = adminDetailsResponse;
        if (isSuccess && data) return data;
        throw new Error(message ?? 'Failed to fetch admin details');
    };

    const login = async (values: ILoginFormValues) => {
        if (values.EMAIL === DEMO_MOBILE && values.PASSWORD === DEMO_PASSWORD) {
            setDemoMode(true);
            return;
        }
        try {
            Keyboard.dismiss();
            setLoading(true);
            const loginResponse = await Repository.Auth.login(values);
            const { isSuccess, data: loginData, message: loginMessage } = loginResponse;
            if (!isSuccess || !loginData) {
                Toast.error(`Error:- ${loginMessage}`, { placement: "bottom", duration: 3000 });
                return;
            }
            setToken(loginData.ACCESS_TOKEN);
            const [userDetailsData, adminDetailsData] = await Promise.all([
                getUserDetails(loginData.EMAIL),
                getAdminDetails(),
            ]);
            setUserSession({ ...loginData, ...userDetailsData });
            setAdminDetails(adminDetailsData);
            setAuthenticationStatus(true);
        } catch (error: any) {
            Toast.error(error.message, { placement: "bottom", duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#1B0535', '#2D0A6E', '#3A0D7A', '#2D0A6E', '#1B0535']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBg}
            >
                {/* Decorative watermark */}
                <Image
                    source={require('../../assets/images/spade_card.png')}
                    style={styles.watermark}
                    resizeMode="contain"
                />

                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={70}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* ── Branding ── */}
                    <View style={styles.brandSection}>
                        <Image
                            source={require('../../assets/logo/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <CustomText style={styles.appName}>Card Bazar</CustomText>
                        <CustomText style={styles.tagline}>
                            Your Ultimate Card Gaming Platform
                        </CustomText>
                    </View>

                    {/* ── Form card ── */}
                    <View style={styles.card}>

                        {/* Header */}
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardAccent} />
                            <View>
                                <CustomText style={styles.cardTitle}>Welcome Back</CustomText>
                                <CustomText style={styles.cardSubtitle}>Sign in to your account</CustomText>
                            </View>
                        </View>

                        {/* Solid gold divider — same as Account.tsx */}
                        <View style={styles.goldDivider} />

                        {/* Mobile field */}
                        <View style={styles.fieldGroup}>
                            <CustomText style={styles.fieldLabel}>Mobile Number</CustomText>
                            <View style={styles.inputRow}>
                                <Image source={Images.PHONE} style={styles.inputIcon} resizeMode="contain" />
                                <View style={styles.inputFlex}>
                                    <CustomTextInput
                                        onChangeText={(value: string) =>
                                            setFieldValue("EMAIL", value.replace(/[^0-9]/g, ""))
                                        }
                                        onBlur={handleBlur("EMAIL")}
                                        value={values.EMAIL}
                                        placeholder='Enter mobile number'
                                        keyboardType='number-pad'
                                        returnKeyType='next'
                                        style={styles.textInput}
                                        focusedPlaceholderColor={Colors.GOLD}
                                        unfocusedPlaceholderColor={Colors.WHITE_55}
                                    />
                                </View>
                            </View>
                            {touched.EMAIL && errors.EMAIL && (
                                <CustomText style={authStyles.errorText}>{errors.EMAIL}</CustomText>
                            )}
                        </View>

                        {/* Password field */}
                        <View style={styles.fieldGroup}>
                            <CustomText style={styles.fieldLabel}>Password</CustomText>
                            <View style={styles.inputRow}>
                                <Image source={Images.DATA_SECURITY} style={styles.inputIcon} resizeMode="contain" />
                                <View style={styles.inputFlex}>
                                    <CustomTextInput
                                        secureTextEntry={!showPassword}
                                        onChangeText={handleChange("PASSWORD")}
                                        onBlur={handleBlur("PASSWORD")}
                                        value={values.PASSWORD}
                                        placeholder='Enter password'
                                        style={styles.textInput}
                                        focusedPlaceholderColor={Colors.GOLD}
                                        unfocusedPlaceholderColor={Colors.WHITE_55}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowPassword(prev => !prev)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Image
                                        source={
                                            showPassword
                                                ? require('../../assets/images/eye_on.png')
                                                : require('../../assets/images/eye_off.png')
                                        }
                                        style={styles.eyeIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                            {touched.PASSWORD && errors.PASSWORD && (
                                <CustomText style={authStyles.errorText}>{errors.PASSWORD}</CustomText>
                            )}
                        </View>

                        {/* Decorative gold gradient rule */}
                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.decorativeDivider}
                        />

                        <CustomButton
                            disabled={isLoading}
                            loading={isLoading}
                            title={isLoading ? 'Please Wait...' : 'Login'}
                            containerStyle={styles.actionButton}
                            textStyle={authStyles.buttonText}
                            onPress={handleSubmit}
                            gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>

            {keyboardHeight > 0 && (
                <View style={[styles.keyboardToolbar, { bottom: keyboardHeight }]}>
                    <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneButton}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.PRIMARY_BG,
    },
    gradientBg: {
        flex: 1,
    },
    watermark: {
        position: 'absolute',
        width: rw(75),
        height: rw(75),
        opacity: 0.05,
        bottom: rh(-4),
        right: rw(-12),
        tintColor: Colors.GOLD,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(5),
        paddingBottom: rh(5),
    },

    // ─── Branding ─────────────────────────────────────────────────────────────
    brandSection: {
        alignItems: 'center',
        paddingTop: rh(7),
        paddingBottom: rh(3.5),
    },
    logo: {
        width: rw(24),
        height: rw(24),
        marginBottom: rh(1.2),
    },
    appName: {
        color: Colors.GOLD,
        fontSize: rf(7.5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1.5,
    },
    tagline: {
        color: Colors.WHITE_75,
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[400],
        marginTop: rh(0.5),
        textAlign: 'center',
    },

    // ─── Card ─────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: Colors.CARD_BG,
        borderRadius: rh(1.5),
        borderWidth: 1,
        borderColor: Colors.BORDER_WHITE_08,
        paddingHorizontal: rw(4),
        paddingTop: rh(2),
        paddingBottom: rh(2.5),
    },

    // ─── Card Header ──────────────────────────────────────────────────────────
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
        marginBottom: rh(1.5),
    },
    cardAccent: {
        width: rw(1),
        height: rh(3.5),
        borderRadius: 4,
        backgroundColor: Colors.GOLD,
    },
    cardTitle: {
        color: Colors.WHITE,
        fontSize: rf(5.5),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rf(6.5),
    },
    cardSubtitle: {
        color: Colors.WHITE_75,
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[400],
    },

    // ─── Solid gold divider (matches Account.tsx) ─────────────────────────────
    goldDivider: {
        height: 1,
        backgroundColor: Colors.GOLD,
        marginBottom: rh(2),
    },

    // ─── Field group (label + input + error) ─────────────────────────────────
    fieldGroup: {
        marginBottom: rh(1.8),
    },
    fieldLabel: {
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[500],
        color: Colors.WHITE_75,
        marginBottom: rh(0.8),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: rh(1),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        paddingHorizontal: rw(3),
        height: rh(6.5),
    },
    inputIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: Colors.GOLD,
        marginRight: rw(2.5),
        opacity: 0.9,
    },
    inputFlex: {
        flex: 1,
        height: '100%',
    },
    textInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: Colors.WHITE,
        paddingHorizontal: 0,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
    },
    eyeIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE_55,
        marginLeft: rw(2),
    },

    // ─── Decorative divider + button ──────────────────────────────────────────
    decorativeDivider: {
        height: 1,
        borderRadius: 1,
        marginBottom: rh(2),
    },
    actionButton: {
        height: rh(7),
        borderRadius: rh(1),
        overflow: 'hidden',
    },

    // ─── Keyboard toolbar ─────────────────────────────────────────────────────
    keyboardToolbar: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: Colors.DEEP_PURPLE,
        paddingHorizontal: rw(4),
        paddingVertical: rh(1),
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: Colors.BORDER_WHITE_12,
    },
    doneButton: {
        paddingHorizontal: rw(4),
        paddingVertical: rh(0.8),
    },
    doneText: {
        color: Colors.GOLD,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[600],
    },
});
