export interface LoginDto {
  email: string;
  password: string;
  deviceName?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
}

export interface UserProfileDto {
  id?: string;
  email: string;
  fullName?: string;
  name?: string;
  profileImage?: string;
  role?: 'Admin' | 'Editor' | 'Author' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  profileImage?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface UserSessionDto {
  id: string;
  userId?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  isCurrent?: boolean;
  createdAt: string;
  lastActiveAt?: string;
  expiresAt?: string;
}

export interface AuthResponseDto {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: UserProfileDto;
  data?: {
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
    user?: UserProfileDto;
  };
  tokenType?: string;
  expiresIn?: number;
}
