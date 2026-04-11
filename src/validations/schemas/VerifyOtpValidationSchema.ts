import * as Yup from "yup";

import { IVerifyOtpValues } from "../interfaces";

export const VerifyOtpValidationSchema: Yup.ObjectSchema<IVerifyOtpValues> =
    Yup.object({
        otp: Yup.string().required("Otp is required").matches(/^[0-9]+$/, "Only digits are allowed"),
    });