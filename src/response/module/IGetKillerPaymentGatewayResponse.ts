export type KillerPaymentType = 'phonepe' | 'paytm' | 'gpay' | 'qrImage';

export interface IKillerPaymentItem {
  type: KillerPaymentType;
  url: string;
  order: number;
}

export type IGetKillerPaymentGatewayResponse = IKillerPaymentItem[];
