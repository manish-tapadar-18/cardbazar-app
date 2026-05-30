import React, { useEffect, useMemo, useState } from 'react';
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
import { createLoginValidationSchema } from '../../validations/schemas/LoginValidationSchema';
import { useFormik } from 'formik';
import CustomText from '../../components/CustomText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/NavigationStack';
import { useUserStore } from '../../stores/userStore';
import { useAdminDetailsStore } from '../../stores/adminDetailsStore';
import { Toast } from '../../utils/toast';
import { Repository } from '../../repository/Repository';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { Images } from '../../utils/Images';
import { useDemoStore } from '../../stores/demoStore';
import { useTranslation } from '../../hooks/useTranslation';

const DEMO_MOBILE = '9087561198';
const DEMO_PASSWORD = '123456';

const Login = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [focusedField, setFocusedField] = useState<'EMAIL' | 'PASSWORD' | null>(null);
    const { t, selectedLanguage } = useTranslation();
    const validationSchema = useMemo(() => createLoginValidationSchema(t), [selectedLanguage]);

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
        validateForm,
    } = useFormik<ILoginFormValues>({
        initialValues: { EMAIL: '', PASSWORD: '' },
        validationSchema,
        validateOnMount: false,
        onSubmit: (vals) => login(vals),
    });

    useEffect(() => {
        if (Object.keys(touched).some(Boolean)) validateForm();
    }, [selectedLanguage]);

    const { setUserSession, setAuthenticationStatus, setToken } = useUserStore();
    const { setAdminDetails } = useAdminDetailsStore();
    const { setDemoMode } = useDemoStore();

    const getUserDetails = async (email: string) => {
        const { isSuccess, data, message } = await Repository.User.userDetails({ EMAIL: email });
        if (isSuccess && data) return data;
        throw new Error(message ?? 'Failed to fetch user details');
    };

    const getAdminDetails = async () => {
        const { isSuccess, data, message } = await Repository.User.adminDetails();
        if (isSuccess && data) return data;
        throw new Error(message ?? 'Failed to fetch admin details');
    };

    const login = async (vals: ILoginFormValues) => {
        if (vals.EMAIL === DEMO_MOBILE && vals.PASSWORD === DEMO_PASSWORD) {
            setDemoMode(true);
            return;
        }
        try {
            Keyboard.dismiss();
            setLoading(true);
            const loginResponse = await Repository.Auth.login(vals);
            const { isSuccess, data: loginData, message: loginMessage } = loginResponse;
            if (!isSuccess || !loginData) {
                Toast.error(`${loginMessage}`, { placement: 'center', duration: 3000 });
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
            Toast.error(error.message, { placement: 'center', duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const mobileInputFocused = focusedField === 'EMAIL';
    const passwordInputFocused = focusedField === 'PASSWORD';

    return (
        <View style={styles.root}>
            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={70}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Gradient-border card ── */}
                <LinearGradient
                    colors={['rgba(255,215,0,0.45)', 'rgba(255,255,255,0.05)', 'rgba(255,215,0,0.45)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardBorder}
                >
                    <View style={styles.cardInner}>

                        {/* Card header */}
                        <View style={styles.cardHeaderRow}>
                            <LinearGradient
                                colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.cardAccent}
                            />
                            <View>
                                <CustomText style={styles.cardTitle}>{t("welcome_back_label")}</CustomText>
                                <CustomText style={styles.cardSubtitle}>{t("sign_in_to_your_account_label")}</CustomText>
                            </View>
                        </View>

                        {/* Gradient rule under header */}
                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerRule}
                        />

                        {/* ── Mobile field ── */}
                        <View style={styles.fieldGroup}>
                            <CustomText style={styles.fieldLabel}>{t("mobile_number_form_label")}</CustomText>
                            <View style={mobileInputFocused
                                ? [styles.inputRow, styles.inputRowFocused]
                                : styles.inputRow
                            }>
                                <Image source={Images.PHONE} style={styles.inputIcon} resizeMode="contain" />
                                <View style={styles.inputFlex}>
                                    <CustomTextInput
                                        onChangeText={(value: string) =>
                                            setFieldValue('EMAIL', value.replace(/[^0-9]/g, ''))
                                        }
                                        maxLength={10}
                                        onBlur={(e) => { handleBlur('EMAIL')(e); setFocusedField(null); }}
                                        onFocus={() => setFocusedField('EMAIL')}
                                        value={values.EMAIL}
                                        placeholder={`${t("enter_mobile_number_placeholder")}`}
                                        keyboardType="number-pad"
                                        returnKeyType="next"
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

                        {/* ── Password field ── */}
                        <View style={styles.fieldGroup}>
                            <CustomText style={styles.fieldLabel}>{t("password_label")}</CustomText>
                            <View style={passwordInputFocused
                                ? [styles.inputRow, styles.inputRowFocused]
                                : styles.inputRow
                            }>
                                <Image source={Images.DATA_SECURITY} style={styles.inputIcon} resizeMode="contain" />
                                <View style={styles.inputFlex}>
                                    <CustomTextInput
                                        secureTextEntry={!showPassword}
                                        onChangeText={handleChange('PASSWORD')}
                                        onBlur={(e) => { handleBlur('PASSWORD')(e); setFocusedField(null); }}
                                        onFocus={() => setFocusedField('PASSWORD')}
                                        value={values.PASSWORD}
                                        placeholder={`${t("enter_password_placeholder")}`}
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
                                        source={showPassword ? Images.EYE_ON : Images.EYE_OFF}
                                        style={styles.eyeIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                            {touched.PASSWORD && errors.PASSWORD && (
                                <CustomText style={authStyles.errorText}>{errors.PASSWORD}</CustomText>
                            )}
                        </View>

                        {/* Decorative gradient rule before button */}
                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.footerRule}
                        />

                        <CustomButton
                            disabled={isLoading}
                            loading={isLoading}
                            title={isLoading ? `${t("please_wait_loader")}` : `${t("login_button")}`}
                            containerStyle={styles.actionButton}
                            textStyle={authStyles.buttonText}
                            onPress={handleSubmit}
                            gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgetPassword')}
                            style={styles.forgotPasswordLink}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <CustomText style={styles.forgotPasswordText}>{t("forgot_password")}</CustomText>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(5),
        paddingVertical: rh(2),
    },

    // ─── Gradient-border card ────────────────────────────────────────────────────
    cardBorder: {
        borderRadius: rh(2),
        padding: 1,
    },
    cardInner: {
        backgroundColor: 'rgba(18, 4, 45, 0.96)',
        borderRadius: rh(2) - 1,
        paddingHorizontal: rw(4.5),
        paddingTop: rh(2.5),
        paddingBottom: rh(3),
    },

    // ─── Card header ─────────────────────────────────────────────────────────────
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
        marginBottom: rh(1.5),
    },
    cardAccent: {
        width: rw(1),
        height: rh(4),
        borderRadius: 4,
    },
    cardTitle: {
        color: Colors.WHITE,
        fontSize: rf(5.5),
        fontFamily: FontFamilyWithWeight[700],
        lineHeight: rf(6.5),
    },
    cardSubtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
    },
    headerRule: {
        height: 1,
        borderRadius: 1,
        marginBottom: rh(2.2),
    },

    // ─── Field group ──────────────────────────────────────────────────────────────
    fieldGroup: {
        marginBottom: rh(2),
    },
    fieldLabel: {
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[500],
        color: Colors.WHITE_75,
        marginBottom: rh(0.8),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: rh(1),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.18)',
        paddingHorizontal: rw(3),
        height: rh(6.5),
    },
    inputRowFocused: {
        borderColor: Colors.GOLD,
        backgroundColor: 'rgba(255,215,0,0.07)',
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

    // ─── Footer rule + button ──────────────────────────────────────────────────
    footerRule: {
        height: 1,
        borderRadius: 1,
        marginBottom: rh(2.2),
    },
    actionButton: {
        height: rh(7),
        borderRadius: rh(1),
        overflow: 'hidden',
    },

    forgotPasswordLink: {
        alignSelf: 'center',
        marginTop: rh(1.5),
    },
    forgotPasswordText: {
        color: Colors.GOLD,
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[500],
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
