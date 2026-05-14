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
import { Repository } from '../../repository/Repository';
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
    const [focusedField, setFocusedField] = useState<string | null>(null);

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
            FIRST_NAME: '',
            LAST_NAME: '',
            MOBILE: '',
            PASSWORD: '',
            CONFIRM_PASSWORD: '',
            REFERRAL_CODE: '',
            EMAIL: generateEmail(),
        },
        validationSchema: RegisterValidationSchema,
        validateOnMount: false,
        onSubmit: (vals) => sendOTP(vals.MOBILE),
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
        initialValues: { otp: '' },
        validationSchema: VerifyOtpValidationSchema,
        validateOnMount: false,
        onSubmit: () => verifyOtp(),
    });

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
            const { CONFIRM_PASSWORD, ...payload } = values;
            const response = await Repository.Auth.registerUser(payload);
            const { isSuccess, message } = response;
            if (isSuccess) {
                const loginResponse = await Repository.Auth.login({ EMAIL: payload.MOBILE, PASSWORD: payload.PASSWORD });
                const { isSuccess: loginSuccess, data: loginData, message: loginMessage } = loginResponse;
                if (!loginSuccess || !loginData) {
                    Toast.error(`Error:- ${loginMessage}`, { placement: 'bottom', duration: 3000 });
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
            setLoading(true);
            const { isSuccess, message } = await Repository.Auth.verifyOTP({
                otp: OtpValues.otp,
                verificationId: otpData.verificationId,
            });
            if (isSuccess) {
                registerUser();
            } else {
                Toast.error(message);
            }
        }
    };

    const focus = (field: string) => () => setFocusedField(field);
    const blur = (formikBlur: (e: any) => void) => (e: any) => {
        formikBlur(e);
        setFocusedField(null);
    };

    return (
        <View style={styles.root}>
            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={70}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Registration form card ── */}
                {showRegForm && (
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
                                    <CustomText style={styles.cardTitle}>Create Account</CustomText>
                                    <CustomText style={styles.cardSubtitle}>Fill in your details below</CustomText>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.headerRule}
                            />

                            <FieldRow
                                label="First Name"
                                icon={Images.USERS}
                                focused={focusedField === 'FIRST_NAME'}
                                error={touched.FIRST_NAME && errors.FIRST_NAME ? errors.FIRST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        setFieldValue('FIRST_NAME', text.replace(/[^A-Za-z\s]/g, ''))
                                    }
                                    onBlur={blur(handleBlur('FIRST_NAME'))}
                                    onFocus={focus('FIRST_NAME')}
                                    value={values.FIRST_NAME}
                                    placeholder="Enter first name"
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Last Name"
                                icon={Images.USERS}
                                focused={focusedField === 'LAST_NAME'}
                                error={touched.LAST_NAME && errors.LAST_NAME ? errors.LAST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        setFieldValue('LAST_NAME', text.replace(/[^A-Za-z\s]/g, ''))
                                    }
                                    onBlur={blur(handleBlur('LAST_NAME'))}
                                    onFocus={focus('LAST_NAME')}
                                    value={values.LAST_NAME}
                                    placeholder="Enter last name"
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Mobile Number"
                                icon={Images.PHONE}
                                focused={focusedField === 'MOBILE'}
                                error={touched.MOBILE && errors.MOBILE ? errors.MOBILE : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(value: string) =>
                                        setFieldValue('MOBILE', value.replace(/[^0-9]/g, ''))
                                    }
                                    onBlur={blur(handleBlur('MOBILE'))}
                                    onFocus={focus('MOBILE')}
                                    value={values.MOBILE}
                                    placeholder="Enter mobile number"
                                    keyboardType="number-pad"
                                    returnKeyType="next"
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Password"
                                icon={Images.DATA_SECURITY}
                                focused={focusedField === 'PASSWORD'}
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
                                    placeholder="Enter password"
                                    value={values.PASSWORD}
                                    onChangeText={handleChange('PASSWORD')}
                                    onBlur={blur(handleBlur('PASSWORD'))}
                                    onFocus={focus('PASSWORD')}
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Confirm Password"
                                icon={Images.DATA_SECURITY}
                                focused={focusedField === 'CONFIRM_PASSWORD'}
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
                                    placeholder="Re-enter password"
                                    value={values.CONFIRM_PASSWORD || ''}
                                    onChangeText={handleChange('CONFIRM_PASSWORD')}
                                    onBlur={blur(handleBlur('CONFIRM_PASSWORD'))}
                                    onFocus={focus('CONFIRM_PASSWORD')}
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <FieldRow
                                label="Referral Code (Optional)"
                                icon={Images.TROPHY}
                                focused={focusedField === 'REFERRAL_CODE'}
                                error={undefined}
                            >
                                <CustomTextInput
                                    value={values.REFERRAL_CODE || ''}
                                    onChangeText={(text: string) =>
                                        setFieldValue('REFERRAL_CODE', text.replace(/[^A-Za-z0-9]/g, ''))
                                    }
                                    onBlur={blur(handleBlur('REFERRAL_CODE'))}
                                    onFocus={focus('REFERRAL_CODE')}
                                    placeholder="Enter referral code"
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.footerRule}
                            />

                            <CustomButton
                                title={isLoading ? 'Please Wait...' : 'Continue'}
                                containerStyle={styles.actionButton}
                                textStyle={authStyles.buttonText}
                                disabled={isLoading}
                                loading={isLoading}
                                onPress={handleSubmit}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        </View>
                    </LinearGradient>
                )}

                {/* ── OTP verification card ── */}
                {!showRegForm && (
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
                                    <CustomText style={styles.cardTitle}>Verify OTP</CustomText>
                                    <CustomText style={styles.cardSubtitle}>
                                        Sent to +91 {values.MOBILE}
                                    </CustomText>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.headerRule}
                            />

                            <TouchableOpacity
                                onPress={() => {
                                    setRegFormVisibility(true);
                                    OtpResetForm();
                                    setFieldValue('EMAIL', generateEmail());
                                }}
                                style={styles.editNumberRow}
                            >
                                <Image source={Images.EDIT_PEN} style={styles.editPenIcon} resizeMode="contain" />
                                <CustomText style={styles.editNumberText}>Edit Number</CustomText>
                            </TouchableOpacity>

                            <FieldRow
                                label="Enter OTP"
                                icon={Images.CIRCLE_CHECK}
                                focused={focusedField === 'otp'}
                                error={OtpTouched.otp && OtpErrors.otp ? OtpErrors.otp : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) =>
                                        OtpSetFieldValue('otp', text.replace(/[^A-Za-z0-9\s]/g, ''))
                                    }
                                    onBlur={blur(OtpHandleBlur('otp'))}
                                    onFocus={focus('otp')}
                                    value={OtpValues.otp}
                                    placeholder="Enter OTP"
                                    keyboardType="number-pad"
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.footerRule}
                            />

                            <CustomButton
                                title={isLoading ? 'Please Wait...' : 'Verify OTP'}
                                containerStyle={styles.actionButton}
                                textStyle={authStyles.buttonText}
                                disabled={isLoading}
                                loading={isLoading}
                                onPress={OtpHandleSubmit}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        </View>
                    </LinearGradient>
                )}
            </KeyboardAwareScrollView>

            {/* ── iOS / Android "Done" keyboard toolbar ── */}
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

// ─── Field row: label + icon + focused-border + error ────────────────────────
type FieldRowProps = {
    label: string;
    icon: any;
    error?: string;
    focused?: boolean;
    rightSlot?: React.ReactNode;
    children: React.ReactNode;
};

const FieldRow: React.FC<FieldRowProps> = ({ label, icon, error, focused, rightSlot, children }) => (
    <View style={styles.fieldGroup}>
        <CustomText style={styles.fieldLabel}>{label}</CustomText>
        <View style={focused ? [styles.inputRow, styles.inputRowFocused] : styles.inputRow}>
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
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[400],
    },
    headerRule: {
        height: 1,
        borderRadius: 1,
        marginBottom: rh(2),
    },

    // ─── Field group ──────────────────────────────────────────────────────────────
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

    // ─── Edit number row (OTP screen) ─────────────────────────────────────────
    editNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rw(2),
        paddingVertical: rh(0.5),
        marginBottom: rh(1),
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
