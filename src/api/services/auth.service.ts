import { apiClient, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  UserProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  UserSessionDto,
} from '../types/auth.dto';

/**
 * Universal normalizer for user profile payloads across diverse NestJS/Express formats.
 * Handles nested wrappers: data.user, data.profile, data, user, profile, and various key namings.
 */
export function normalizeUserProfile(raw: any): UserProfileDto | null {
  if (!raw || typeof raw !== 'object') return null;

  // Unpack nested response wrappers
  const candidate =
    raw.user ||
    raw.data?.user ||
    raw.data?.profile ||
    raw.profile ||
    raw.data ||
    raw;

  const actual = candidate.user || candidate.profile || candidate;
  if (!actual || typeof actual !== 'object') return null;

  const email = actual.email || actual.userEmail || actual.emailAddress || '';
  const fullName =
    actual.fullName ||
    actual.name ||
    actual.displayName ||
    actual.username ||
    actual.userName ||
    (actual.firstName && actual.lastName
      ? `${actual.firstName} ${actual.lastName}`.trim()
      : actual.firstName || actual.lastName) ||
    (email ? email.split('@')[0] : '');

  const id = actual.id || actual._id || actual.userId || actual.sub || '';
  const role = actual.role || actual.userRole || actual.roles?.[0] || 'Editor';
  const profileImage =
    actual.profileImage ||
    actual.avatar ||
    actual.avatarUrl ||
    actual.picture ||
    '';

  return {
    id: id ? String(id) : undefined,
    email,
    fullName,
    name: fullName,
    role,
    profileImage,
    createdAt: actual.createdAt,
    updatedAt: actual.updatedAt,
  };
}

// Helper to extract access token from various NestJS response shapes
function extractTokensAndUser(raw: any): {
  accessToken: string;
  refreshToken?: string;
  user?: UserProfileDto;
} {
  const root = raw?.data || raw || {};
  const accessToken =
    root.accessToken ||
    root.access_token ||
    raw?.accessToken ||
    raw?.access_token ||
    root.tokens?.accessToken ||
    root.tokens?.access_token ||
    '';

  const refreshToken =
    root.refreshToken ||
    root.refresh_token ||
    raw?.refreshToken ||
    raw?.refresh_token ||
    root.tokens?.refreshToken ||
    root.tokens?.refresh_token;

  const user = normalizeUserProfile(raw);

  return { accessToken, refreshToken, user: user || undefined };
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

    // Always ensure a valid user with the login email is saved in storage
    const resolvedUser: UserProfileDto = (user && user.email)
      ? user
      : {
          email: payload.email,
          fullName: payload.email.split('@')[0],
          name: payload.email.split('@')[0],
          role: 'Editor',
        };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(resolvedUser));

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

    const resolvedUser: UserProfileDto = (user && user.email)
      ? user
      : {
          email: payload.email,
          fullName: payload.fullName || payload.email.split('@')[0],
          name: payload.fullName || payload.email.split('@')[0],
          role: 'Editor',
        };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(resolvedUser));

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
    const normalized = normalizeUserProfile(response.data);
    if (normalized && normalized.email) {
      // Merge with existing cached user so we preserve any locally known properties
      const existing = this.getCachedUser();
      const merged: UserProfileDto = {
        id: normalized.id || existing?.id,
        email: normalized.email,
        fullName: normalized.fullName || existing?.fullName || normalized.email.split('@')[0],
        name: normalized.fullName || existing?.fullName || normalized.email.split('@')[0],
        role: normalized.role || existing?.role || 'Editor',
        profileImage: normalized.profileImage || existing?.profileImage || '',
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    // Fallback: if server returned unparseable structure, return whatever was cached or raw
    const cached = this.getCachedUser();
    return cached || (response.data as any);
  },

  /**
   * Alias for GET {{baseUrl}}/auth/me
   */
  async getMe(): Promise<UserProfileDto> {
    return this.getProfile();
  },

  /**
   * POST {{baseUrl}}/auth/forgot-password
   * Payload: { email }
   */
  async forgotPassword(payload: ForgotPasswordDto): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/reset-password
   * Payload: { token, newPassword, confirmPassword }
   */
  async resetPassword(payload: ResetPasswordDto): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/change-password
   * Payload: { oldPassword, newPassword, confirmPassword }
   */
  async changePassword(payload: ChangePasswordDto): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/verify-email
   * Payload: { token }
   */
  async verifyEmail(payload: VerifyEmailDto): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, payload);
    return response.data;
  },

  /**
   * POST {{baseUrl}}/auth/resend-verification
   * Payload: { email }
   */
  async resendVerification(payload: ResendVerificationDto): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, payload);
    return response.data;
  },

  /**
   * GET {{baseUrl}}/auth/sessions
   * Retrieves active login sessions
   */
  async getSessions(): Promise<UserSessionDto[]> {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.SESSIONS);
    const resData = response.data;
    if (Array.isArray(resData?.data)) return resData.data;
    if (Array.isArray(resData?.sessions)) return resData.sessions;
    if (Array.isArray(resData)) return resData;
    return [];
  },

  /**
   * DELETE {{baseUrl}}/auth/sessions/{{sessionId}}
   * Revokes a specific session
   */
  async deleteSession(sessionId: string): Promise<any> {
    const response = await apiClient.delete(API_ENDPOINTS.AUTH.SESSION_DELETE(sessionId));
    return response.data;
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
   * POST {{baseUrl}}/auth/logout-all
   * Terminates all active sessions for the user across all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT_ALL);
    } catch {
      // Ignore backend error, ensure local cleanup
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
