import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IReferralResponse } from "../response/module/IReferralResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IReferalService } from "./interfaces/IReferalService";

const option = { requireAuth: true };

class ReferalService implements IReferalService {

    async getReferralBonus(): Promise<ICustomResponse<IReferralResponse>> {
        try {
            const response = await http.get<IApiResponse<IReferralResponse>>(
                UriRepo.REFERRALBONUS,
                option
            );
            console.log("getReferralBonus", JSON.stringify(response.data,null,2));

            return genericResponseParser<IReferralResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IReferralResponse>(error);
        }
    }
}

export const referalService = new ReferalService();
