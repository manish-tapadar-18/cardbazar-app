import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IFeedbackRequestBody, IFeedbackService } from "./interfaces/IFeedbackService";

class FeedbackService implements IFeedbackService {

    async addFeedback(payload: IFeedbackRequestBody): Promise<ICustomResponse<null>> {
        try {
            const response = await http.post<IApiResponse<null>>(
                UriRepo.ADDFEEDBACK,
                payload,
                { requireAuth: true }
            );
            return genericResponseParser<null>(response.data);
        } catch (error: any) {
            return genericErrorParser<null>(error);
        }
    }
}

export const feedbackService = new FeedbackService();
