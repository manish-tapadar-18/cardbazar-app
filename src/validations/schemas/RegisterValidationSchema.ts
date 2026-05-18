import * as Yup from "yup";
import { IRegisterFormValues } from "../interfaces";

type TFunction = (key: string, fallback?: string) => string;

export const registerValidationSchema = (t: TFunction):  Yup.ObjectSchema<IRegisterFormValues>  =>
    Yup.object({
        FIRST_NAME: Yup.string()
            .required(t("validation_first_name_required", "First name is required"))
            .matches(/^[A-Za-z\s]+$/, t("validation_only_alphabets", "Only alphabets are allowed")),

        LAST_NAME: Yup.string()
            .required(t("validation_last_name_required", "Last name is required"))
            .matches(/^[A-Za-z\s]+$/, t("validation_only_alphabets", "Only alphabets are allowed")),

        MOBILE: Yup.string()
            .required(t("validation_mobile_required", "Mobile number is required"))
            .matches(/^[0-9]+$/, t("validation_only_digits", "Only digits are allowed"))
            .length(10, t("validation_mobile_digits","Mobile number must be exactly 10 digits")),

        PASSWORD: Yup.string()
            .required(t("validation_password_required", "Password is required"))
            .min(4, t("validation_minimum_password","Minimum password length is 4")),

        CONFIRM_PASSWORD: Yup.string()
            .required(t("validation_confirm_password_required", "Confirm password is required"))
            .min(4, t("validation_minimum_password","Minimum password length is 4"))
            .oneOf([Yup.ref("PASSWORD")], t("validation_match_password","Passwords must match")),

        REFERRAL_CODE: Yup.string().transform((value) => (value === undefined ? "" : value)).default("").matches(/^[A-Za-z0-9]*$/, "Only letters and numbers are allowed"),

        EMAIL: Yup.string().required(),
    });
