import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IAdminDetailsResponse } from "../../response/module/IAdminDetailsResponse";
import { IUserBalanceResponse } from "../../response/module/IUserBalanceResponse";
import { IUserDetailsResponse } from "../../response/module/IUserDetailsResponse";
import { IRegisterFormValues } from "../../validations/interfaces";

type IUserDetailsPayload = Pick<IRegisterFormValues, 'EMAIL'>;
export interface IUserService {

  userDetails(
    payload: IUserDetailsPayload
  ): Promise<ICustomResponse<IUserDetailsResponse>>;

  adminDetails(): Promise<ICustomResponse<IAdminDetailsResponse>>;

  getUserBalance(userId: string): Promise<ICustomResponse<IUserBalanceResponse>>;
  updateWithdrawalRequestUser(userId: string): Promise<ICustomResponse<null>>;
}
