import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IAdminDetailsResponse } from "../../response/module/IAdminDetailsResponse";
import { IDeviceDetailResponse } from "../../response/module/IDeviceDetailResponse";
import { IUserBalanceResponse } from "../../response/module/IUserBalanceResponse";
import { IUserDetailsResponse } from "../../response/module/IUserDetailsResponse";
import { IReferralHistoryResponse } from "../../response/module/IReferralHistoryResponse";
import { IReferralHistoryRequest } from "../../request/module/IReferralHistoryRequest";
import { IRegisterFormValues } from "../../validations/interfaces";

type IUserDetailsPayload = Pick<IRegisterFormValues, 'EMAIL'>;
export interface SearchFilterItem {
  FIELD_NAME: 'U1.USER_ID' | 'DEVICE_MASTER.ID' | 'DEVICE_MASTER.UNIQUE_ID' | 'U2.MOBILE' | string;
  FIELD_VALUE: string | number;
  OPT: '=' | '!=' | '>' | '<' | 'LIKE' | string;
}

export interface SortFilter {
  FIELD_NAME: 'DEVICE_MASTER.ID' | string;
  SORT_ORDER: 'ASC' | 'DESC';
}

export interface FilterPayloadContainer {
  filters: {
    search: SearchFilterItem[];
    sortFilter: SortFilter;
  };
}

export interface DeviceDetails {
  mode: string;          
  model: string;         
  manufacturer: string;  
  brand: string;         
  os: string;            
  osVersion: string;     
  appVersion: string;    
  appBuild: string;      
  appVersionCode: string;
  appPackageName: string;
}

export interface UpdateDeviceRequestBody {
  USER_ID: string | number;
  DEVICE_ID: string;
  DEVICE_DETAILS: DeviceDetails;
}

export interface IUserService {

  userDetails(
    payload: IUserDetailsPayload
  ): Promise<ICustomResponse<IUserDetailsResponse>>;

  adminDetails(): Promise<ICustomResponse<IAdminDetailsResponse>>;

  getUserBalance(userId: string): Promise<ICustomResponse<IUserBalanceResponse>>;
  updateWithdrawalRequestUser(userId: string): Promise<ICustomResponse<null>>;
  UpdateUserFcm(userId: string): Promise<ICustomResponse<null>>;
  GetDeviceDetails(payload:FilterPayloadContainer): Promise<ICustomResponse<IDeviceDetailResponse>>;
  UpdateDevice(payload:UpdateDeviceRequestBody): Promise<ICustomResponse<null>>;
  GetReferralHistory(payload: IReferralHistoryRequest): Promise<ICustomResponse<IReferralHistoryResponse>>;
}
