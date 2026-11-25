import type { ContentType } from '../../types/wordpress';

export interface CreateWebsiteDto {
  name: string;
  url: string;
  username: string;
  applicationPassword: string;
}

export interface UpdateWebsiteDto {
  name?: string;
  url?: string;
  username?: string;
  applicationPassword?: string;
}

export interface WebsiteFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface WebsiteDto {
  id: string;
  name: string;
  url: string;
  username: string;
  applicationPassword?: string;
  status: 'CONNECTED' | 'ERROR' | string;
  totalArticles?: number;
  lastScanned?: string;
  discoveredTypes?: ContentType[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginatedWebsitesResponseDto {
  data: WebsiteDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  items?: WebsiteDto[];
}

export interface TestConnectionResultDto {
  success: boolean;
  statusCode?: number;
  latencyMs?: number;
  message?: string;
  siteTitle?: string;
  wpVersion?: string;
  [key: string]: any;
}

export interface DiscoverContentTypesResultDto {
  siteId?: string;
  discoveredTypes: ContentType[];
  scannedAt?: string;
}
