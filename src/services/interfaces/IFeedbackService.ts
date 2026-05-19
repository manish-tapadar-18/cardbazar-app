import { ICustomResponse } from "../../response/generic/ICustomResponse";

export interface IFeedbackRequestBody {
    TITLE: string;
    DESCRIPTION: string;
    STARS: string;
}

export interface IFeedbackService {
    addFeedback(payload: IFeedbackRequestBody): Promise<ICustomResponse<null>>;
}
