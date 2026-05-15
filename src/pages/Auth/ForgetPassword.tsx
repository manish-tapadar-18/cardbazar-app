import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import ConfirmModal from '../../components/ConfirmModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';
import CustomTextInput from '../../components/CustomTextInput';
import CustomText from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import { Colors } from '../../utils/Colors';
import { Images } from '../../utils/Images';
import { rf, rh, rw } from '../../utils/responsive';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import { styles as authStyles } from './styles';
import { AuthStackParamList } from '../../types/NavigationStack';
import { Repository } from '../../repository/Repository';
import { Toast } from '../../utils/toast';
import { ForgotMobileSchema, ForgotOtpPasswordSchema } from '../../validations/schemas/ForgetPasswordValidationSchema';
import { IForgetPasswordMobileValues, IForgetPasswordOtpValues } from '../../validations/interfaces/IForgetPasswordValues';

const RESEND_COOLDOWN = 30;

const ForgetPassword = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

    const [phase, setPhase] = useState<'mobile' | 'otp'>('mobile');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<'MOBILE' | 'TOKEN' | 'PASSWORD' | null>(null);
    const [sendOtpModalVisible, setSendOtpModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const mobileForm = useFormik<IForgetPasswordMobileValues>({
        initialValues: { MOBILE: '' },
        validationSchema: ForgotMobileSchema,
        validateOnMount: false,
        onSubmit: (vals) => confirmAndSendOtp(vals.MOBILE),
    });

    const otpForm = useFormik<IForgetPasswordOtpValues>({
        initialValues: { TOKEN: '', PASSWORD: '' },
        validationSchema: ForgotOtpPasswordSchema,
        validateOnMount: false,
        onSubmit: (vals) => submitNewPassword(vals),
    });

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const startCooldown = () => {
        setResendCooldown(RESEND_COOLDOWN);
        cooldownRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    cooldownRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const callSendOtp = async (mobile: string) => {
        setIsLoading(true);
        try {
            const { isSuccess, message } = await Repository.Auth.sendOtp({ MOBILE: mobile });
            if (!isSuccess) {
                Toast.error(`Error: ${message}`, { placement: 'bottom', duration: 3000 });
                return;
            }
            setPhase('otp');
            startCooldown();
        } catch {
            Toast.error('Failed to send OTP. Please try again.', { placement: 'bottom', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAndSendOtp = (_mobile: string) => {
        setSendOtpModalVisible(true);
    };

    const handleResend = () => {
        callSendOtp(mobileForm.values.MOBILE);
    };

    const submitNewPassword = async (vals: IForgetPasswordOtpValues) => {
        setIsLoading(true);
        try {
            const { isSuccess, message } = await Repository.Auth.updatePasswordWithOtp({
                MOBILE: mobileForm.values.MOBILE,
                TOKEN: vals.TOKEN,
                PASSWORD: vals.PASSWORD,
            });
            if (!isSuccess) {
                Toast.error(`Error: ${message}`, { placement: 'bottom', duration: 3000 });
                return;
            }
            Toast.success(message || 'Password changed successfully!', { placement: 'bottom', duration: 3000 });
            navigation.navigate('Authentication');
        } catch {
            Toast.error('Failed to update password. Please try again.', { placement: 'bottom', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditNumber = () => {
        setEditModalVisible(true);
    };

    const confirmEditNumber = () => {
        setEditModalVisible(false);
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
        }
        setPhase('mobile');
        setResendCooldown(0);
        otpForm.resetForm();
    };

    const mobileFocused = focusedField === 'MOBILE';
    const otpFocused = focusedField === 'TOKEN';
    const passFocused = focusedField === 'PASSWORD';

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#07010F', '#110226', '#1B0535', '#25095E', '#1B0535', '#0D0120']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Back button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Image source={Images.LEFT_ARROW} style={styles.backIcon} resizeMode="contain" />
            </TouchableOpacity>

            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={70}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
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
                                <CustomText style={styles.cardTitle}>
                                    {phase === 'mobile' ? 'Forgot Password' : 'Reset Password'}
                                </CustomText>
                                <CustomText style={styles.cardSubtitle}>
                                    {phase === 'mobile'
                                        ? 'Enter your mobile number'
                                        : 'Enter OTP & new password'}
                                </CustomText>
                            </View>
                        </View>

                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerRule}
                        />

                        {/* ── Mobile field ── */}
                        <View style={styles.fieldGroup}>
                            <CustomText style={styles.fieldLabel}>Mobile Number</CustomText>
                            <View style={[
                                styles.inputRow,
                                mobileFocused && phase === 'mobile' && styles.inputRowFocused,
                                phase === 'otp' && styles.inputRowDisabled,
                            ]}>
                                <Image source={Images.PHONE} style={styles.inputIcon} resizeMode="contain" />
                                <View style={styles.inputFlex}>
                                    <CustomTextInput
                                        value={mobileForm.values.MOBILE}
                                        onChangeText={(val) =>
                                            mobileForm.setFieldValue('MOBILE', val.replace(/[^0-9]/g, ''))
                                        }
                                        onBlur={(e) => { mobileForm.handleBlur('MOBILE')(e); setFocusedField(null); }}
                                        onFocus={() => setFocusedField('MOBILE')}
                                        placeholder="Enter mobile number"
                                        keyboardType="number-pad"
                                        returnKeyType="done"
                                        editable={phase === 'mobile' && !isLoading}
                                        style={[styles.textInput, phase === 'otp' && styles.textInputDisabled]}
                                        focusedPlaceholderColor={Colors.GOLD}
                                        unfocusedPlaceholderColor={Colors.WHITE_55}
                                        maxLength={10}
                                    />
                                </View>
                                {phase === 'otp' && (
                                    <TouchableOpacity
                                        onPress={handleEditNumber}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        disabled={isLoading}
                                    >
                                        <Image source={Images.EDIT_PEN} style={styles.editIcon} resizeMode="contain" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {mobileForm.touched.MOBILE && mobileForm.errors.MOBILE && (
                                <CustomText style={authStyles.errorText}>{mobileForm.errors.MOBILE}</CustomText>
                            )}
                        </View>

                        {/* ── OTP phase fields ── */}
                        {phase === 'otp' && (
                            <>
                                {/* OTP field */}
                                <View style={styles.fieldGroup}>
                                    <CustomText style={styles.fieldLabel}>OTP</CustomText>
                                    <View style={otpFocused ? [styles.inputRow, styles.inputRowFocused] : styles.inputRow}>
                                        <Image source={Images.LOCK} style={styles.inputIcon} resizeMode="contain" />
                                        <View style={styles.inputFlex}>
                                            <CustomTextInput
                                                value={otpForm.values.TOKEN}
                                                onChangeText={(val) =>
                                                    otpForm.setFieldValue('TOKEN', val.replace(/[^0-9]/g, ''))
                                                }
                                                onBlur={(e) => { otpForm.handleBlur('TOKEN')(e); setFocusedField(null); }}
                                                onFocus={() => setFocusedField('TOKEN')}
                                                placeholder="Enter OTP"
                                                keyboardType="number-pad"
                                                returnKeyType="next"
                                                editable={!isLoading}
                                                style={styles.textInput}
                                                focusedPlaceholderColor={Colors.GOLD}
                                                unfocusedPlaceholderColor={Colors.WHITE_55}
                                            />
                                        </View>
                                    </View>
                                    {otpForm.touched.TOKEN && otpForm.errors.TOKEN && (
                                        <CustomText style={authStyles.errorText}>{otpForm.errors.TOKEN}</CustomText>
                                    )}
                                </View>

                                {/* New Password field */}
                                <View style={styles.fieldGroup}>
                                    <CustomText style={styles.fieldLabel}>New Password</CustomText>
                                    <View style={passFocused ? [styles.inputRow, styles.inputRowFocused] : styles.inputRow}>
                                        <Image source={Images.DATA_SECURITY} style={styles.inputIcon} resizeMode="contain" />
                                        <View style={styles.inputFlex}>
                                            <CustomTextInput
                                                value={otpForm.values.PASSWORD}
                                                onChangeText={otpForm.handleChange('PASSWORD')}
                                                onBlur={(e) => { otpForm.handleBlur('PASSWORD')(e); setFocusedField(null); }}
                                                onFocus={() => setFocusedField('PASSWORD')}
                                                placeholder="Enter new password"
                                                secureTextEntry={!showPassword}
                                                returnKeyType="done"
                                                editable={!isLoading}
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
                                    {otpForm.touched.PASSWORD && otpForm.errors.PASSWORD && (
                                        <CustomText style={authStyles.errorText}>{otpForm.errors.PASSWORD}</CustomText>
                                    )}
                                </View>
                            </>
                        )}

                        <LinearGradient
                            colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.footerRule}
                        />

                        {/* ── Primary CTA ── */}
                        {phase === 'mobile' ? (
                            <CustomButton
                                disabled={isLoading}
                                loading={isLoading}
                                title={isLoading ? 'Sending...' : 'Send OTP'}
                                containerStyle={styles.actionButton}
                                textStyle={authStyles.buttonText}
                                onPress={() => mobileForm.handleSubmit()}
                                gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                            />
                        ) : (
                            <>
                                <CustomButton
                                    disabled={isLoading}
                                    loading={isLoading}
                                    title={isLoading ? 'Please Wait...' : 'Submit'}
                                    containerStyle={styles.actionButton}
                                    textStyle={authStyles.buttonText}
                                    onPress={() => otpForm.handleSubmit()}
                                    gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                                />

                                {/* Resend OTP */}
                                <TouchableOpacity
                                    onPress={handleResend}
                                    disabled={resendCooldown > 0 || isLoading}
                                    style={styles.resendBtn}
                                >
                                    <CustomText
                                        style={(resendCooldown > 0 || isLoading)
                                            ? [styles.resendText, styles.resendTextDisabled]
                                            : styles.resendText
                                        }
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                    </CustomText>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </KeyboardAwareScrollView>

            {/* Send OTP confirmation modal */}
            <ConfirmModal
                visible={sendOtpModalVisible}
                title="Send OTP?"
                message={`An OTP will be sent to\n${mobileForm.values.MOBILE}`}
                iconEmoji="📱"
                confirmText="Send"
                cancelText="Cancel"
                onConfirm={() => {
                    setSendOtpModalVisible(false);
                    callSendOtp(mobileForm.values.MOBILE);
                }}
                onCancel={() => setSendOtpModalVisible(false)}
            />

            {/* Edit mobile number confirmation modal */}
            <ConfirmModal
                visible={editModalVisible}
                title="Edit Number?"
                message="Changing the mobile number will reset the entire form and clear the OTP."
                iconEmoji="✏️"
                confirmText="Edit"
                cancelText="Cancel"
                onConfirm={confirmEditNumber}
                onCancel={() => setEditModalVisible(false)}
            />
        </View>
    );
};

export default ForgetPassword;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    backBtn: {
        position: 'absolute',
        top: rh(6),
        left: rw(4),
        zIndex: 10,
    },
    backIcon: {
        width: rw(6),
        height: rw(6),
        tintColor: Colors.GOLD,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: rw(5),
        paddingTop: rh(12),
        paddingBottom: rh(4),
        justifyContent: 'center',
    },

    // ─── Card ────────────────────────────────────────────────────────────────────
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
        marginBottom: rh(2.2),
    },

    // ─── Field ───────────────────────────────────────────────────────────────────
    fieldGroup: {
        marginBottom: rh(2),
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
    inputRowDisabled: {
        opacity: 0.55,
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
    textInputDisabled: {
        color: Colors.WHITE_55,
    },
    editIcon: {
        width: rw(4.5),
        height: rw(4.5),
        tintColor: Colors.GOLD,
        marginLeft: rw(2),
    },
    eyeIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE_55,
        marginLeft: rw(2),
    },

    // ─── Footer ──────────────────────────────────────────────────────────────────
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
    resendBtn: {
        alignSelf: 'center',
        marginTop: rh(1.8),
    },
    resendText: {
        color: Colors.GOLD,
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight[500],
    },
    resendTextDisabled: {
        color: Colors.WHITE_55,
    },
});
