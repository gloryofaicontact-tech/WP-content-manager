import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteDto,
  TestConnectionResultDto,
  DiscoverContentTypesResultDto,
} from '../types/website.dto';

export const websitesService = {
  /**
   * GET /websites
   */
  async getWebsites(): Promise<WebsiteDto[]> {
    const response = await apiClient.get<WebsiteDto[]>(API_ENDPOINTS.WEBSITES.BASE);
    return response.data;
  },

  /**
   * GET /websites/:id
   */
  async getWebsiteById(id: string): Promise<WebsiteDto> {
    const response = await apiClient.get<WebsiteDto>(API_ENDPOINTS.WEBSITES.DETAIL(id));
    return response.data;
  },

  /**
   * POST /websites
   */
  async createWebsite(payload: CreateWebsiteDto): Promise<WebsiteDto> {
    const response = await apiClient.post<WebsiteDto>(API_ENDPOINTS.WEBSITES.BASE, payload);
    return response.data;
  },

  /**
   * PUT or PATCH /websites/:id
   */
  async updateWebsite(id: string, payload: UpdateWebsiteDto): Promise<WebsiteDto> {
    const response = await apiClient.patch<WebsiteDto>(API_ENDPOINTS.WEBSITES.DETAIL(id), payload);
    return response.data;
  },

  /**
   * POST /websites/:id/test-connection
   */
  async testConnection(id: string): Promise<TestConnectionResultDto> {
    const response = await apiClient.post<TestConnectionResultDto>(
      API_ENDPOINTS.WEBSITES.TEST_CONNECTION(id)
    );
    return response.data;
  },

  /**
   * POST /websites/:id/discover
   */
  async discoverContentTypes(id: string): Promise<DiscoverContentTypesResultDto> {
    const response = await apiClient.post<DiscoverContentTypesResultDto>(
      API_ENDPOINTS.WEBSITES.DISCOVER_TYPES(id)
    );
    return response.data;
  },
};
