import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteFilterParams,
  WebsiteDto,
  PaginatedWebsitesResponseDto,
  TestConnectionResultDto,
  DiscoverContentTypesResponseDto,
  ContentTypeDetailResponseDto,
  ContentTypeDetailDto,
  LiveContentResponseDto,
} from '../types/website.dto';
import type {
  ProcessArticleDto,
  ProcessArticleResponseDto,
  UpdateWebsiteArticleDto,
  PublishWebsiteArticleDto,
  WebsiteArticlesResponseDto,
  WebsiteArticleDetailResponseDto,
  ProcessedArticleDataDto,
} from '../types/article.dto';

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
    const response = await apiClient.get<any>(
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

    // Case 1: Direct Array [ { id, name, ... }, ... ]
    if (Array.isArray(raw)) {
      return {
        data: raw,
        total: raw.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      };
    }

    // Case 2: Standard NestJS wrapper { data: [ ... ], total, page, ... }
    if (raw && Array.isArray(raw.data)) {
      return {
        data: raw.data,
        total: raw.total ?? raw.data.length,
        page: raw.page ?? params?.page ?? 1,
        limit: raw.limit ?? params?.limit ?? 10,
        totalPages: raw.totalPages,
      };
    }

    // Case 3: NestJS pagination { items: [ ... ], meta: { totalItems, ... } }
    if (raw && Array.isArray(raw.items)) {
      return {
        data: raw.items,
        total: raw.meta?.totalItems ?? raw.total ?? raw.items.length,
        page: raw.meta?.currentPage ?? raw.page ?? params?.page ?? 1,
        limit: raw.meta?.itemsPerPage ?? raw.limit ?? params?.limit ?? 10,
        totalPages: raw.meta?.totalPages ?? raw.totalPages,
      };
    }

    // Case 4: Nested under data.items or data.data (e.g. { data: { items: [...] } })
    if (raw && raw.data && Array.isArray(raw.data.items)) {
      return {
        data: raw.data.items,
        total: raw.data.total ?? raw.data.meta?.totalItems ?? raw.data.items.length,
        page: raw.data.page ?? params?.page ?? 1,
        limit: raw.data.limit ?? params?.limit ?? 10,
      };
    }
    if (raw && raw.data && Array.isArray(raw.data.data)) {
      return {
        data: raw.data.data,
        total: raw.data.total ?? raw.data.data.length,
        page: raw.data.page ?? params?.page ?? 1,
        limit: raw.data.limit ?? params?.limit ?? 10,
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
   * POST {{baseUrl}}/websites/{{websiteId}}/content-types/discover
   */
  async discoverContentTypes(id: string): Promise<DiscoverContentTypesResponseDto> {
    const response = await apiClient.post<DiscoverContentTypesResponseDto>(
      API_ENDPOINTS.WEBSITES.DISCOVER_TYPES(id)
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/content-types
   */
  async getContentTypes(websiteId: string): Promise<DiscoverContentTypesResponseDto> {
    const response = await apiClient.get<DiscoverContentTypesResponseDto>(
      API_ENDPOINTS.WEBSITES.CONTENT_TYPES(websiteId)
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/content-types/{{contentTypeSlug}}
   */
  async getContentTypeDetail(
    websiteId: string,
    slug: string
  ): Promise<ContentTypeDetailDto> {
    const response = await apiClient.get<ContentTypeDetailResponseDto>(
      API_ENDPOINTS.WEBSITES.CONTENT_TYPE_DETAIL(websiteId, slug)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/content/{{contentTypeSlug}}?page=1&limit=10&search=xxx
   */
  async getLiveContent(
    websiteId: string,
    contentTypeSlug: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<LiveContentResponseDto> {
    const response = await apiClient.get<LiveContentResponseDto>(
      API_ENDPOINTS.WEBSITES.LIVE_CONTENT(websiteId, contentTypeSlug),
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
        },
      }
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/content/{{contentTypeSlug}}/{{wpPostId}}
   */
  async getLiveContentItem(
    websiteId: string,
    contentTypeSlug: string,
    wpPostId: number | string
  ): Promise<any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.WEBSITES.LIVE_CONTENT_ITEM(websiteId, contentTypeSlug, wpPostId)
    );
    const resData = response.data;
    return resData?.data || resData;
  },

  /**
   * POST {{baseUrl}}/websites/{{websiteId}}/content/{{contentTypeSlug}}/{{wpPostId}}/ingest
   */
  async ingestContent(
    websiteId: string,
    contentTypeSlug: string,
    wpPostId: number | string
  ): Promise<any> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.WEBSITES.INGEST_CONTENT(websiteId, contentTypeSlug, wpPostId)
    );
    return response.data;
  },

  /**
   * POST {{baseUrl}}/websites/{{websiteId}}/articles/process
   */
  async processArticle(
    websiteId: string,
    payload: ProcessArticleDto
  ): Promise<ProcessArticleResponseDto> {
    const response = await apiClient.post<ProcessArticleResponseDto>(
      API_ENDPOINTS.WEBSITES.PROCESS_ARTICLE(websiteId),
      payload,
      {
        timeout: 120000, // 2 minutes for LLM extraction + Envato stock discovery
      }
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/articles?page=1&limit=10
   */
  async getWebsiteArticles(
    websiteId: string,
    params?: { page?: number; limit?: number; workflowStatus?: string; status?: string; search?: string }
  ): Promise<WebsiteArticlesResponseDto | any> {
    const cleanParams: Record<string, any> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };

    // Valid Prisma WorkflowStatus enum values: IMPORTED, ENHANCING, READY_FOR_REVIEW, PUBLISHED
    const validEnums = ['IMPORTED', 'ENHANCING', 'READY_FOR_REVIEW', 'PUBLISHED'];
    if (params?.workflowStatus && validEnums.includes(params.workflowStatus.toUpperCase())) {
      cleanParams.workflowStatus = params.workflowStatus.toUpperCase();
    }

    if (params?.status && ['draft', 'publish'].includes(params.status.toLowerCase())) {
      cleanParams.status = params.status.toLowerCase();
    }

    if (params?.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }

    const response = await apiClient.get<any>(
      API_ENDPOINTS.WEBSITES.ARTICLES(websiteId),
      { params: cleanParams }
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/websites/{{websiteId}}/articles/{{articleId}}
   */
  async getWebsiteArticleDetail(
    websiteId: string,
    articleId: string
  ): Promise<ProcessedArticleDataDto> {
    const response = await apiClient.get<WebsiteArticleDetailResponseDto>(
      API_ENDPOINTS.WEBSITES.ARTICLE_DETAIL(websiteId, articleId)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * PATCH {{baseUrl}}/websites/{{websiteId}}/articles/{{articleId}}
   */
  async updateWebsiteArticle(
    websiteId: string,
    articleId: string,
    payload: UpdateWebsiteArticleDto
  ): Promise<ProcessedArticleDataDto> {
    const response = await apiClient.patch<WebsiteArticleDetailResponseDto>(
      API_ENDPOINTS.WEBSITES.ARTICLE_DETAIL(websiteId, articleId),
      payload
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * POST {{baseUrl}}/websites/{{websiteId}}/articles/{{articleId}}/publish
   * Toggle switch between "publish" and "draft"
   */
  async publishWebsiteArticle(
    websiteId: string,
    articleId: string,
    payload: PublishWebsiteArticleDto = { status: 'publish' }
  ): Promise<any> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.WEBSITES.PUBLISH_ARTICLE(websiteId, articleId),
      payload
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * DELETE {{baseUrl}}/websites/{{websiteId}}/articles/{{articleId}}
   */
  async deleteWebsiteArticle(
    websiteId: string,
    articleId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.WEBSITES.ARTICLE_DETAIL(websiteId, articleId)
    );
    return response.data;
  },
};
