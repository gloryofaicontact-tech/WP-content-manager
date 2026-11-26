import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface ApiKeyItemDto {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponseDto extends ApiKeyItemDto {
  key: string;
}

export const apiKeysService = {
  async list(): Promise<ApiKeyItemDto[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.API_KEYS.BASE);
    const resData = response.data;
    return Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
  },

  async create(name: string): Promise<CreateApiKeyResponseDto> {
    const response = await apiClient.post<any>(API_ENDPOINTS.API_KEYS.BASE, { name });
    const resData = response.data;
    return resData?.data || resData;
  },

  async revoke(id: string): Promise<{ success: boolean; id: string }> {
    const response = await apiClient.delete<any>(API_ENDPOINTS.API_KEYS.DETAIL(id));
    const resData = response.data;
    return resData?.data || resData;
  },
};
