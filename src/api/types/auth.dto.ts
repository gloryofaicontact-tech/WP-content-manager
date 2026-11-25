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
  role?: 'Admin' | 'Editor' | 'Author' | string;
  createdAt?: string;
  updatedAt?: string;
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
