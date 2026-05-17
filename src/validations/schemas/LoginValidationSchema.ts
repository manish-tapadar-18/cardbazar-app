import * as Yup from "yup";
import { ILoginFormValues } from "../interfaces";

type TFunction = (key: string, fallback?: string) => string;

export const createLoginValidationSchema = (t: TFunction): Yup.ObjectSchema<ILoginFormValues> =>
    Yup.object({
        EMAIL: Yup.string()
            .required(t("validation_mobile_required", "Mobile number is required"))
            .matches(/^[0-9]+$/, t("validation_mobile_digits_only", "Only digits are allowed"))
            .length(10, t("validation_mobile_length", "Mobile number must be exactly 10 digits")),

        PASSWORD: Yup.string()
            .required(t("validation_password_required", "Password is required"))
            .min(4, t("validation_password_min_length", "Minimum password length is 4")),
    });
