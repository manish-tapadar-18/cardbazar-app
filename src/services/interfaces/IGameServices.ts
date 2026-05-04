import { IGameRulesRequest } from "../../request/module/IGameRulesRequest";
import { IPlayGameMultipleRequest } from "../../request/module/IPlayGameMultipleRequest";
import { IUpdateProfileRequest } from "../../request/module/IUpdateProfileRequest";
import { IGameResultRequest } from "../../request/module/IGameResultRequest";
import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IGameCategoryResponse } from "../../response/module/IGameCategoryResponse";
import { IGameRulesResponse } from "../../response/module/IGameRulesResponse";
import { IGameTypeResponse } from "../../response/module/IGameTypeResponse";
import { IGetAllGamesListResponse } from "../../response/module/IGetAllGamesListResponse";
import { IGameResultResponse } from "../../response/module/IGameResultResponse";

export interface IGameService {
    getAllGameCategories(): Promise<ICustomResponse<IGameCategoryResponse[]>>;
    getAllGameTypes(): Promise<ICustomResponse<IGameTypeResponse[]>>;
    getAllGameRules(payload: IGameRulesRequest): Promise<ICustomResponse<IGameRulesResponse>>;
    getAllGamesList(payload: any): Promise<ICustomResponse<IGetAllGamesListResponse>>;
    updateProfile(payload: IUpdateProfileRequest): Promise<ICustomResponse<null>>;
    playGameMultiple(payload: IPlayGameMultipleRequest): Promise<ICustomResponse<null>>;
    getGameResults(payload: IGameResultRequest, skip: number, take: number): Promise<ICustomResponse<IGameResultResponse>>;
}