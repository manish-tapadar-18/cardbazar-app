import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IAddMoneyResponse } from "../../response/module/IAddMoneyResponse";
import { ICheckPaymentStatusResponse } from "../../response/module/ICheckPaymentStatusResponse";
import { IGetAllVideoResponse } from "../../response/module/IGetAllVideoResponse";
import { IGetKillerPaymentGatewayResponse } from "../../response/module/IGetKillerPaymentGatewayResponse";
import { IGetPaymentGatewayResponse } from "../../response/module/IGetPaymentGatewayResponse";

export interface IAddMoneyPayload {
  USER_ID: string;
  AMOUNT: number;
  DESCRIPTION: string;
  STATUS: 'PENDING';
}

export interface IPaymentService {
  getPaymentGateway(amount: number): Promise<ICustomResponse<IGetPaymentGatewayResponse>>;
  addMoneyRequest(payload: IAddMoneyPayload): Promise<ICustomResponse<IAddMoneyResponse>>;
  getKillerPaymentGatewayDetails(amount: number, id: string): Promise<ICustomResponse<IGetKillerPaymentGatewayResponse>>;
  checkPaymentStatus(utrNo: string, userId: number): Promise<ICustomResponse<ICheckPaymentStatusResponse>>;
  getAllVideo(): Promise<ICustomResponse<IGetAllVideoResponse>>;
}
