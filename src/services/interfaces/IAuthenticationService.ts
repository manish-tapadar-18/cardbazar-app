import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { ILoginResponse } from "../../response/module/ILoginResponse";
import { ISendOtpResponse } from "../../response/module/ISendOtpResponse";
import { ILoginFormValues, IRegisterFormValues } from "../../validations/interfaces";

type ISendOtpPayload = Pick<IRegisterFormValues, 'MOBILE'>;
export type OtpVerificationPayload = {
  otp: string;
  verificationId: string;
};
export interface IAuthenticationService {

  login(
    payload: ILoginFormValues
  ): Promise<ICustomResponse<ILoginResponse>>;
  sendOtp(
    payload: ISendOtpPayload
  ): Promise<ICustomResponse<ISendOtpResponse>>;
  registerUser(
    payload: IRegisterFormValues
  ): Promise<ICustomResponse<null>>;
  verifyOTP(
    payload: OtpVerificationPayload
  ): Promise<ICustomResponse<null>>;
}
