import { IApiResponse } from '../response/generic/IApiResponse'
import { ICustomResponse } from '../response/generic/ICustomResponse'
import { ICheckAutoWithdrawalResponse } from '../response/module/ICheckAutoWithdrawalResponse'
import { IWithdrawalRequestResponse } from '../response/module/IWithdrawalRequestResponse'
import { genericErrorParser } from '../response/parser/genericErrorParser'
import { genericResponseParser } from '../response/parser/genericResponseParser'
import { http } from '../utils/http'
import { UriRepo } from '../utils/UriRepo'
import { IWithdrawalRequestPayload, IWithdrawalService } from './interfaces/IWithdrawalService'

class WithdrawalService implements IWithdrawalService {

  async checkAutoWithdrawal(): Promise<ICustomResponse<ICheckAutoWithdrawalResponse>> {
    try {
      const response = await http.get<IApiResponse<ICheckAutoWithdrawalResponse>>(
        UriRepo.CHECKAUTOWITHDRAWAL,
        { requireAuth: true }
      )
      return genericResponseParser<ICheckAutoWithdrawalResponse>(response.data)
    } catch (error: any) {
      return genericErrorParser<ICheckAutoWithdrawalResponse>(error)
    }
  }

  async withdrawalRequest(payload: IWithdrawalRequestPayload): Promise<ICustomResponse<IWithdrawalRequestResponse>> {
    try {
      const response = await http.post<IApiResponse<IWithdrawalRequestResponse>>(
        UriRepo.WITHDRAWALREQUEST,
        payload,
        { requireAuth: true }
      )
      return genericResponseParser<IWithdrawalRequestResponse>(response.data)
    } catch (error: any) {
      return genericErrorParser<IWithdrawalRequestResponse>(error)
    }
  }
}

export const withdrawalService = new WithdrawalService()
