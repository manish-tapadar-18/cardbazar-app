import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { useUserStore } from '../stores/userStore';
import { ENV } from './env';

export interface CustomAxiosRequestConfig
  extends AxiosRequestConfig {
  requireAuth?: boolean;
}

/**
 * Common interceptor logic
 */
const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & { requireAuth?: boolean }) => {
      const token = useUserStore.getState().token;

      if (config.requireAuth && token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        return Promise.reject({
          message: 'Network error. Please check internet connection.',
        });
      }

      if (error.response.status === 401) {
        console.log('Unauthorized - Token expired');
      }

      return Promise.reject(error.response.data);
    }
  );
};

/**
 * Default API (V3)
 */
export const api = axios.create({
  baseURL: `${ENV.BASE_URL}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachInterceptors(api);
