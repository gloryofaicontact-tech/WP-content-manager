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

export interface DiscoveredContentTypeItemDto {
  id: string;
  websiteId: string;
  slug: string;
  name: string;
  description?: string | null;
  restNamespace: string;
  restBase: string;
  hierarchical: boolean;
  taxonomies: string[] | any[];
  schemaStatus?: string;
  isActive?: boolean;
  lastDiscoveredAt?: string;
  [key: string]: any;
}

export interface DiscoverContentTypesResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: DiscoveredContentTypeItemDto[];
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface ContentTypeTaxonomyDto {
  name: string;
  slug: string;
  hierarchical: boolean;
  [key: string]: any;
}

export interface ContentTypeDetailDto {
  id: string;
  websiteId: string;
  slug: string;
  name: string;
  description?: string | null;
  restNamespace: string;
  restBase: string;
  hierarchical: boolean;
  supports?: string[];
  taxonomies?: ContentTypeTaxonomyDto[];
  acfFields?: any[];
  schemaStatus?: string;
  isActive?: boolean;
  lastDiscoveredAt?: string;
  [key: string]: any;
}

export interface ContentTypeDetailResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: ContentTypeDetailDto;
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface LiveContentRecordDto {
  id: number | string;
  slug: string;
  title: string;
  status: string;
  date: string;
  modified?: string;
  link?: string;
  excerpt?: string;
  featuredMedia?: {
    id: number;
    sourceUrl: string;
    altText?: string;
  } | null;
  author?: any;
  hasSnapshot?: boolean;
  workflowStatus?: string | null;
  snapshotUpdatedAt?: string | null;
  [key: string]: any;
}

export interface LiveContentPaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LiveContentResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: {
    data: LiveContentRecordDto[];
    meta?: {
      contentType?: {
        slug: string;
        name: string;
        restNamespace: string;
        restBase: string;
      };
      pagination?: LiveContentPaginationMeta;
      [key: string]: any;
    };
  };
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface DiscoverContentTypesResultDto {
  siteId?: string;
  discoveredTypes: ContentType[];
  scannedAt?: string;
}
