import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IPlayHistoryRequest } from "../request/module/IPlayHistoryRequest";
import { IPlayHistoryResponse } from "../response/module/IPlayHistoryResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IPlayHistoryService } from "./interfaces/IPlayHistoryService";

const option = { requireAuth: true };

class PlayHistoryService implements IPlayHistoryService {

    async getPlayHistory(
        payload: IPlayHistoryRequest,
        skip: number,
        take: number
    ): Promise<ICustomResponse<IPlayHistoryResponse>> {
        try {
            const response = await http.post<IApiResponse<IPlayHistoryResponse>>(
                UriRepo.PLAYGAMEHISTORY(skip, take),
                payload,
                option
            );
            return genericResponseParser<IPlayHistoryResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IPlayHistoryResponse>(error);
        }
    }
}

export const playHistoryService = new PlayHistoryService();
