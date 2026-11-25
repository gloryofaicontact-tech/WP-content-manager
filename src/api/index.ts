/**
 * Barrel Export for API Layer
 * Clean imports: import { authService, useLoginMutation, apiClient } from '@/api';
 */

// HTTP Client & Endpoints
export * from './client';
export * from './endpoints';

// DTO Contracts (Matching NestJS)
export * from './types/common.dto';
export * from './types/auth.dto';
export * from './types/website.dto';
export * from './types/article.dto';

// Pure Services (Axios HTTP Calls)
export * from './services/auth.service';
export * from './services/websites.service';
export * from './services/articles.service';
export * from './services/users.service';

// React Query Hooks
export * from './hooks/useAuthApi';
export * from './hooks/useWebsitesApi';
export * from './hooks/useArticlesApi';
