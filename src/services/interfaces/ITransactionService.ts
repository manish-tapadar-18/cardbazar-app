import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { ITransactionRequest } from "../../request/module/ITransactionRequest";
import { ITransactionResponse } from "../../response/module/ITransactionResponse";

export interface ITransactionService {
    getTransactionList(
        payload: ITransactionRequest,
        skip: number,
        take: number
    ): Promise<ICustomResponse<ITransactionResponse>>;
}
