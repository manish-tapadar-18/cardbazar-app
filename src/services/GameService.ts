import { IGameRulesRequest } from "../request/module/IGameRulesRequest";
import { IPlayGameMultipleRequest } from "../request/module/IPlayGameMultipleRequest";
import { IUpdateProfileRequest } from "../request/module/IUpdateProfileRequest";
import { IGameResultRequest } from "../request/module/IGameResultRequest";
import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IGameCategoryResponse } from "../response/module/IGameCategoryResponse";
import { IGameRulesResponse } from "../response/module/IGameRulesResponse";
import { IGameTypeResponse } from "../response/module/IGameTypeResponse";
import { IGetAllGamesListResponse } from "../response/module/IGetAllGamesListResponse";
import { IGameResultResponse } from "../response/module/IGameResultResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IGameService } from "./interfaces/IGameServices";

const option = { requireAuth: true }

class GameService implements IGameService {

    async getAllGameCategories(): Promise<ICustomResponse<IGameCategoryResponse[]>> {
        try {
            const response = await http.get<IApiResponse<IGameCategoryResponse[]>>(
                UriRepo.GETALLGAMECATEGORYWITHCOUNT,
                option
            );
            const result = response.data;
            return genericResponseParser<IGameCategoryResponse[]>(result);
        } catch (error: any) {
            return genericErrorParser<IGameCategoryResponse[]>(error);
        }
    }

    async getAllGameTypes(): Promise<ICustomResponse<IGameTypeResponse[]>> {
        try {
            const response = await http.get<IApiResponse<IGameTypeResponse[]>>(
                UriRepo.GETALLGAMETYPE,
                option
            );
            const result = response.data;
            return genericResponseParser<IGameTypeResponse[]>(result);
        } catch (error: any) {
            return genericErrorParser<IGameTypeResponse[]>(error);
        }
    }

    async getAllGameRules(payload: IGameRulesRequest): Promise<ICustomResponse<IGameRulesResponse>> {
        try {
            const response = await http.post<IApiResponse<IGameRulesResponse>>(
                UriRepo.GETALLGAMERULES,
                payload,
                option
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
                option
            );
            const result = response.data;
            return genericResponseParser<IGetAllGamesListResponse>(result);
        } catch (error: any) {
            return genericErrorParser<IGetAllGamesListResponse>(error);
        }
    }

    async playGameMultiple(payload: IPlayGameMultipleRequest): Promise<ICustomResponse<null>> {
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.PLAYGAMEMULTIPLE,
                payload,
                option
            );
            const result = response.data;
            return genericResponseParser<null>(result);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }

    async updateProfile(payload: IUpdateProfileRequest): Promise<ICustomResponse<null>> {
        try {
            const response = await http.put<IApiResponse<null>>(
                UriRepo.UPDATEPROFILE,
                payload,
                option
            );
            const result = response.data;
            return genericResponseParser<null>(result);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }

    async getGameResults(
        payload: IGameResultRequest,
        skip: number,
        take: number
    ): Promise<ICustomResponse<IGameResultResponse>> {
        try {
            const response = await http.post<IApiResponse<IGameResultResponse>>(
                UriRepo.GETALLGAMERESULT(skip, take),
                payload,
                option
            );
            return genericResponseParser<IGameResultResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IGameResultResponse>(error);
        }
    }
}

export const gameService = new GameService();