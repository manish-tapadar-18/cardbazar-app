import * as Yup from "yup";
import { ILoginFormValues } from "../interfaces";

export const LoginValidationSchema: Yup.ObjectSchema<ILoginFormValues> =
    Yup.object({
        EMAIL: Yup.string()
            .required("Mobile number is required")
            .matches(/^[0-9]+$/, "Only digits are allowed")
            .length(10, "Mobile number must be exactly 10 digits"),

        PASSWORD: Yup.string()
            .required("Password is required")
            .min(4, "Minimum password length is 4"),
    });