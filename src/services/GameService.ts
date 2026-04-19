import { IGameRulesRequest } from "../request/module/IGameRulesRequest";
import { IUpdateProfileRequest } from "../request/module/IUpdateProfileRequest";
import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IGameCategoryResponse } from "../response/module/IGameCategoryResponse";
import { IGameRulesResponse } from "../response/module/IGameRulesResponse";
import { IGetAllGamesListResponse } from "../response/module/IGetAllGamesListResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IGameService } from "./interfaces/IGameServices";

class GameService implements IGameService {

    async getAllGameCategories(): Promise<ICustomResponse<IGameCategoryResponse[]>> {
        try {
            const response = await http.get<IApiResponse<IGameCategoryResponse[]>>(
                UriRepo.GETALLGAMECATEGORY,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IGameCategoryResponse[]>(result);
        } catch (error: any) {
            return genericErrorParser<IGameCategoryResponse[]>(error);
        }
    }

    async getAllGameRules(payload: IGameRulesRequest): Promise<ICustomResponse<IGameRulesResponse>> {
        try {
            const response = await http.post<IApiResponse<IGameRulesResponse>>(
                UriRepo.GETALLGAMERULES,
                payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IGameRulesResponse>(result);
        } catch (error: any) {
            return genericErrorParser<IGameRulesResponse>(error);
        }
    }

    async getAllGamesList(payload: any): Promise<ICustomResponse<IGetAllGamesListResponse>> {
        try {
            const response = await http.post<IApiResponse<IGetAllGamesListResponse>>(
                UriRepo.GETGAMELISTBYCATEGORYID,
                payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<IGetAllGamesListResponse>(result);
        } catch (error: any) {
            return genericErrorParser<IGetAllGamesListResponse>(error);
        }
    }

    async updateProfile(payload: IUpdateProfileRequest): Promise<ICustomResponse<null>> {
        try {
            const response = await http.put<IApiResponse<null>>(
                UriRepo.UPDATEPROFILE,
                payload,
                { requireAuth: true }
            );
            const result = response.data;
            return genericResponseParser<null>(result);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }
}

export const gameService = new GameService();