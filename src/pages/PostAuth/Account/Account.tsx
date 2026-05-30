import React, { useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ImageBackground,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import { useFormik } from 'formik';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { styles } from './styles';
import { IAccountFormValues } from '../../../validations/interfaces';
import { AccountValidationSchema } from '../../../validations/schemas/AccountValidationSchema';
import { useUserStore } from '../../../stores/userStore';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { IUserDetailsResponse } from '../../../response/module/IUserDetailsResponse';
import { useTranslation } from '../../../hooks/useTranslation';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import { useFocusEffect } from '@react-navigation/native';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';
import { Images } from '../../../utils/Images';

const CARD_GRADIENT: string[] = [
  'rgba(255,215,0,0.45)',
  'rgba(255,255,255,0.05)',
  'rgba(255,215,0,0.45)',
];
const RULE_GRADIENT: string[] = [
  'transparent',
  Colors.GOLD,
  Colors.ORANGE,
  Colors.GOLD,
  'transparent',
];

const GradientRule = () => (
  <LinearGradient
    colors={RULE_GRADIENT}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.gradientRule}
  />
);

const SectionHeader = ({
  title,
  locked,
}: {
  title: string;
  locked?: boolean;
}) => (
  <View style={styles.sectionHeaderRow}>
    <LinearGradient
      colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.sectionAccent}
    />
    <CustomText style={styles.sectionTitle}>{title}</CustomText>
    {locked && (
      <View style={styles.lockedBadge}>
        <CustomText style={styles.lockedBadgeText}>🔒 Locked</CustomText>
      </View>
    )}
  </View>
);

const Account = () => {
  const { userDetails } = useUserStore();
  const [isFetchingDetails, setFetchingDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [bankDetailsLocked, setBankDetailsLocked] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { t } = useTranslation();
  const { setAdminDetails } = useAdminDetailsStore();
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useFormik<IAccountFormValues>({
    initialValues: {
      FIRST_NAME: userDetails?.FIRST_NAME ?? '',
      LAST_NAME: userDetails?.LAST_NAME ?? '',
      PAYTM_DETAILS: '',
      PHONEPE_DETAILS: '',
      UPI_DETAILS: '',
      BANK_ACCOUNT_HOLDER_NAME: '',
      BANK_ACCOUNT_NO: '',
      BANK_IFSC: '',
    },
    validationSchema: AccountValidationSchema,
    validateOnMount: false,
    onSubmit: (formValues) => {
      updateAccount(formValues);
    },
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useFocusEffect(React.useCallback(() => {
    const fetchAdminDetails = async () => {
      const { isSuccess, data } = await Repository.User.adminDetails();
      if (isSuccess && data != null) setAdminDetails(data);
    };
    fetchAdminDetails();
    fetchUserDetails();
  }, []));

  const fetchUserDetails = async () => {
    if (!userDetails?.EMAIL) return;
    try {
      setFetchingDetails(true);
      const response = await Repository.User.userDetails({ EMAIL: userDetails.EMAIL });
      const { isSuccess, data } = response;
      if (isSuccess && data) {
        prefillForm(data);
      }
    } catch (error: any) {
      Toast.error(error.message, { placement: 'center', duration: 3000 });
    } finally {
      setFetchingDetails(false);
    }
  };

  const prefillForm = (data: IUserDetailsResponse) => {
    const hasBankDetails =
      !!data.BANK_ACCOUNT_HOLDER_NAME &&
      !!data.BANK_ACCOUNT_NO &&
      !!data.BANK_IFSC;

    setBankDetailsLocked(hasBankDetails);

    setValues({
      FIRST_NAME: data.FIRST_NAME ?? '',
      LAST_NAME: data.LAST_NAME ?? '',
      PAYTM_DETAILS: data.PAYTM_DETAILS ?? '',
      PHONEPE_DETAILS: data.PHONEPE_DETAILS ?? '',
      UPI_DETAILS: data.UPI_DETAILS ?? '',
      BANK_ACCOUNT_HOLDER_NAME: data.BANK_ACCOUNT_HOLDER_NAME ?? '',
      BANK_ACCOUNT_NO: data.BANK_ACCOUNT_NO ?? '',
      BANK_IFSC: data.BANK_IFSC ?? '',
    });
  };

  const updateAccount = async (formValues: IAccountFormValues) => {
    try {
      setLoading(true);
      const response = await Repository.Game.updateProfile({
        ID: userDetails?.ID ?? '',
        FIRST_NAME: formValues.FIRST_NAME,
        LAST_NAME: formValues.LAST_NAME,
        MOBILE: userDetails?.MOBILE ?? '',
        PAYTM_DETAILS: formValues.PAYTM_DETAILS,
        PHONEPE_DETAILS: formValues.PHONEPE_DETAILS,
        UPI_DETAILS: formValues.UPI_DETAILS,
        BANK_DETAILS: '',
        BANK_ACCOUNT_HOLDER_NAME: formValues.BANK_ACCOUNT_HOLDER_NAME,
        BANK_ACCOUNT_NO: formValues.BANK_ACCOUNT_NO,
        BANK_IFSC: formValues.BANK_IFSC,
      });
      const { isSuccess, message } = response;
      if (isSuccess) {
        Toast.success(message, { placement: 'center', duration: 3000 });
      } else {
        Toast.error(message, { placement: 'center', duration: 3000 });
      }
    } catch (error: any) {
      Toast.error(error.message ?? 'Something went wrong', { placement: 'center', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const iRow = (field: string) =>
    focusedField === field
      ? [styles.inputRow, styles.inputRowFocused]
      : styles.inputRow;

  const bankRow = bankDetailsLocked
    ? [styles.inputRow, styles.inputRowLocked]
    : undefined;

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={{ flex: 1, backgroundColor: Colors.DEEP_PURPLE }}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={70}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Account Details ── */}
        <LinearGradient
          colors={['#260030', '#44004F' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.cardInner}>
            <SectionHeader title={t('account_details')} />
            <GradientRule />

            <View style={styles.nameRow}>
              <View style={styles.halfFieldGroup}>
                <CustomText style={styles.fieldLabel}>First Name</CustomText>
                <View style={[styles.inputRow, styles.inputRowLocked]}>
                  <CustomTextInput
                    value={values.FIRST_NAME}
                    onChangeText={() => {}}
                    placeholder="First Name"
                    editable={false}
                    style={styles.textInput}
                    focusedPlaceholderColor={Colors.GOLD}
                    unfocusedPlaceholderColor={Colors.WHITE_55}
                  />
                </View>
              </View>
              <View style={styles.halfFieldGroup}>
                <CustomText style={styles.fieldLabel}>Last Name</CustomText>
                <View style={[styles.inputRow, styles.inputRowLocked]}>
                  <CustomTextInput
                    value={values.LAST_NAME}
                    onChangeText={() => {}}
                    placeholder="Last Name"
                    editable={false}
                    style={styles.textInput}
                    focusedPlaceholderColor={Colors.GOLD}
                    unfocusedPlaceholderColor={Colors.WHITE_55}
                  />
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>Mobile No.</CustomText>
              <View style={[styles.inputRow, styles.inputRowLocked]}>
                <CustomTextInput
                  value={userDetails?.MOBILE ?? ''}
                  onChangeText={() => {}}
                  placeholder="Mobile No."
                  keyboardType="number-pad"
                  editable={false}
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── UPI Details ── */}
        <LinearGradient
          colors={['#260030', '#44004F' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.cardInner}>
            <SectionHeader title={t('upi_id_details')} />
            <GradientRule />

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('paytm')}</CustomText>
              <View style={iRow('PAYTM_DETAILS')}>
                <CustomTextInput
                  value={values.PAYTM_DETAILS}
                  onChangeText={(text) => setFieldValue('PAYTM_DETAILS', text)}
                  onBlur={(e) => { handleBlur('PAYTM_DETAILS')(e); setFocusedField(null); }}
                  onFocus={() => setFocusedField('PAYTM_DETAILS')}
                  placeholder="Enter Paytm UPI ID"
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.PAYTM_DETAILS && errors.PAYTM_DETAILS && (
                <CustomText style={styles.errorText}>{errors.PAYTM_DETAILS}</CustomText>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('phonepe')}</CustomText>
              <View style={iRow('PHONEPE_DETAILS')}>
                <CustomTextInput
                  value={values.PHONEPE_DETAILS}
                  onChangeText={(text) => setFieldValue('PHONEPE_DETAILS', text)}
                  onBlur={(e) => { handleBlur('PHONEPE_DETAILS')(e); setFocusedField(null); }}
                  onFocus={() => setFocusedField('PHONEPE_DETAILS')}
                  placeholder="Enter PhonePe UPI ID"
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.PHONEPE_DETAILS && errors.PHONEPE_DETAILS && (
                <CustomText style={styles.errorText}>{errors.PHONEPE_DETAILS}</CustomText>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('gpay')}</CustomText>
              <View style={iRow('UPI_DETAILS')}>
                <CustomTextInput
                  value={values.UPI_DETAILS}
                  onChangeText={(text) => setFieldValue('UPI_DETAILS', text)}
                  onBlur={(e) => { handleBlur('UPI_DETAILS')(e); setFocusedField(null); }}
                  onFocus={() => setFocusedField('UPI_DETAILS')}
                  placeholder="Enter GPay UPI ID"
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.UPI_DETAILS && errors.UPI_DETAILS && (
                <CustomText style={styles.errorText}>{errors.UPI_DETAILS}</CustomText>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── Bank Details ── */}
        <LinearGradient
          colors={['#260030', '#44004F' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.cardInner}>
            <SectionHeader title={t('bank_details')} locked={bankDetailsLocked} />
            <GradientRule />

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('account_holder_name')}</CustomText>
              <View style={bankRow ?? iRow('BANK_ACCOUNT_HOLDER_NAME')}>
                <CustomTextInput
                  value={values.BANK_ACCOUNT_HOLDER_NAME}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-z\s]/g, '');
                    setFieldValue('BANK_ACCOUNT_HOLDER_NAME', filtered);
                  }}
                  onBlur={(e) => { handleBlur('BANK_ACCOUNT_HOLDER_NAME')(e); setFocusedField(null); }}
                  onFocus={() => { if (!bankDetailsLocked) setFocusedField('BANK_ACCOUNT_HOLDER_NAME'); }}
                  placeholder="Account Holder Name"
                  editable={!bankDetailsLocked}
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.BANK_ACCOUNT_HOLDER_NAME && errors.BANK_ACCOUNT_HOLDER_NAME && (
                <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_HOLDER_NAME}</CustomText>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('account_number')}</CustomText>
              <View style={bankRow ?? iRow('BANK_ACCOUNT_NO')}>
                <CustomTextInput
                  value={values.BANK_ACCOUNT_NO}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, '');
                    setFieldValue('BANK_ACCOUNT_NO', filtered);
                  }}
                  onBlur={(e) => { handleBlur('BANK_ACCOUNT_NO')(e); setFocusedField(null); }}
                  onFocus={() => { if (!bankDetailsLocked) setFocusedField('BANK_ACCOUNT_NO'); }}
                  placeholder="Account Number"
                  keyboardType="number-pad"
                  editable={!bankDetailsLocked}
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.BANK_ACCOUNT_NO && errors.BANK_ACCOUNT_NO && (
                <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_NO}</CustomText>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>{t('ifsc_code')}</CustomText>
              <View style={bankRow ?? iRow('BANK_IFSC')}>
                <CustomTextInput
                  value={values.BANK_IFSC}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                    setFieldValue('BANK_IFSC', filtered);
                  }}
                  onBlur={(e) => { handleBlur('BANK_IFSC')(e); setFocusedField(null); }}
                  onFocus={() => { if (!bankDetailsLocked) setFocusedField('BANK_IFSC'); }}
                  placeholder="IFSC Code"
                  autoCapitalize="characters"
                  editable={!bankDetailsLocked}
                  style={styles.textInput}
                  focusedPlaceholderColor={Colors.GOLD}
                  unfocusedPlaceholderColor={Colors.WHITE_55}
                />
              </View>
              {touched.BANK_IFSC && errors.BANK_IFSC && (
                <CustomText style={styles.errorText}>{errors.BANK_IFSC}</CustomText>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* <LinearGradient
          colors={RULE_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.footerRule}
        /> */}

        <CustomButton
          title={isLoading ? 'Please Wait...' : t('update_details')}
          containerStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
          disabled={isLoading || isFetchingDetails}
          onPress={handleSubmit}
          gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
        />
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default Account;

const localStyles = StyleSheet.create({
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
