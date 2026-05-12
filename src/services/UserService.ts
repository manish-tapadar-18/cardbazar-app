import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IAdminDetailsResponse } from "../response/module/IAdminDetailsResponse";
import { IUserBalanceResponse } from "../response/module/IUserBalanceResponse";
import { IUserDetailsResponse } from "../response/module/IUserDetailsResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { getFCMToken } from "../utils/PushNotificationUtils";
import { FilterPayloadContainer, IUserService, UpdateDeviceRequestBody } from "./interfaces/IUserService";
import { IDeviceDetailResponse } from "../response/module/IDeviceDetailResponse";

class UserService implements IUserService {

    async userDetails(payload: { EMAIL: string; }): Promise<ICustomResponse<IUserDetailsResponse>> {
        try {
            const response = await http.post<IApiResponse<IUserDetailsResponse>>(
                UriRepo.USERDETAILS,
                payload,
                { requireAuth: true }
            );

            const result = response.data;

            return genericResponseParser<IUserDetailsResponse>(result);

        } catch (error: any) {
            return genericErrorParser<IUserDetailsResponse>(error);
        }
    }

    async adminDetails(): Promise<ICustomResponse<IAdminDetailsResponse>> {
        try {
            const response = await http.get<IApiResponse<IAdminDetailsResponse>>(
                UriRepo.ADMINDETAILS,
                { requireAuth: true }
            );

            const result = response.data;

            return genericResponseParser<IAdminDetailsResponse>(result);

        } catch (error: any) {
            return genericErrorParser<IAdminDetailsResponse>(error);
        }
    }

    async getUserBalance(userId: string): Promise<ICustomResponse<IUserBalanceResponse>> {
        try {
            const response = await http.get<IApiResponse<IUserBalanceResponse>>(
                UriRepo.GETUSERBALANCE(userId),
                { requireAuth: true }
            );
            return genericResponseParser<IUserBalanceResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IUserBalanceResponse>(error);
        }
    }

    async updateWithdrawalRequestUser(userId: string): Promise<ICustomResponse<null>> {
        try {
            const response = await http.put<IApiResponse<null>>(
                UriRepo.UPDATEWITHDRAWALREQUESTUSER(userId),
                {},
                { requireAuth: true }
            );
            return genericResponseParser<null>(response.data);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }

    async UpdateUserFcm(userId: string): Promise<ICustomResponse<null>> {
        try {
            const fcmToken = await getFCMToken();
            if (!fcmToken) {
                return genericErrorParser<null>(
                    new Error('FCM token unavailable — notification permission may not be granted.')
                );
            }
            const response = await http.post<IApiResponse<null>>(
                UriRepo.UPDATEFCMTOKEN,
                { ID: userId, FCM: fcmToken },
                { requireAuth: true }
            );
            return genericResponseParser<null>(response.data);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }

    async GetDeviceDetails(payload: FilterPayloadContainer): Promise<ICustomResponse<IDeviceDetailResponse>> {
        try {
            const response = await http.post<IApiResponse<IDeviceDetailResponse>>(
                UriRepo.GETDEVICEDETAILS, payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IDeviceDetailResponse>(result);
        } catch (error: any) {
            return genericErrorParser<IDeviceDetailResponse>(error);
        }
    }

    async UpdateDevice(payload: UpdateDeviceRequestBody): Promise<ICustomResponse<null>> {
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.UPDATEDEVICE, payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<null>(result);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }
}

export const userService = new UserService();