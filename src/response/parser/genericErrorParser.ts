import { ICustomResponse } from "../generic/ICustomResponse";

export function genericErrorParser<T>(error: any): ICustomResponse<T> {

  return {
    isSuccess: false,
    data: null,
    message: error?.message ?? "Something went wrong",
  };
}
