export interface ICustomResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T | null;
}