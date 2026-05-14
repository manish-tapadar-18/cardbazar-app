import React, { useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

const SectionHeader = ({
  title,
  locked,
}: {
  title: string;
  locked?: boolean;
}) => (
  <View style={styles.sectionHeaderRow}>
    <View style={styles.sectionAccent} />
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
  }, []))

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
      Toast.error(error.message, { placement: 'bottom', duration: 3000 });
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
        Toast.success(message, { placement: 'bottom', duration: 3000 });
      } else {
        Toast.error(message, { placement: 'bottom', duration: 3000 });
      }
    } catch (error: any) {
      Toast.error(error.message ?? 'Something went wrong', { placement: 'bottom', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={70}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Account Details ── */}
        <View style={styles.card}>
          <SectionHeader title={t('account_details')} />
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <CustomTextInput
                value={values.FIRST_NAME}
                onChangeText={() => { }}
                placeholder="First Name"
                editable={false}
                style={{ color: Colors.WHITE }}
                focusedPlaceholderColor={Colors.GOLD}
                unfocusedPlaceholderColor={Colors.WHITE_55}
              />
            </View>
            <View style={styles.halfInput}>
              <CustomTextInput
                value={values.LAST_NAME}
                onChangeText={() => { }}
                placeholder="Last Name"
                editable={false}
                style={{ color: Colors.WHITE }}
                focusedPlaceholderColor={Colors.GOLD}
                unfocusedPlaceholderColor={Colors.WHITE_55}
              />
            </View>
          </View>

          <View style={[styles.fullInput, { marginTop: rh(1.2) }]}>
            <CustomTextInput
              value={userDetails?.MOBILE ?? ''}
              onChangeText={() => { }}
              placeholder="Mobile No."
              keyboardType="number-pad"
              editable={false}
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
        </View>

        {/* ── UPI Details ── */}
        <View style={styles.card}>
          <SectionHeader title={t('upi_id_details')} />
          <View style={styles.divider} />

          <CustomText style={styles.fieldLabel}>{t('paytm')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.PAYTM_DETAILS}
              onChangeText={(text) => setFieldValue('PAYTM_DETAILS', text)}
              onBlur={handleBlur('PAYTM_DETAILS')}
              placeholder="Enter Paytm UPI ID"
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.PAYTM_DETAILS && errors.PAYTM_DETAILS && (
            <CustomText style={styles.errorText}>{errors.PAYTM_DETAILS}</CustomText>
          )}

          <CustomText style={styles.fieldLabel}>{t('phonepe')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.PHONEPE_DETAILS}
              onChangeText={(text) => setFieldValue('PHONEPE_DETAILS', text)}
              onBlur={handleBlur('PHONEPE_DETAILS')}
              placeholder="Enter PhonePe UPI ID"
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.PHONEPE_DETAILS && errors.PHONEPE_DETAILS && (
            <CustomText style={styles.errorText}>{errors.PHONEPE_DETAILS}</CustomText>
          )}

          <CustomText style={styles.fieldLabel}>{t('gpay')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.UPI_DETAILS}
              onChangeText={(text) => setFieldValue('UPI_DETAILS', text)}
              onBlur={handleBlur('UPI_DETAILS')}
              placeholder="Enter GPay UPI ID"
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.UPI_DETAILS && errors.UPI_DETAILS && (
            <CustomText style={styles.errorText}>{errors.UPI_DETAILS}</CustomText>
          )}
        </View>

        {/* ── Bank Details ── */}
        <View style={styles.card}>
          <SectionHeader title={t('bank_details')} locked={bankDetailsLocked} />
          <View style={styles.divider} />

          <CustomText style={styles.fieldLabel}>{t('account_holder_name')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.BANK_ACCOUNT_HOLDER_NAME}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z\s]/g, '');
                setFieldValue('BANK_ACCOUNT_HOLDER_NAME', filtered);
              }}
              onBlur={handleBlur('BANK_ACCOUNT_HOLDER_NAME')}
              placeholder="Account Holder Name"
              editable={!bankDetailsLocked}
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.BANK_ACCOUNT_HOLDER_NAME && errors.BANK_ACCOUNT_HOLDER_NAME && (
            <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_HOLDER_NAME}</CustomText>
          )}

          <CustomText style={styles.fieldLabel}>{t('account_number')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.BANK_ACCOUNT_NO}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '');
                setFieldValue('BANK_ACCOUNT_NO', filtered);
              }}
              onBlur={handleBlur('BANK_ACCOUNT_NO')}
              placeholder="Account Number"
              keyboardType="number-pad"
              editable={!bankDetailsLocked}
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.BANK_ACCOUNT_NO && errors.BANK_ACCOUNT_NO && (
            <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_NO}</CustomText>
          )}

          <CustomText style={styles.fieldLabel}>{t('ifsc_code')}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.BANK_IFSC}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                setFieldValue('BANK_IFSC', filtered);
              }}
              onBlur={handleBlur('BANK_IFSC')}
              placeholder="IFSC Code"
              autoCapitalize="characters"
              editable={!bankDetailsLocked}
              style={{ color: Colors.WHITE }}
              focusedPlaceholderColor={Colors.GOLD}
              unfocusedPlaceholderColor={Colors.WHITE_55}
            />
          </View>
          {touched.BANK_IFSC && errors.BANK_IFSC && (
            <CustomText style={styles.errorText}>{errors.BANK_IFSC}</CustomText>
          )}
        </View>

        <CustomButton
          title={isLoading ? 'Please Wait...' : t('update_details')}
          containerStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
          disabled={isLoading || isFetchingDetails}
          onPress={handleSubmit}
          gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
        />
      </KeyboardAwareScrollView>

      {keyboardHeight > 0 && (
        <View style={[localStyles.keyboardToolbar, { bottom: keyboardHeight }]}>
          <TouchableOpacity onPress={Keyboard.dismiss} style={localStyles.doneButton}>
            <Text style={localStyles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
