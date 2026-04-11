import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useFormik } from 'formik';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import { Colors } from '../../../utils/Colors';
import { rh } from '../../../utils/responsive';
import { styles } from './styles';
import { IAccountFormValues } from '../../../validations/interfaces';
import { AccountValidationSchema } from '../../../validations/schemas/AccountValidationSchema';
import { useUserStore } from '../../../stores/userStore';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { IUserDetailsResponse } from '../../../response/module/IUserDetailsResponse';
import { useTranslation } from '../../../hooks/useTranslation';

const Account = () => {
  const { userDetails } = useUserStore();
  const scrollRef = useRef<ScrollView>(null);
  const [isFetchingDetails, setFetchingDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [bankDetailsLocked, setBankDetailsLocked] = useState(false);
  const { t } = useTranslation();
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
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => show.remove();
  }, []);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={rh(10)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account Details */}
          <CustomText style={styles.sectionTitle}>{t("account_details")}</CustomText>

          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <CustomTextInput
                value={values.FIRST_NAME}
                onChangeText={() => { }}
                placeholder="First Name"
                editable={false}
              />
            </View>
            <View style={styles.halfInput}>
              <CustomTextInput
                value={values.LAST_NAME}
                onChangeText={() => { }}
                placeholder="Last Name"
                editable={false}
              />
            </View>
          </View>

          <View style={[styles.fullInput, { marginTop: 10 }]}>
            <CustomTextInput
              value={userDetails?.MOBILE ?? ''}
              onChangeText={() => { }}
              placeholder="Mobile No."
              keyboardType="number-pad"
              editable={false}
            />
          </View>

          {/* UPI ID Details */}
          <CustomText style={styles.sectionTitle}>{t("upi_id_details")}</CustomText>

          <CustomText style={styles.upiLabel}>{t("paytm")}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.PAYTM_DETAILS}
              onChangeText={(text) => setFieldValue('PAYTM_DETAILS', text)}
              onBlur={handleBlur('PAYTM_DETAILS')}
              placeholder="Enter Paytm UPI ID"
            />
          </View>
          {touched.PAYTM_DETAILS && errors.PAYTM_DETAILS && (
            <CustomText style={styles.errorText}>{errors.PAYTM_DETAILS}</CustomText>
          )}

          <CustomText style={[styles.upiLabel, { marginTop: 10 }]}>{t("phonepe")}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.PHONEPE_DETAILS}
              onChangeText={(text) => setFieldValue('PHONEPE_DETAILS', text)}
              onBlur={handleBlur('PHONEPE_DETAILS')}
              placeholder="Enter PhonePe UPI ID"
            />
          </View>
          {touched.PHONEPE_DETAILS && errors.PHONEPE_DETAILS && (
            <CustomText style={styles.errorText}>{errors.PHONEPE_DETAILS}</CustomText>
          )}

          <CustomText style={[styles.upiLabel, { marginTop: 10 }]}>{t("gpay")}</CustomText>
          <View style={styles.fullInput}>
            <CustomTextInput
              value={values.UPI_DETAILS}
              onChangeText={(text) => setFieldValue('UPI_DETAILS', text)}
              onBlur={handleBlur('UPI_DETAILS')}
              placeholder="Enter GPay UPI ID"
            />
          </View>
          {touched.UPI_DETAILS && errors.UPI_DETAILS && (
            <CustomText style={styles.errorText}>{errors.UPI_DETAILS}</CustomText>
          )}

          {/* Bank Details */}
          <CustomText style={styles.sectionTitle}>{t("bank_details")}</CustomText>
          <CustomText style={[styles.upiLabel, { marginTop: 10 }]}>{t("account_holder_name")}</CustomText>
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
            />
          </View>
          {touched.BANK_ACCOUNT_HOLDER_NAME && errors.BANK_ACCOUNT_HOLDER_NAME && (
            <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_HOLDER_NAME}</CustomText>
          )}
          <CustomText style={[styles.upiLabel, { marginTop: 10 }]}>{t("account_number")}</CustomText>
          <View style={[styles.fullInput, { marginTop: 10 }]}>
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
            />
          </View>
          {touched.BANK_ACCOUNT_NO && errors.BANK_ACCOUNT_NO && (
            <CustomText style={styles.errorText}>{errors.BANK_ACCOUNT_NO}</CustomText>
          )}
          <CustomText style={[styles.upiLabel, { marginTop: 10 }]}>{t("ifsc_code")}</CustomText>
          <View style={[styles.fullInput, { marginTop: 10 }]}>
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
            />
          </View>
          {touched.BANK_IFSC && errors.BANK_IFSC && (
            <CustomText style={styles.errorText}>{errors.BANK_IFSC}</CustomText>
          )}

          <CustomButton
            title={isLoading ? 'Please Wait...' : t("update_details")}
            containerStyle={styles.buttonContainer}
            textStyle={styles.buttonText}
            disabled={isLoading || isFetchingDetails}
            onPress={handleSubmit}
            gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Account;
