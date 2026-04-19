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

const Register = () => {

    const generateEmail = () => {
        return `${new Date().getTime()}${Math.floor(1000 + Math.random() * 9000)}@cardBazaar.com`;
    };

    const [isLoading, setLoading] = useState(false);
    const [showRegForm, setRegFormVisibility] = useState<boolean>(true);
    const [otp, setOtp] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
    } = useFormik<IVerifyOtpValues>({
        initialValues: {
            otp: "",
        },
        validationSchema: VerifyOtpValidationSchema,
        validateOnMount: false,
        onSubmit: (values) => {
            verifyOtp(values.otp);
        },
    });

    const sendOTP = async (MOBILE: string) => {
        try {
            setLoading(true);
            const response = await Repository.Auth.sendOtp({ MOBILE });
            const { isSuccess, data, message } = response;
            if (isSuccess && data) {
                setRegFormVisibility(false);
                setOtp(data.OTP);
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
                let loginResponse = await Repository.Auth.login({ EMAIL: payload.EMAIL, PASSWORD: payload.PASSWORD });
                const { isSuccess, message } = loginResponse;
                if (isSuccess) {
                    Toast.success(message);
                }
            } else {
                Toast.error(message);
            }
        } catch (error: any) {
            Toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = (userOTP: string) => {
        if (userOTP == otp) {
            registerUser();
        } else {
            Toast.error("Invalid Otp");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#1B0535' }}>
            <LinearGradient
                colors={['#1B0535', '#2D0A6E', '#3A0D7A']}
                style={styles.gradientBg}
            >
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
                    {/* Branding */}
                    <View style={styles.brandSection}>
                        <Image
                            source={require('../../assets/logo/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <CustomText style={styles.appTitle}>
                            {showRegForm ? 'Create Account' : 'Verify OTP'}
                        </CustomText>
                        <CustomText style={styles.tagline}>
                            {showRegForm
                                ? 'Join the ultimate card gaming platform'
                                : `OTP sent to +91 ${values.MOBILE}`}
                        </CustomText>
                    </View>

                    {/* Registration form */}
                    {showRegForm && (
                        <View style={styles.card}>
                            {/* First Name */}
                            <FieldRow
                                icon={Images.USERS}
                                error={touched.FIRST_NAME && errors.FIRST_NAME ? errors.FIRST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) => {
                                        setFieldValue("FIRST_NAME", text.replace(/[^A-Za-z\s]/g, ""));
                                    }}
                                    onBlur={handleBlur("FIRST_NAME")}
                                    value={values.FIRST_NAME}
                                    placeholder='First Name'
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            {/* Last Name */}
                            <FieldRow
                                icon={Images.USERS}
                                error={touched.LAST_NAME && errors.LAST_NAME ? errors.LAST_NAME : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) => {
                                        setFieldValue("LAST_NAME", text.replace(/[^A-Za-z\s]/g, ""));
                                    }}
                                    onBlur={handleBlur("LAST_NAME")}
                                    value={values.LAST_NAME}
                                    placeholder='Last Name'
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            {/* Mobile */}
                            <FieldRow
                                icon={Images.PHONE}
                                error={touched.MOBILE && errors.MOBILE ? errors.MOBILE : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(value: string) => {
                                        setFieldValue("MOBILE", value.replace(/[^0-9]/g, ""));
                                    }}
                                    onBlur={handleBlur("MOBILE")}
                                    value={values.MOBILE}
                                    placeholder='Mobile Number'
                                    keyboardType='number-pad'
                                    returnKeyType='send'
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            {/* Password */}
                            <FieldRow
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
                                    placeholder='Password'
                                    value={values.PASSWORD}
                                    onChangeText={handleChange("PASSWORD")}
                                    onBlur={handleBlur("PASSWORD")}
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            {/* Confirm Password */}
                            <FieldRow
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
                                    placeholder='Confirm Password'
                                    value={values.CONFIRM_PASSWORD || ""}
                                    onChangeText={handleChange("CONFIRM_PASSWORD")}
                                    onBlur={handleBlur("CONFIRM_PASSWORD")}
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            {/* Referral Code */}
                            <FieldRow
                                icon={Images.TROPHY}
                                error={undefined}
                            >
                                <CustomTextInput
                                    value={values.REFERRAL_CODE || ""}
                                    onChangeText={(text: string) => {
                                        setFieldValue("REFERRAL_CODE", text.replace(/[^A-Za-z0-9]/g, ""));
                                    }}
                                    onBlur={handleBlur("REFERRAL_CODE")}
                                    placeholder='Referral Code (Optional)'
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.divider}
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

                    {/* OTP form */}
                    {!showRegForm && (
                        <View style={styles.card}>
                            <TouchableOpacity
                                onPress={() => setRegFormVisibility(true)}
                                style={styles.editNumberRow}
                            >
                                <Image source={Images.EDIT_PEN} style={styles.editPenIcon} resizeMode="contain" />
                                <CustomText style={styles.editNumberText}>Edit Number</CustomText>
                            </TouchableOpacity>

                            <FieldRow
                                icon={Images.CIRCLE_CHECK}
                                error={OtpTouched.otp && OtpErrors.otp ? OtpErrors.otp : undefined}
                            >
                                <CustomTextInput
                                    onChangeText={(text: string) => {
                                        OtpSetFieldValue("otp", text.replace(/[^A-Za-z0-9\s]/g, ""));
                                    }}
                                    onBlur={OtpHandleBlur("otp")}
                                    value={OtpValues.otp}
                                    placeholder='Enter OTP'
                                    keyboardType='number-pad'
                                    returnKeyLabel='CardBazaar'
                                    style={styles.textInput}
                                    focusedPlaceholderColor={Colors.GOLD}
                                    unfocusedPlaceholderColor={Colors.WHITE_55}
                                />
                            </FieldRow>

                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.divider}
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

// ─── Reusable field row ───────────────────────────────────────────────────────
type FieldRowProps = {
    icon: any;
    error?: string;
    rightSlot?: React.ReactNode;
    children: React.ReactNode;
};

const FieldRow: React.FC<FieldRowProps> = ({ icon, error, rightSlot, children }) => (
    <View style={styles.inputWrapper}>
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
    gradientBg: {
        flex: 1,
    },
    watermark: {
        position: 'absolute',
        width: rw(80),
        height: rw(80),
        opacity: 0.04,
        bottom: rh(-5),
        left: rw(-15),
        tintColor: Colors.GOLD,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(6),
        paddingBottom: rh(5),
    },
    brandSection: {
        alignItems: 'center',
        paddingTop: rh(5),
        paddingBottom: rh(3),
    },
    logo: {
        width: rw(22),
        height: rw(22),
        marginBottom: rh(1),
    },
    appTitle: {
        color: Colors.GOLD,
        fontSize: rf(7.5),
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1,
    },
    tagline: {
        color: Colors.WHITE_55,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        marginTop: rh(0.5),
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: rw(6),
        paddingVertical: rh(3),
        gap: rh(1.8),
    },
    inputWrapper: {
        gap: rh(2),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: rw(3),
        height: rh(6.5),
    },
    inputIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: Colors.GOLD,
        marginRight: rw(2),
        opacity: 0.85,
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
    },
    eyeIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE_55,
        marginLeft: rw(2),
    },
    divider: {
        height: 1,
        borderRadius: 1,
        marginVertical: rh(0.4),
    },
    actionButton: {
        height: rh(7),
        borderRadius: 12,
    },
    editNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: rh(0.5),
    },
    editPenIcon: {
        width: rw(4),
        height: rw(4),
        tintColor: Colors.GOLD,
    },
    editNumberText: {
        color: Colors.GOLD,
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[600],
    },
    keyboardToolbar: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#2D0A6E',
        paddingHorizontal: rw(4),
        paddingVertical: rh(1),
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
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
