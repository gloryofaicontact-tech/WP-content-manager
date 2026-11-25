/**
 * Centralized API Endpoints matching NestJS Controllers & Routes
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  WEBSITES: {
    BASE: '/websites',
    DETAIL: (id: string) => `/websites/${id}`,
    TEST_CONNECTION: (id: string) => `/websites/${id}/test-connection`,
    DISCOVER_TYPES: (id: string) => `/websites/${id}/content-types/discover`,
    CONTENT_TYPES: (websiteId: string) => `/websites/${websiteId}/content-types`,
    CONTENT_TYPE_DETAIL: (websiteId: string, slug: string) =>
      `/websites/${websiteId}/content-types/${slug}`,
    LIVE_CONTENT: (websiteId: string, contentTypeSlug: string) =>
      `/websites/${websiteId}/content/${contentTypeSlug}`,
    LIVE_CONTENT_ITEM: (websiteId: string, contentTypeSlug: string, wpPostId: number | string) =>
      `/websites/${websiteId}/content/${contentTypeSlug}/${wpPostId}`,
    INGEST_CONTENT: (websiteId: string, contentTypeSlug: string, wpPostId: number | string) =>
      `/websites/${websiteId}/content/${contentTypeSlug}/${wpPostId}/ingest`,
    PROCESS_ARTICLE: (websiteId: string) => `/websites/${websiteId}/articles/process`,
    ARTICLES: (websiteId: string) => `/websites/${websiteId}/articles`,
    ARTICLE_DETAIL: (websiteId: string, articleId: string) =>
      `/websites/${websiteId}/articles/${articleId}`,
    PUBLISH_ARTICLE: (websiteId: string, articleId: string) =>
      `/websites/${websiteId}/articles/${articleId}/publish`,
  },
  CONTENT_TYPES: {
    DISCOVER: '/content-types/discover',
  },
  ARTICLES: {
    BASE: '/articles',
    DETAIL: (id: string) => `/articles/${id}`,
    ENHANCE: (id: string) => `/articles/${id}/enhance`,
    ENHANCE_DRAFT: '/articles/enhance-draft',
    PUBLISH: (id: string) => `/articles/${id}/publish`,
    SNAPSHOTS: '/articles/snapshots',
    SNAPSHOT_DETAIL: (snapshotId: string) => `/articles/snapshots/${snapshotId}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    TEAM: '/users/team',
    INVITE: '/users/team/invite',
    REMOVE: (id: string) => `/users/team/${id}`,
  },
} as const;
