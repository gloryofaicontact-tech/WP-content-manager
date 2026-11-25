import type { ArticleStatus } from '../../types/article';

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  websiteId: string;
  postType: string;
  status?: ArticleStatus;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface ArticleQueryDto {
  websiteId?: string;
  postType?: string;
  status?: ArticleStatus | 'ALL';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface ArticleDto {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  websiteId: string;
  postType: string;
  status: ArticleStatus;
  categories: string[];
  tags: string[];
  featuredImage: string;
  wpPostId?: number;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhanceArticleDto {
  title?: string;
  content?: string;
  websiteId?: string;
  postType?: string;
}

export interface ContentSnapshotItemDto {
  id: string;
  websiteId: string;
  wpPostId: number;
  slug: string;
  title: string;
  wpStatus: string;
  wpUrl?: string;
  wpPublishedAt?: string;
  wpModifiedAt?: string;
  featuredMediaUrl?: string | null;
  workflowStatus: 'IMPORTED' | 'ENHANCING' | 'READY_FOR_REVIEW' | 'PUBLISHED' | string;
  createdAt: string;
  updatedAt: string;
  contentType?: {
    id?: string;
    slug: string;
    name: string;
    restNamespace: string;
    restBase: string;
  };
  website?: {
    id: string;
    name: string;
    url: string;
  };
  [key: string]: any;
}

export interface ContentSnapshotDetailDto extends ContentSnapshotItemDto {
  rawContent?: string;
  rawExcerpt?: string | null;
  featuredMediaId?: number | null;
  customFields?: {
    acf?: any[];
    meta?: Record<string, any>;
    [key: string]: any;
  };
  taxonomiesData?: any;
}

export interface ContentSnapshotsResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: {
    data: ContentSnapshotItemDto[];
    meta?: {
      total: number;
      lastPage: number;
      currentPage: number;
      perPage: number;
      prev: number | null;
      next: number | null;
    };
  };
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface ContentSnapshotDetailResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: ContentSnapshotDetailDto;
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface EnhanceArticleResponseDto {
  enhancedTitle: string;
  enhancedContent: string;
  suggestedExcerpt: string;
  suggestedCategories: string[];
  suggestedTags: string[];
}

export interface PublishArticleResponseDto {
  success: boolean;
  wpPostId: number;
  liveUrl: string;
  publishedAt: string;
}

export interface ProcessArticleDto {
  contentTypeSlug: string;
  rawDocument: string;
}

export interface ImageAssetDto {
  id: string;
  title: string;
  previewUrl: string;
  sourceUrl?: string;
  downloadUrl?: string;
  author?: string;
  width?: number;
  height?: number;
  provider?: string;
  [key: string]: any;
}

export interface ProcessedArticleImageItemDto {
  placeholderId?: string;
  position?: string;
  recommendedSearch?: string;
  fallbackSearch?: string;
  altText?: string;
  targetHeading?: string;
  selectedAsset?: ImageAssetDto | null;
  alternativeOptions?: ImageAssetDto[];
}

export interface ProcessedArticleDataDto {
  id: string;
  websiteId: string;
  contentTypeSlug: string;
  contentTypeName?: string;
  title: string;
  slug: string;
  focusKeyword?: string;
  metaDescription?: string;
  contentHtml: string;
  workflowStatus: string;
  wpStatus: string;
  featuredMediaUrl?: string | null;
  images?: ProcessedArticleImageItemDto[];
  categories?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  summaryNotes?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ProcessArticleResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: ProcessedArticleDataDto;
  meta?: {
    timestamp?: string;
    path?: string;
    [key: string]: any;
  };
}

export interface UpdateWebsiteArticleDto {
  title?: string;
  focusKeyword?: string;
  metaDescription?: string;
  contentHtml?: string;
  contentTypeSlug?: string;
  tags?: string[];
  status?: string;
  [key: string]: any;
}

export interface PublishWebsiteArticleDto {
  status: 'publish' | 'draft' | string;
}

export interface WebsiteArticlesResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: {
    data: ProcessedArticleDataDto[];
    meta?: {
      total?: number;
      totalItems?: number;
      lastPage?: number;
      totalPages?: number;
      currentPage?: number;
      perPage?: number;
      [key: string]: any;
    };
  };
  meta?: any;
}

export interface WebsiteArticleDetailResponseDto {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: ProcessedArticleDataDto;
  meta?: any;
}
