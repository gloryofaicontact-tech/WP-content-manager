import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Storage keys
export const TOKEN_STORAGE_KEY = 'wp_auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'wp_refresh_token';

// Base URL from environment or default to local NestJS standard port 3000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

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

/**
 * Response Interceptor:
 * Handles standard NestJS exception response structures (e.g. HttpException, UnauthorizedException)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string | string[]; statusCode?: number; error?: string }>) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized (Expired token or unauthorized access)
    if (status === 401) {
      // Clear token if invalid
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      
      // Custom event or redirect trigger when session expires
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Extract user-friendly error message from NestJS exception payload
    const data = error.response?.data;
    let errorMessage = 'An unexpected server error occurred';

    if (data?.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Attach human readable message to error for components
    const customError = new Error(errorMessage);
    (customError as any).statusCode = status;
    (customError as any).originalError = error;

    return Promise.reject(customError);
  }
);
