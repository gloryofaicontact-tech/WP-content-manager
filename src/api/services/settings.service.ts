import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AiSettingsDataDto,
  AiSettingsResponseDto,
  UpdateAiSettingsDto,
  TestAiProviderDto,
  TestAiProviderResponseDto,
} from '../types/settings.dto';

export const settingsService = {
  /**
   * GET {{baseUrl}}/settings/ai
   * Retrieves configured AI providers, active provider, and Envato media token status
   */
  async getAiSettings(): Promise<AiSettingsDataDto> {
    const response = await apiClient.get<AiSettingsResponseDto | any>(API_ENDPOINTS.SETTINGS.AI);
    // Unwraps { success: true, data: { ... } } or direct object
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  /**
   * PUT {{baseUrl}}/settings/ai
   * Updates active provider and API keys/tokens
   */
  async updateAiSettings(payload: UpdateAiSettingsDto): Promise<any> {
    const response = await apiClient.put(API_ENDPOINTS.SETTINGS.AI, payload);
    return response.data;
  },

  /**
   * POST {{baseUrl}}/settings/ai/test
   * Tests connectivity and key validity for a given provider ('openai' | 'claude' | 'gemini')
   */
  async testAiProvider(payload: TestAiProviderDto): Promise<TestAiProviderResponseDto> {
    const response = await apiClient.post<TestAiProviderResponseDto>(
      API_ENDPOINTS.SETTINGS.TEST_AI,
      payload
    );
    return response.data;
  },
};
