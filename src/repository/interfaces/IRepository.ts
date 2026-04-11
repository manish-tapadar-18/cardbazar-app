import { IAuthenticationService } from "../../services/interfaces/IAuthenticationService";
import { IGameService } from "../../services/interfaces/IGameServices";
import { IUserService } from "../../services/interfaces/IUserService";

export interface IRepository {
    Auth: IAuthenticationService;
    User: IUserService;
    Game:IGameService
}
