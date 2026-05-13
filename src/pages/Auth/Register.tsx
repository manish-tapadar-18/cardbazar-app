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
import { IRegisterFormValues, IVerifyOtpValues } from '../../validations/interfaces';
import { RegisterValidationSchema } from '../../validations/schemas/RegisterValidationSchema';
import { useFormik } from 'formik';
import CustomText from '../../components/CustomText';
import { Toast } from '../../utils/toast';
import { VerifyOtpValidationSchema } from '../../validations/schemas/VerifyOtpValidationSchema';
import { Images } from '../../utils/Images';
import { Repository } from "../../repository/Repository";
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { OtpVerificationPayload } from '../../services/interfaces/IAuthenticationService';
import { useUserStore } from '../../stores/userStore';
import { useAdminDetailsStore } from '../../stores/adminDetailsStore';

const Register = () => {

    const generateEmail = () => {
        return `${new Date().getTime()}${Math.floor(1000 + Math.random() * 9000)}@cardBazaar.com`;
    };

    const [isLoading, setLoading] = useState(false);
    const [showRegForm, setRegFormVisibility] = useState<boolean>(true);
    const [otpData, setOtpData] = useState<OtpVerificationPayload | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const { setUserSession, setAuthenticationStatus, setToken } = useUserStore();
    const { setAdminDetails } = useAdminDetailsStore();

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
    } = useFormik<IRegisterFormValues>({
        initialValues: {
            FIRST_NAME: "",
            LAST_NAME: "",
            MOBILE: "",
            PASSWORD: "",
            CONFIRM_PASSWORD: "",
            REFERRAL_CODE: "",
            EMAIL: generateEmail(),
        },
        validationSchema: RegisterValidationSchema,
        validateOnMount: false,
        onSubmit: (values) => {
            sendOTP(values.MOBILE);
        },
    });

    const {
        values: OtpValues,
        errors: OtpErrors,
        touched: OtpTouched,
        handleBlur: OtpHandleBlur,
        handleSubmit: OtpHandleSubmit,
        setFieldValue: OtpSetFieldValue,
        resetForm: OtpResetForm,
    } = useFormik<IVerifyOtpValues>({
        initialValues: {
            otp: "",
        },
        validationSchema: VerifyOtpValidationSchema,
        validateOnMount: false,
        onSubmit: (values) => {
            verifyOtp();
        },
    });

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

    const sendOTP = async (MOBILE: string) => {
        try {
            setLoading(true);
            const response = await Repository.Auth.sendOtp({ MOBILE });
            const { isSuccess, data, message } = response;
            if (isSuccess && data) {
                setRegFormVisibility(false);
                setOtpData({ otp: data.OTP, verificationId: data.code });
            } else {
                Toast.error(message);
            }
        } catch (error: any) {
            Toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async () => {
        try {
            setLoading(true);
            const { CONFIRM_PASSWORD, ...payload } = values;
            const response = await Repository.Auth.registerUser(payload);
            const { isSuccess, message } = response;
            if (isSuccess) {
                let loginResponse = await Repository.Auth.login({ EMAIL: payload.MOBILE, PASSWORD: payload.PASSWORD });
                const { isSuccess: loginSuccess, data: loginData, message: loginMessage } = loginResponse;
                if (!isSuccess || !loginData) {
                    Toast.error(`Error:- ${loginMessage}`, { placement: "bottom", duration: 3000 });
                    return;
                }
                const [userDetailsData, adminDetailsData] = await Promise.all([
                    getUserDetails(loginData.EMAIL),
                    getAdminDetails(),
                ]);
                setUserSession({ ...loginData, ...userDetailsData });
                setAdminDetails(adminDetailsData);
                setAuthenticationStatus(true);
            } else {
                Toast.error(message);
            }
        } catch (error: any) {
            Toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (otpData) {
            const { isSuccess, message } = await Repository.Auth.verifyOTP({otp:OtpValues.otp,verificationId:otpData.verificationId});
            if (isSuccess) {
                registerUser();
            } else {
                Toast.error(message);
            }
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
                    source={Images.HEART_CARD}
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
                            Join the ultimate card gaming platform
                        </CustomText>
                    </View>

                    {/* ── Registration form ── */}
                    {showRegForm && (
                        <View style={styles.card}>

                            <View style={styles.cardHeaderRow}>
                                <View style={styles.cardAccent} />
                                <View>
                                    <CustomText style={styles.cardTitle}>Create Account</CustomText>
                                    <CustomText style={styles.cardSubtitle}>Fill in your details below</CustomText>
                                </View>
                            </View>
                            <View style={styles.goldDivider} />

                            <FieldRow
                                label="First Name"
                                icon={Images.USERS}
                                error={touched.FIRST_NAME && errors.FIRST_NAME ? errors.FIRST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        setFieldValue("FIRST_NAME", text.replace(/[^A-Za-z\s]/g, ""))
                                    }
                                    onBlur={handleBlur("FIRST_NAME")}
                                    value={values.FIRST_NAME}
                                    placeholder='Enter first name'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Last Name"
                                icon={Images.USERS}
                                error={touched.LAST_NAME && errors.LAST_NAME ? errors.LAST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        setFieldValue("LAST_NAME", text.replace(/[^A-Za-z\s]/g, ""))
                                    }
                                    onBlur={handleBlur("LAST_NAME")}
                                    value={values.LAST_NAME}
                                    placeholder='Enter last name'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Mobile Number"
                                icon={Images.PHONE}
                                error={touched.MOBILE && errors.MOBILE ? errors.MOBILE : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(value: string) =>
                                        setFieldValue("MOBILE", value.replace(/[^0-9]/g, ""))
                                    }
                                    onBlur={handleBlur("MOBILE")}
                                    value={values.MOBILE}
                                    placeholder='Enter mobile number'
                                    keyboardType='number-pad'
                                    returnKeyType='next'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Password"
                                icon={Images.DATA_SECURITY}
                                error={touched.PASSWORD && errors.PASSWORD ? errors.PASSWORD : undefined}
                                rightSlot={
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(p => !p)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Image
                                            source={showPassword ? Images.EYE_ON : Images.EYE_OFF}
                                            style={styles.eyeIcon}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                }
                            >
                                <CustomTextInput
                                    secureTextEntry={!showPassword}
                                    placeholder='Enter password'
                                    value={values.PASSWORD}
                                    onChangeText={handleChange("PASSWORD")}
                                    onBlur={handleBlur("PASSWORD")}
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Confirm Password"
                                icon={Images.DATA_SECURITY}
                                error={touched.CONFIRM_PASSWORD && errors.CONFIRM_PASSWORD ? errors.CONFIRM_PASSWORD : undefined}
                                rightSlot={
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(p => !p)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Image
                                            source={showConfirmPassword ? Images.EYE_ON : Images.EYE_OFF}
                                            style={styles.eyeIcon}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                }
                            >
                                <CustomTextInput
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder='Re-enter password'
                                    value={values.CONFIRM_PASSWORD || ""}
                                    onChangeText={handleChange("CONFIRM_PASSWORD")}
                                    onBlur={handleBlur("CONFIRM_PASSWORD")}
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Referral Code (Optional)"
                                icon={Images.TROPHY}
                                error={undefined}
                            >
                                <CustomTextInput
                                    value={values.REFERRAL_CODE || ""}
                                    onChangeText={(text: string) =>
                                        setFieldValue("REFERRAL_CODE", text.replace(/[^A-Za-z0-9]/g, ""))
                                    }
                                    onBlur={handleBlur("REFERRAL_CODE")}
                                    placeholder='Enter referral code'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.decorativeDivider}
                            />

                            <CustomButton
                                title={isLoading ? "Please Wait..." : "Continue"}
                                containerStyle={styles.actionButton}
                                textStyle={authStyles.buttonText}
                                disabled={isLoading}
                                loading={isLoading}
                                onPress={handleSubmit}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        </View>
                    )}

                    {/* ── OTP form ── */}
                    {!showRegForm && (
                        <View style={styles.card}>

                            <View style={styles.cardHeaderRow}>
                                <View style={styles.cardAccent} />
                                <View>
                                    <CustomText style={styles.cardTitle}>Verify OTP</CustomText>
                                    <CustomText style={styles.cardSubtitle}>
                                        Sent to +91 {values.MOBILE}
                                    </CustomText>
                                </View>
                            </View>
                            <View style={styles.goldDivider} />

                            <TouchableOpacity
                                onPress={() => { setRegFormVisibility(true); OtpResetForm(); setFieldValue("EMAIL", generateEmail()); }}
                                style={styles.editNumberRow}
                            >
                                <Image source={Images.EDIT_PEN} style={styles.editPenIcon} resizeMode="contain" />
                                <CustomText style={styles.editNumberText}>Edit Number</CustomText>
                            </TouchableOpacity>

                            <FieldRow
                                label="Enter OTP"
                                icon={Images.CIRCLE_CHECK}
                                error={OtpTouched.otp && OtpErrors.otp ? OtpErrors.otp : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        OtpSetFieldValue("otp", text.replace(/[^A-Za-z0-9\s]/g, ""))
                                    }
                                    onBlur={OtpHandleBlur("otp")}
                                    value={OtpValues.otp}
                                    placeholder='Enter OTP'
                                    keyboardType='number-pad'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.decorativeDivider}
                            />

                            <CustomButton
                                title={isLoading ? "Please Wait..." : "Verify OTP"}
                                containerStyle={styles.actionButton}
                                textStyle={authStyles.buttonText}
                                disabled={isLoading}
                                loading={isLoading}
                                onPress={OtpHandleSubmit}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        </View>
                    )}
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

// ─── Field row: label + icon input + error ────────────────────────────────────
type FieldRowProps = {
    label: string;
    icon: any;
    error?: string;
    rightSlot?: React.ReactNode;
    children: React.ReactNode;
};

const FieldRow: React.FC<FieldRowProps> = ({ label, icon, error, rightSlot, children }) => (
    <View style={styles.fieldGroup}>
        <CustomText style={styles.fieldLabel}>{label}</CustomText>
        <View style={styles.inputRow}>
            <Image source={icon} style={styles.inputIcon} resizeMode="contain" />
            <View style={styles.inputFlex}>{children}</View>
            {rightSlot}
        </View>
        {error ? <CustomText style={authStyles.errorText}>{error}</CustomText> : null}
    </View>
);

export default Register;

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
        left: rw(-12),
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
        paddingTop: rh(5),
        paddingBottom: rh(3),
    },
    logo: {
        width: rw(20),
        height: rw(20),
        marginBottom: rh(1),
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
        marginBottom: rh(1.5),
    },

    // ─── Field group (label + input + error) ──────────────────────────────────
    fieldGroup: {
        marginBottom: rh(1.5),
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

    // ─── Edit number row (OTP screen) ─────────────────────────────────────────
    editNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rw(2),
        paddingVertical: rh(0.5),
        marginBottom: rh(0.5),
    },
    editPenIcon: {
        width: rw(4),
        height: rw(4),
        tintColor: Colors.GOLD,
    },
    editNumberText: {
        color: Colors.GOLD,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[600],
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
