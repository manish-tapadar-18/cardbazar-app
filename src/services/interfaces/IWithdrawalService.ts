import { ICustomResponse } from '../../response/generic/ICustomResponse'
import { ICheckAutoWithdrawalResponse } from '../../response/module/ICheckAutoWithdrawalResponse'
import { IWithdrawalRequestResponse } from '../../response/module/IWithdrawalRequestResponse'

export interface IWithdrawalRequestPayload {
  USER_ID: string
  AMOUNT: number
  DESCRIPTION: 'withdrawal'
  STATUS: 'PENDING'
  BANK_IFSC: string
  BANK_ACCOUNT_HOLDER_NAME: string
  BANK_ACCOUNT_NO: string
  BANK_NAME: string
}

export interface IWithdrawalService {
  checkAutoWithdrawal(): Promise<ICustomResponse<ICheckAutoWithdrawalResponse>>
  withdrawalRequest(payload: IWithdrawalRequestPayload): Promise<ICustomResponse<IWithdrawalRequestResponse>>
}
