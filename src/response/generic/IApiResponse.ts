export interface IApiResponse<T> {
    code: string;
    status: "success" | "error";
    message: string;
    data?: T;
}