import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IPlayHistoryRequest } from "../../request/module/IPlayHistoryRequest";
import { IPlayHistoryResponse } from "../../response/module/IPlayHistoryResponse";

export interface IPlayHistoryService {
    getPlayHistory(
        payload: IPlayHistoryRequest,
        skip: number,
        take: number
    ): Promise<ICustomResponse<IPlayHistoryResponse>>;
}
