import { IGameListFilterRequest } from "../../request/module/IGameListFilterRequest";
import { IGameRulesRequest } from "../../request/module/IGameRulesRequest";
import { IUpdateProfileRequest } from "../../request/module/IUpdateProfileRequest";
import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IGameCategoryResponse } from "../../response/module/IGameCategoryResponse";
import { IGameRulesResponse } from "../../response/module/IGameRulesResponse";
import { IGetAllGamesListResponse } from "../../response/module/IGetAllGamesListResponse";

export interface IGameService {
    getAllGameCategories(): Promise<ICustomResponse<IGameCategoryResponse[]>>;
    getAllGameRules(payload: IGameRulesRequest): Promise<ICustomResponse<IGameRulesResponse>>;
    getAllGamesList(payload: any): Promise<ICustomResponse<IGetAllGamesListResponse>>;
    updateProfile(payload: IUpdateProfileRequest): Promise<ICustomResponse<null>>;
}