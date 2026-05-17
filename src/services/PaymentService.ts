import { IApiResponse } from "../response/generic/IApiResponse";
import { ICustomResponse } from "../response/generic/ICustomResponse";
import { IAddMoneyResponse } from "../response/module/IAddMoneyResponse";
import { ICheckPaymentStatusResponse } from "../response/module/ICheckPaymentStatusResponse";
import { IGetAllVideoResponse } from "../response/module/IGetAllVideoResponse";
import { IGetKillerPaymentGatewayResponse } from "../response/module/IGetKillerPaymentGatewayResponse";
import { IGetPaymentGatewayResponse } from "../response/module/IGetPaymentGatewayResponse";
import { genericErrorParser } from "../response/parser/genericErrorParser";
import { genericResponseParser } from "../response/parser/genericResponseParser";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { IAddMoneyPayload, IPaymentService } from "./interfaces/IPaymentService";

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

    async addMoneyRequest(payload: IAddMoneyPayload): Promise<ICustomResponse<IAddMoneyResponse>> {
        try {
            const response = await http.post<IApiResponse<IAddMoneyResponse>>(
                UriRepo.ADDMONEY,
                payload,
                option
            );
            return genericResponseParser<IAddMoneyResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IAddMoneyResponse>(error);
        }
    }

    async getKillerPaymentGatewayDetails(amount: number, id: string): Promise<ICustomResponse<IGetKillerPaymentGatewayResponse>> {
        try {
            const response = await http.get<IApiResponse<IGetKillerPaymentGatewayResponse>>(
                UriRepo.GETKILLERPAYMENTGATEWAYDETAILS(amount, id),
                option
            );
            const parsed = genericResponseParser<IGetKillerPaymentGatewayResponse>(response.data);
            if (parsed.isSuccess && parsed.data) {
                return {
                    ...parsed,
                    data: [...parsed.data].sort((a, b) => a.order - b.order),
                };
            }
            return parsed;
        } catch (error: any) {
            return genericErrorParser<IGetKillerPaymentGatewayResponse>(error);
        }
    }

    async checkPaymentStatus(utrNo: string, userId: number): Promise<ICustomResponse<ICheckPaymentStatusResponse>> {
        try {
            const response = await http.get<IApiResponse<ICheckPaymentStatusResponse>>(
                UriRepo.CHECKPAYMENTSTATUS(utrNo, userId),
                option
            );
            return genericResponseParser<ICheckPaymentStatusResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<ICheckPaymentStatusResponse>(error);
        }
    }

    async getAllVideo(): Promise<ICustomResponse<IGetAllVideoResponse>> {
        try {
            const response = await http.get<IApiResponse<IGetAllVideoResponse>>(
                UriRepo.GETALLVIDEO,
                option
            );
            return genericResponseParser<IGetAllVideoResponse>(response.data);
        } catch (error: any) {
            return genericErrorParser<IGetAllVideoResponse>(error);
        }
    }
}

export const paymentService = new PaymentService();
