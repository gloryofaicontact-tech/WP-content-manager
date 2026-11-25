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
