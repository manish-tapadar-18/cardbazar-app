import { api, CustomAxiosRequestConfig } from './api';

export const http = {
    get: <T = unknown>(
        url: string,
        config?: CustomAxiosRequestConfig
    ) => api.get<T>(url, config),

    post: <T = unknown>(
        url: string,
        data?: unknown,
        config?: CustomAxiosRequestConfig
    ) => api.post<T>(url, data, config),

    put: <T = unknown>(
        url: string,
        data?: unknown,
        config?: CustomAxiosRequestConfig
    ) => api.put<T>(url, data, config),

    delete: <T = unknown>(
        url: string,
        config?: CustomAxiosRequestConfig
    ) => api.delete<T>(url, config),
};


// const response = await http.get('/products');
// const response = await http.get('/profile', {
//   requireAuth: true,
// });
