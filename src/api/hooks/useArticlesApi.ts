import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import type {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
  EnhanceArticleDto,
} from '../types/article.dto';

export const ARTICLE_KEYS = {
  all: (params?: ArticleQueryDto) => ['articles', params] as const,
  detail: (id: string) => ['articles', id] as const,
};

export function useArticlesQuery(params?: ArticleQueryDto) {
  return useQuery({
    queryKey: ARTICLE_KEYS.all(params),
    queryFn: () => articlesService.getArticles(params),
  });
}

export function useArticleDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ARTICLE_KEYS.detail(id),
    queryFn: () => articlesService.getArticleById(id),
    enabled: !!id && enabled,
  });
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArticleDto) => articlesService.createArticle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArticleDto }) =>
      articlesService.updateArticle(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useEnhanceArticleMutation() {
  return useMutation({
    mutationFn: (payload: EnhanceArticleDto) => articlesService.enhanceArticle(payload),
  });
}

export function usePublishArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesService.publishArticle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ARTICLE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
