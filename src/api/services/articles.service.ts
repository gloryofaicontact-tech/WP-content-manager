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
    const response = await apiClient.get<ContentSnapshotsResponseDto>(
      API_ENDPOINTS.ARTICLES.SNAPSHOTS,
      {
        params: {
          workflowStatus: params?.workflowStatus || undefined,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          websiteId: params?.websiteId || undefined,
        },
      }
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
};
