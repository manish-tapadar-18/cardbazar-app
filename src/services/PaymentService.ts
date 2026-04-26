import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IGetPaymentGatewayResponse } from "../response/module/IGetPaymentGatewayResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IPaymentService } from "./interfaces/IPaymentService";

const option = { requireAuth: true };

class PaymentService implements IPaymentService {

    async getPaymentGateway(amount: number): Promise<ICustomResponse<IGetPaymentGatewayResponse>> {
        try {
            const response = await http.get<IApiResponse<IGetPaymentGatewayResponse>>(
                UriRepo.GETPAYMENTGATEWAY(amount),
                option
            );
            return genericResponseParser<IGetPaymentGatewayResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IGetPaymentGatewayResponse>(error);
        }
    }
}

export const paymentService = new PaymentService();
