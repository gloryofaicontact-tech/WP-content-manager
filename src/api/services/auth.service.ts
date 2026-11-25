import { apiClient, TOKEN_STORAGE_KEY } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginDto, RegisterDto, AuthResponseDto, UserProfileDto } from '../types/auth.dto';

export const authService = {
  /**
   * POST /auth/login
   */
  async login(payload: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, payload);
    if (response.data?.accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.accessToken);
    }
    return response.data;
  },

  /**
   * POST /auth/register
   */
  async register(payload: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, payload);
    if (response.data?.accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.accessToken);
    }
    return response.data;
  },

  /**
   * GET /auth/me
   */
  async getProfile(): Promise<UserProfileDto> {
    const response = await apiClient.get<UserProfileDto>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },
};
