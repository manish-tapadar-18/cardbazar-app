import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IReferralResponse } from "../../response/module/IReferralResponse";

export interface IReferalService {
    getReferralBonus(): Promise<ICustomResponse<IReferralResponse>>;
}
