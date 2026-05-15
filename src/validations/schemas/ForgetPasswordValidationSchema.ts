import * as Yup from 'yup';
import { IForgetPasswordMobileValues, IForgetPasswordOtpValues } from '../interfaces/IForgetPasswordValues';

export const ForgotMobileSchema: Yup.ObjectSchema<IForgetPasswordMobileValues> = Yup.object({
    MOBILE: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]+$/, 'Only digits are allowed')
        .length(10, 'Mobile number must be exactly 10 digits'),
});

export const ForgotOtpPasswordSchema: Yup.ObjectSchema<IForgetPasswordOtpValues> = Yup.object({
    TOKEN: Yup.string()
        .required('OTP is required')
        .matches(/^[0-9]+$/, 'Only digits are allowed')
        .min(4, 'OTP must be at least 4 digits'),
    PASSWORD: Yup.string()
        .required('New password is required')
        .min(4, 'Minimum password length is 4'),
});
