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
import { clLog, clRecordError, clSetAttribute, clSetUser, TAGS } from "../utils/CrashlyticsUtils";

class UserService implements IUserService {

    async userDetails(payload: { EMAIL: string; }): Promise<ICustomResponse<IUserDetailsResponse>> {
        clLog(TAGS.USER_SERVICE, 'userDetails — start');
        try {
            const response = await http.post<IApiResponse<IUserDetailsResponse>>(
                UriRepo.USERDETAILS,
                payload,
                { requireAuth: true }
            );
            const result = response.data;
            const parsed = genericResponseParser<IUserDetailsResponse>(result);
            if (parsed.isSuccess && parsed.data) {
                clSetUser(parsed.data.ID);
                clSetAttribute('email', parsed.data.EMAIL);
            }
            return parsed;
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'userDetails');
            return genericErrorParser<IUserDetailsResponse>(error);
        }
    }

    async adminDetails(): Promise<ICustomResponse<IAdminDetailsResponse>> {
        clLog(TAGS.USER_SERVICE, 'adminDetails — start');
        try {
            const response = await http.get<IApiResponse<IAdminDetailsResponse>>(
                UriRepo.ADMINDETAILS,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IAdminDetailsResponse>(result);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'adminDetails');
            return genericErrorParser<IAdminDetailsResponse>(error);
        }
    }

    async getUserBalance(userId: string): Promise<ICustomResponse<IUserBalanceResponse>> {
        clLog(TAGS.USER_SERVICE, `getUserBalance — userId: ${userId}`);
        try {
            const response = await http.get<IApiResponse<IUserBalanceResponse>>(
                UriRepo.GETUSERBALANCE(userId),
                { requireAuth: true }
            );
            return genericResponseParser<IUserBalanceResponse>(response.data);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'getUserBalance');
            return genericErrorParser<IUserBalanceResponse>(error);
        }
    }

    async updateWithdrawalRequestUser(userId: string): Promise<ICustomResponse<null>> {
        clLog(TAGS.USER_SERVICE, `updateWithdrawalRequestUser — userId: ${userId}`);
        try {
            const response = await http.put<IApiResponse<null>>(
                UriRepo.UPDATEWITHDRAWALREQUESTUSER(userId),
                {},
                { requireAuth: true }
            );
            return genericResponseParser<null>(response.data);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'updateWithdrawalRequestUser');
            return genericErrorParser<null>(error);
        }
    }

    async UpdateUserFcm(userId: string): Promise<ICustomResponse<null>> {
        clLog(TAGS.USER_SERVICE, `UpdateUserFcm — userId: ${userId}`);
        try {
            const fcmToken = await getFCMToken();
            if (!fcmToken) {
                const err = new Error('FCM token unavailable — notification permission may not be granted.');
                clRecordError(TAGS.USER_SERVICE, err, 'UpdateUserFcm');
                return genericErrorParser<null>(err);
            }
            const response = await http.post<IApiResponse<null>>(
                UriRepo.UPDATEFCMTOKEN,
                { ID: userId, FCM: fcmToken },
                { requireAuth: true }
            );
            return genericResponseParser<null>(response.data);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'UpdateUserFcm');
            return genericErrorParser<null>(error);
        }
    }

    async GetDeviceDetails(payload: FilterPayloadContainer): Promise<ICustomResponse<IDeviceDetailResponse>> {
        clLog(TAGS.USER_SERVICE, 'GetDeviceDetails — start');
        try {
            const response = await http.post<IApiResponse<IDeviceDetailResponse>>(
                UriRepo.GETDEVICEDETAILS, payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IDeviceDetailResponse>(result);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'GetDeviceDetails');
            return genericErrorParser<IDeviceDetailResponse>(error);
        }
    }

    async UpdateDevice(payload: UpdateDeviceRequestBody): Promise<ICustomResponse<null>> {
        clLog(TAGS.USER_SERVICE, 'UpdateDevice — start');
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.UPDATEDEVICE, payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<null>(result);
        } catch (error: any) {
            clRecordError(TAGS.USER_SERVICE, error, 'UpdateDevice');
            return genericErrorParser<null>(error);
        }
    }
}

export const userService = new UserService();