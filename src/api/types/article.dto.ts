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
