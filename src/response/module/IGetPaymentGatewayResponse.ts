export interface IPaymentGatewayItem {
  ID: number;
  NAME: string;
  CODE: string;
  STATUS: number;
  TRANSACTION_LIMIT: number;
}

export type IGetPaymentGatewayResponse = IPaymentGatewayItem[];
