export interface LoginDto {
  email: string;
  password: string;
  deviceName?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Editor' | 'Author';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: UserProfileDto;
  tokenType?: string;
  expiresIn?: number;
}
