import * as Yup from "yup";
import { IRegisterFormValues } from "../interfaces";
export const RegisterValidationSchema: Yup.ObjectSchema<IRegisterFormValues>  =
    Yup.object({
        FIRST_NAME: Yup.string()
            .required("First name is required")
            .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),

        LAST_NAME: Yup.string()
            .required("Last name is required")
            .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),

        MOBILE: Yup.string()
            .required("Mobile number is required")
            .matches(/^[0-9]+$/, "Only digits are allowed")
            .length(10, "Mobile number must be exactly 10 digits"),

        PASSWORD: Yup.string()
            .required("Password is required")
            .min(4, "Minimum password length is 4"),

        CONFIRM_PASSWORD: Yup.string()
            .required("Confirm password is required")
            .min(4, "Minimum password length is 4")
            .oneOf([Yup.ref("PASSWORD")], "Passwords must match"),

        REFERRAL_CODE: Yup.string().transform((value) => (value === undefined ? "" : value)).default("").matches(/^[A-Za-z0-9]*$/, "Only letters and numbers are allowed"),

        EMAIL: Yup.string().required(),
    });
