import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from './endpoints';

// Storage keys
export const TOKEN_STORAGE_KEY = 'wp_auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'wp_refresh_token';
export const USER_STORAGE_KEY = 'wp_auth_user';

// Base URL from environment or default to local NestJS standard port 3000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 60000;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor:
 * Automatically attaches Bearer JWT token if available in localStorage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor:
 * 1. Automatically intercepts 401 Unauthorized
 * 2. Attempts silent refresh via POST /auth/refresh with { refreshToken }
 * 3. Formats human-readable errors from NestJS exceptions
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string | string[]; statusCode?: number; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Check if error is 401 and not already retrying
    if (status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || '';
      
      // Do not attempt refresh on auth endpoints to avoid infinite loops
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh');

      if (!isAuthEndpoint) {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

        if (storedRefreshToken) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return apiClient(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call POST {{baseUrl}}/auth/refresh with { refreshToken, refresh_token }
            const refreshResponse = await axios.post<any>(
              `${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
              {
                refreshToken: storedRefreshToken,
                refresh_token: storedRefreshToken,
              }
            );

            const resData = refreshResponse.data?.data || refreshResponse.data || {};
            const newAccessToken =
              resData.accessToken ||
              resData.access_token ||
              resData.tokens?.accessToken ||
              resData.tokens?.access_token;
            const newRefreshToken =
              resData.refreshToken ||
              resData.refresh_token ||
              resData.tokens?.refreshToken ||
              resData.tokens?.refresh_token;

            if (newAccessToken) {
              localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
              }

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }

              processQueue(null, newAccessToken);
              return apiClient(originalRequest);
            }
          } catch (refreshErr) {
            processQueue(refreshErr as Error, null);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token available, session is expired
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }

    // Extract user-friendly error message from NestJS exception payload
    const data = error.response?.data;
    let errorMessage = 'An unexpected server error occurred';

    if (data?.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = `Cannot connect to backend server at ${BASE_URL}. Ensure your NestJS server is running.`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const customError = new Error(errorMessage);
    (customError as any).statusCode = status;
    (customError as any).originalError = error;

    return Promise.reject(customError);
  }
);
