import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteFilterParams,
  WebsiteDto,
  PaginatedWebsitesResponseDto,
  TestConnectionResultDto,
  DiscoverContentTypesResultDto,
} from '../types/website.dto';

export const websitesService = {
  /**
   * POST {{baseUrl}}/websites
   * Body:
   * {
   *   "name": "My Tech Blog",
   *   "url": "https://example.com",
   *   "username": "wp_admin",
   *   "applicationPassword": "xxxx xxxx xxxx xxxx xxxx xxxx"
   * }
   */
  async createWebsite(data: CreateWebsiteDto): Promise<WebsiteDto> {
    const response = await apiClient.post<WebsiteDto | { data: WebsiteDto }>(
      API_ENDPOINTS.WEBSITES.BASE,
      data
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * GET {{baseUrl}}/websites?page=1&limit=10
   */
  async getWebsites(params?: WebsiteFilterParams): Promise<PaginatedWebsitesResponseDto> {
    const response = await apiClient.get<PaginatedWebsitesResponseDto | WebsiteDto[]>(
      API_ENDPOINTS.WEBSITES.BASE,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        },
      }
    );

    const raw: any = response.data;
    if (Array.isArray(raw)) {
      return {
        data: raw,
        total: raw.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      };
    }

    if (raw && Array.isArray(raw.data)) {
      return raw;
    }

    if (raw && Array.isArray(raw.items)) {
      return {
        data: raw.items,
        total: raw.total ?? raw.items.length,
        page: raw.page ?? params?.page ?? 1,
        limit: raw.limit ?? params?.limit ?? 10,
        totalPages: raw.totalPages,
      };
    }

    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}
   */
  async getWebsiteById(id: string): Promise<WebsiteDto> {
    const response = await apiClient.get<WebsiteDto | { data: WebsiteDto }>(
      API_ENDPOINTS.WEBSITES.DETAIL(id)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * POST {{baseUrl}}/websites/{{websiteId}}/test-connection
   */
  async testConnection(id: string): Promise<TestConnectionResultDto> {
    const response = await apiClient.post<TestConnectionResultDto | { data: TestConnectionResultDto }>(
      API_ENDPOINTS.WEBSITES.TEST_CONNECTION(id)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * PATCH {{baseUrl}}/websites/{{websiteId}}
   */
  async updateWebsite(id: string, data: UpdateWebsiteDto): Promise<WebsiteDto> {
    const response = await apiClient.patch<WebsiteDto | { data: WebsiteDto }>(
      API_ENDPOINTS.WEBSITES.DETAIL(id),
      data
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * DELETE {{baseUrl}}/websites/{{websiteId}}
   */
  async deleteWebsite(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.WEBSITES.DETAIL(id)
    );
    return response.data;
  },

  /**
   * POST {{baseUrl}}/websites/{{websiteId}}/discover
   */
  async discoverContentTypes(id: string): Promise<DiscoverContentTypesResultDto> {
    const response = await apiClient.post<DiscoverContentTypesResultDto | { data: DiscoverContentTypesResultDto }>(
      API_ENDPOINTS.WEBSITES.DISCOVER_TYPES(id)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },
};
