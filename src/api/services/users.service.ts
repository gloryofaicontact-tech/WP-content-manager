import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { UpdateUserProfileDto, UserProfileDto } from '../types/auth.dto';

export const usersService = {
  /**
   * PATCH/PUT/POST {{baseUrl}}/users/profile-update
   * Payload: { fullName: string, profileImage: string }
   */
  async updateProfile(payload: UpdateUserProfileDto): Promise<UserProfileDto | any> {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USERS.PROFILE_UPDATE, payload);
      return response.data?.data || response.data;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const resPut = await apiClient.put(API_ENDPOINTS.USERS.PROFILE_UPDATE, payload);
          return resPut.data?.data || resPut.data;
        } catch (err2: any) {
          if (err2.response?.status === 404 || err2.response?.status === 405) {
            const resPost = await apiClient.post(API_ENDPOINTS.USERS.PROFILE_UPDATE, payload);
            return resPost.data?.data || resPost.data;
          }
          throw err2;
        }
      }
      throw err;
    }
  },

  /**
   * DELETE/POST {{baseUrl}}/users/profile-delete
   */
  async deleteProfile(): Promise<any> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.PROFILE_DELETE);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        const resPost = await apiClient.post(API_ENDPOINTS.USERS.PROFILE_DELETE);
        return resPost.data;
      }
      throw err;
    }
  },
};
