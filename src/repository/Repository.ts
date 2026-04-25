import { authenticationService } from "../services/AuthenticationService";
import { gameService } from "../services/GameService";
import { userService } from "../services/UserService";
import { referalService } from "../services/ReferalService";
import { transactionService } from "../services/TransactionService";
import { playHistoryService } from "../services/PlayHistoryService";
import { IRepository } from "./interfaces/IRepository";

const Repository: IRepository = {
    Auth: authenticationService,
    User: userService,
    Game: gameService,
    Referal: referalService,
    Transaction: transactionService,
    PlayHistory: playHistoryService,
};

export { Repository };
