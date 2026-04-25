import { IAuthenticationService } from "../../services/interfaces/IAuthenticationService";
import { IGameService } from "../../services/interfaces/IGameServices";
import { IUserService } from "../../services/interfaces/IUserService";
import { IReferalService } from "../../services/interfaces/IReferalService";
import { ITransactionService } from "../../services/interfaces/ITransactionService";
import { IPlayHistoryService } from "../../services/interfaces/IPlayHistoryService";

export interface IRepository {
    Auth: IAuthenticationService;
    User: IUserService;
    Game: IGameService;
    Referal: IReferalService;
    Transaction: ITransactionService;
    PlayHistory: IPlayHistoryService;
}
