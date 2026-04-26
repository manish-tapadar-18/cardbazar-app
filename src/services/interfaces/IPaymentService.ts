import { ICustomResponse } from "../../response/generic/ICustomResponse";
import { IGetPaymentGatewayResponse } from "../../response/module/IGetPaymentGatewayResponse";

export interface IPaymentService {
  getPaymentGateway(amount: number): Promise<ICustomResponse<IGetPaymentGatewayResponse>>;
}
