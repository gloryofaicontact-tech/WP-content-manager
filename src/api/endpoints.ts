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
    DISCOVER_TYPES: (id: string) => `/websites/${id}/discover`,
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
  },
  USERS: {
    PROFILE: '/users/profile',
    TEAM: '/users/team',
    INVITE: '/users/team/invite',
    REMOVE: (id: string) => `/users/team/${id}`,
  },
} as const;
