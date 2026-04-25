import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { ITransactionRequest } from "../request/module/ITransactionRequest";
import { ITransactionResponse } from "../response/module/ITransactionResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { ITransactionService } from "./interfaces/ITransactionService";

const option = { requireAuth: true };

class TransactionService implements ITransactionService {

    async getTransactionList(
        payload: ITransactionRequest,
        skip: number,
        take: number
    ): Promise<ICustomResponse<ITransactionResponse>> {
        try {
            const response = await http.post<IApiResponse<ITransactionResponse>>(
                UriRepo.TRANSACTIONLIST(skip, take),
                payload,
                option
            );
            return genericResponseParser<ITransactionResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<ITransactionResponse>(error);
        }
    }
}

export const transactionService = new TransactionService();
