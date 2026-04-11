import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IAdminDetailsResponse } from "../../response/module/IAdminDetailsResponse";
import { IUserDetailsResponse } from "../../response/module/IUserDetailsResponse";
import { IRegisterFormValues } from "../../validations/interfaces";

type IUserDetailsPayload = Pick<IRegisterFormValues, 'EMAIL'>;
export interface IUserService {

  userDetails(
    payload: IUserDetailsPayload
  ): Promise<ICustomResponse<IUserDetailsResponse>>;
  
  adminDetails(): Promise<ICustomResponse<IAdminDetailsResponse>>;
}
