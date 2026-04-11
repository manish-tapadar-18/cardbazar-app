import React, { useState } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    Image,
    StyleSheet,
} from 'react-native';
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
import { ENV } from '../../utils/env';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { Images } from '../../utils/Images';

const Login = () => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

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

    const getUserDetails = async (email: string) => {
        const userDetailsResponse = await Repository.User.userDetails({ EMAIL: email });
        const { isSuccess, data, message } = userDetailsResponse;
        if (isSuccess && data) {
            return data;
        }
        throw new Error(message ?? 'Failed to fetch user details');
    };

    const getAdminDetails = async () => {
        const adminDetailsResponse = await Repository.User.adminDetails();
        const { isSuccess, data, message } = adminDetailsResponse;
        if (isSuccess && data) {
            return data;
        }
        throw new Error(message ?? 'Failed to fetch admin details');
    };

    const login = async (values: ILoginFormValues) => {
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={rh(30)}
        >
            <LinearGradient
                colors={['#1B0535', '#2D0A6E', '#3A0D7A']}
                style={styles.gradientBg}
            >
                {/* Decorative card watermark */}
                <Image
                    source={require('../../assets/images/spade_card.png')}
                    style={styles.watermark}
                    resizeMode="contain"
                />

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                    >
                        {/* Logo + branding */}
                        <View style={styles.brandSection}>
                            <Image
                                source={require('../../assets/logo/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            
                            <CustomText style={styles.tagline}>
                                Your Ultimate Card Gaming Platform
                            </CustomText>
                        </View>

                        {/* Form card */}
                        <View style={styles.card}>
                            <CustomText style={styles.cardTitle}>Welcome Back</CustomText>
                            <CustomText style={styles.cardSubtitle}>Sign in to continue</CustomText>

                            {/* Mobile input */}
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputRow}>
                                    <Image
                                        source={Images.PHONE}
                                        style={styles.inputIcon}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.inputFlex}>
                                        <CustomTextInput
                                            onChangeText={(value: string) => {
                                                const numericValue = value.replace(/[^0-9]/g, "");
                                                setFieldValue("EMAIL", numericValue);
                                            }}
                                            onBlur={handleBlur("EMAIL")}
                                            value={values.EMAIL}
                                            placeholder='Mobile Number'
                                            keyboardType='number-pad'
                                            returnKeyType='send'
                                            returnKeyLabel='CardBazaar'
                                            style={styles.textInput}
                                            focusedPlaceholderColor={Colors.GOLD}
                                            unfocusedPlaceholderColor={Colors.WHITE_55}
                                        />
                                    </View>
                                </View>
                                {touched.EMAIL && errors.EMAIL && (
                                    <CustomText style={authStyles.errorText}>
                                        {errors.EMAIL}
                                    </CustomText>
                                )}
                            </View>

                            {/* Password input */}
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputRow}>
                                    <Image
                                        source={Images.DATA_SECURITY}
                                        style={styles.inputIcon}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.inputFlex}>
                                        <CustomTextInput
                                            secureTextEntry={!showPassword}
                                            onChangeText={handleChange("PASSWORD")}
                                            onBlur={handleBlur("PASSWORD")}
                                            value={values.PASSWORD}
                                            placeholder='Password'
                                            style={styles.textInput}
                                            focusedPlaceholderColor={Colors.GOLD}
                                            unfocusedPlaceholderColor={Colors.WHITE_55}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(prev => !prev)}
                                        style={styles.eyeButton}
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
                                    <CustomText style={authStyles.errorText}>
                                        {errors.PASSWORD}
                                    </CustomText>
                                )}
                            </View>

                            {/* Divider */}
                            <LinearGradient
                                colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.divider}
                            />

                            <CustomButton
                                disabled={isLoading}
                                loading={isLoading}
                                title={isLoading ? 'Please Wait...' : 'Login'}
                                containerStyle={styles.loginButton}
                                textStyle={authStyles.buttonText}
                                onPress={handleSubmit}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

export default Login;

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
        right: rw(-15),
        tintColor: Colors.GOLD,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(6),
        paddingBottom: rh(5),
        justifyContent: 'center',
    },
    brandSection: {
        alignItems: 'center',
        paddingTop: rh(8),
        paddingBottom: rh(4),
    },
    logo: {
        width: rw(28),
        height: rw(28),
        marginBottom: rh(1.5),
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
        paddingVertical: rh(3.5),
        gap: rh(2),
    },
    cardTitle: {
        color: Colors.WHITE,
        fontSize: rf(6),
        fontFamily: FontFamilyWithWeight[700],
        textAlign: 'center',
    },
    cardSubtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight[400],
        textAlign: 'center',
        marginTop: -rh(1),
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
        height: rh(7),
    },
    inputIcon: {
        width: rw(5),
        height: rw(5),
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
        fontSize: rf(4),
    },
    eyeButton: {
        paddingLeft: rw(2),
    },
    eyeIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE_55,
    },
    divider: {
        height: 1,
        borderRadius: 1,
        marginVertical: rh(0.5),
    },
    loginButton: {
        height: rh(7),
        borderRadius: 12,
    },
});