import * as Yup from "yup";
import { IAccountFormValues } from "../interfaces";

export const AccountValidationSchema: Yup.ObjectSchema<IAccountFormValues> = Yup.object({
    FIRST_NAME: Yup.string().required("First name is required"),

    LAST_NAME: Yup.string().required("Last name is required"),

    PAYTM_DETAILS: Yup.string().default(""),

    PHONEPE_DETAILS: Yup.string().default(""),

    UPI_DETAILS: Yup.string().default(""),

    BANK_ACCOUNT_HOLDER_NAME: Yup.string()
        .default("")
        .test("bank-holder-required", "Account holder name is required", function (value) {
            const { BANK_ACCOUNT_NO, BANK_IFSC } = this.parent;
            if (!!BANK_ACCOUNT_NO || !!BANK_IFSC) {
                if (!value) return false;
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    return this.createError({ message: "Only alphabets are allowed" });
                }
            }
            return true;
        }),

    BANK_ACCOUNT_NO: Yup.string()
        .default("")
        .test("bank-account-required", "Account number is required", function (value) {
            const { BANK_ACCOUNT_HOLDER_NAME, BANK_IFSC } = this.parent;
            if (!!BANK_ACCOUNT_HOLDER_NAME || !!BANK_IFSC) {
                if (!value) return false;
                if (!/^[0-9]+$/.test(value)) {
                    return this.createError({ message: "Only digits are allowed" });
                }
                if (value.length < 9) {
                    return this.createError({ message: "Account number must be at least 9 digits" });
                }
                if (value.length > 18) {
                    return this.createError({ message: "Account number must be at most 18 digits" });
                }
            }
            return true;
        }),

    BANK_IFSC: Yup.string()
        .default("")
        .test("bank-ifsc-required", "IFSC code is required", function (value) {
            const { BANK_ACCOUNT_HOLDER_NAME, BANK_ACCOUNT_NO } = this.parent;
            if (!!BANK_ACCOUNT_HOLDER_NAME || !!BANK_ACCOUNT_NO) {
                if (!value) return false;
            }
            return true;
        }),
});
