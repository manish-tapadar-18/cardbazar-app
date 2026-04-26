import { IApiResponse } from "../generic/IApiResponse";
import { ICustomResponse } from "../generic/ICustomResponse";


export function genericResponseParser<T>(
  result: IApiResponse<T>
): ICustomResponse<T> {

  if ((result.code === "200" || result.code === "201") && result.status === "success") {
    return {
      isSuccess: true,
      data: result.data ?? null,
      message: result.message,
    };
  }

  return {
    isSuccess: false,
    data: null,
    message: result.message,
  };
}