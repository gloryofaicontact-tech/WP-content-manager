import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleDto,
  ArticleQueryDto,
  EnhanceArticleDto,
  EnhanceArticleResponseDto,
  PublishArticleResponseDto,
  ProcessArticleDto,
  ProcessArticleResponseDto,
  UpdateWebsiteArticleDto,
  PublishWebsiteArticleDto,
  WebsiteArticlesResponseDto,
  WebsiteArticleDetailResponseDto,
  ProcessedArticleDataDto,
  ContentSnapshotsResponseDto,
  ContentSnapshotDetailDto,
  ContentSnapshotDetailResponseDto,
} from '../types/article.dto';

export const articlesService = {
  /**
   * GET /articles
   */
  async getArticles(params?: ArticleQueryDto): Promise<ArticleDto[]> {
    const response = await apiClient.get<ArticleDto[]>(API_ENDPOINTS.ARTICLES.BASE, {
      params,
    });
    return response.data;
  },

  /**
   * GET /articles/:id
   */
  async getArticleById(id: string): Promise<ArticleDto> {
    const response = await apiClient.get<ArticleDto>(API_ENDPOINTS.ARTICLES.DETAIL(id));
    return response.data;
  },

  /**
   * POST /articles
   */
  async createArticle(payload: CreateArticleDto): Promise<ArticleDto> {
    const response = await apiClient.post<ArticleDto>(API_ENDPOINTS.ARTICLES.BASE, payload);
    return response.data;
  },

  /**
   * PATCH /articles/:id
   */
  async updateArticle(id: string, payload: UpdateArticleDto): Promise<ArticleDto> {
    const response = await apiClient.patch<ArticleDto>(
      API_ENDPOINTS.ARTICLES.DETAIL(id),
      payload
    );
    return response.data;
  },

  /**
   * POST /articles/:id/enhance or POST /articles/enhance-draft
   */
  async enhanceArticle(payload: EnhanceArticleDto): Promise<EnhanceArticleResponseDto> {
    const response = await apiClient.post<EnhanceArticleResponseDto>(
      API_ENDPOINTS.ARTICLES.ENHANCE_DRAFT,
      payload
    );
    return response.data;
  },

  /**
   * POST /articles/:id/publish
   */
  async publishArticle(id: string): Promise<PublishArticleResponseDto> {
    const response = await apiClient.post<PublishArticleResponseDto>(
      API_ENDPOINTS.ARTICLES.PUBLISH(id)
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/articles/snapshots?workflowStatus=IMPORTED&page=1&limit=10
   */
  async getSnapshots(params?: {
    workflowStatus?: string;
    page?: number;
    limit?: number;
    websiteId?: string;
  }): Promise<ContentSnapshotsResponseDto> {
    const cleanParams: Record<string, any> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };

    const validEnums = ['IMPORTED', 'ENHANCING', 'READY_FOR_REVIEW', 'PUBLISHED'];
    if (params?.workflowStatus && validEnums.includes(params.workflowStatus.toUpperCase())) {
      cleanParams.workflowStatus = params.workflowStatus.toUpperCase();
    }

    if (params?.websiteId) {
      cleanParams.websiteId = params.websiteId;
    }

    const response = await apiClient.get<ContentSnapshotsResponseDto>(
      API_ENDPOINTS.ARTICLES.SNAPSHOTS,
      { params: cleanParams }
    );
    return response.data;
  },

  /**
   * GET {{baseUrl}}/articles/snapshots/{{snapshotId}}
   */
  async getSnapshotDetail(snapshotId: string): Promise<ContentSnapshotDetailDto> {
    const response = await apiClient.get<ContentSnapshotDetailResponseDto>(
      API_ENDPOINTS.ARTICLES.SNAPSHOT_DETAIL(snapshotId)
    );
    const resData: any = response.data;
    return resData?.data || resData;
  },

  /**
   * DELETE {{baseUrl}}/articles/snapshots/{{snapshotId}}
   */
  async deleteSnapshot(snapshotId: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.ARTICLES.SNAPSHOT_DETAIL(snapshotId)
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
