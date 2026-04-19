import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IAdminDetailsResponse } from "../response/module/IAdminDetailsResponse";
import { IUserBalanceResponse } from "../response/module/IUserBalanceResponse";
import { IUserDetailsResponse } from "../response/module/IUserDetailsResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IUserService } from "./interfaces/IUserService";

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
}

export const userService = new UserService();