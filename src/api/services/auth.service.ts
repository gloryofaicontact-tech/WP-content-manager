import { apiClient, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  UserProfileDto,
} from '../types/auth.dto';

// Helper to extract access token from various NestJS response shapes
function extractTokensAndUser(raw: AuthResponseDto): {
  accessToken: string;
  refreshToken?: string;
  user?: UserProfileDto;
} {
  const root = raw.data || raw;
  const accessToken = root.accessToken || root.access_token || '';
  const refreshToken = root.refreshToken || root.refresh_token;
  const user = root.user;

  return { accessToken, refreshToken, user };
}

export const authService = {
  /**
   * POST {{baseUrl}}/auth/login
   * Payload: { email, password, deviceName }
   */
  async login(payload: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
      deviceName: payload.deviceName || 'Postman Desktop Client',
    });

    const { accessToken, refreshToken, user } = extractTokensAndUser(response.data);

    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/register
   * Payload: { email, password, confirmPassword, fullName }
   */
  async register(payload: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, {
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      fullName: payload.fullName,
    });

    const { accessToken, refreshToken, user } = extractTokensAndUser(response.data);

    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/refresh
   * Payload: { refreshToken }
   */
  async refresh(payload: RefreshTokenDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: payload.refreshToken,
    });

    const { accessToken, refreshToken, user } = extractTokensAndUser(response.data);

    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * GET {{baseUrl}}/auth/me
   */
  async getProfile(): Promise<UserProfileDto> {
    const response = await apiClient.get<UserProfileDto | { data: UserProfileDto }>(
      API_ENDPOINTS.AUTH.ME
    );
    const data: any = response.data;
    const user = data?.data || data;
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  /**
   * POST {{baseUrl}}/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore logout backend errors, always clear local state
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Read cached user from localStorage
   */
  getCachedUser(): UserProfileDto | null {
    try {
      const item = localStorage.getItem(USER_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  },
};
