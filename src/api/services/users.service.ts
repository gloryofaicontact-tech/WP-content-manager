import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { UserProfileDto } from '../types/auth.dto';

export const usersService = {
  /**
   * PATCH /users/profile
   */
  async updateProfile(payload: Partial<UserProfileDto>): Promise<UserProfileDto> {
    const response = await apiClient.patch<UserProfileDto>(API_ENDPOINTS.USERS.PROFILE, payload);
    return response.data;
  },

  /**
   * GET /users/team
   */
  async getTeam(): Promise<UserProfileDto[]> {
    const response = await apiClient.get<UserProfileDto[]>(API_ENDPOINTS.USERS.TEAM);
    return response.data;
  },

  /**
   * POST /users/team/invite
   */
  async inviteMember(payload: { email: string; role: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.USERS.INVITE, payload);
  },

  /**
   * DELETE /users/team/:id
   */
  async removeMember(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.REMOVE(id));
  },
};
