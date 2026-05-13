import { Alert } from "react-native";
import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { ILoginResponse } from "../response/module/ILoginResponse";
import { ISendOtpResponse } from "../response/module/ISendOtpResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { ILoginFormValues, IRegisterFormValues } from "../validations/interfaces";
import { IAuthenticationService, OtpVerificationPayload } from "./interfaces/IAuthenticationService";

type ISendOtpPayload = Pick<IRegisterFormValues, 'MOBILE'>;
class AuthenticationService implements IAuthenticationService {

    async login(
        payload: ILoginFormValues
    ): Promise<ICustomResponse<ILoginResponse>> {
        try {
            const response = await http.post<IApiResponse<ILoginResponse>>(
                UriRepo.LOGIN,
                payload
            );

            const result = response.data;

            return genericResponseParser<ILoginResponse>(result);

        } catch (error: any) {
            return genericErrorParser<ILoginResponse>(error);
        }
    }

    async sendOtp(
        payload: ISendOtpPayload
    ): Promise<ICustomResponse<ISendOtpResponse>> {
        try {
            const response = await http.post<IApiResponse<ISendOtpResponse>>(
                UriRepo.SENDOTP,
                payload
            );

            const result = response.data;
            return genericResponseParser<ISendOtpResponse>(result);

        } catch (error: any) {
            return genericErrorParser<ISendOtpResponse>(error);
        }
    }

    async registerUser(
        payload: IRegisterFormValues
    ): Promise<ICustomResponse<null>> {
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.REGISTER,
                payload
            );

            const result = response.data;
            return genericResponseParser<null>(result);

        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }

    async verifyOTP(payload: OtpVerificationPayload): Promise<ICustomResponse<null>> {
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.VERIFYOTP,
                payload
            );
            const result = response.data;
            return genericResponseParser<null>(result);

        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }
}

export const authenticationService = new AuthenticationService();
