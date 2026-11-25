export type ArticleStatus = 'Draft' | 'AI Enhanced' | 'Published';

export interface Article {
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
