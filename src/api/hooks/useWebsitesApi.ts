import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websitesService } from '../services/websites.service';
import type {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteFilterParams,
} from '../types/website.dto';

export const WEBSITE_KEYS = {
  all: ['websites'] as const,
  list: (params?: WebsiteFilterParams) => ['websites', 'list', params] as const,
  detail: (id: string) => ['websites', 'detail', id] as const,
};

export function useWebsitesQuery(params?: WebsiteFilterParams) {
  return useQuery({
    queryKey: WEBSITE_KEYS.list(params),
    queryFn: () => websitesService.getWebsites(params),
  });
}

export function useWebsiteDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: WEBSITE_KEYS.detail(id),
    queryFn: () => websitesService.getWebsiteById(id),
    enabled: !!id && enabled,
  });
}

export function useCreateWebsiteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWebsiteDto) => websitesService.createWebsite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.all });
    },
  });
}

export function useUpdateWebsiteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebsiteDto }) =>
      websitesService.updateWebsite(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.all });
    },
  });
}

export function useDeleteWebsiteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => websitesService.deleteWebsite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.all });
    },
  });
}

export function useTestConnectionMutation() {
  return useMutation({
    mutationFn: (siteId: string) => websitesService.testConnection(siteId),
  });
}

export function useDiscoverContentTypesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId: string) => websitesService.discoverContentTypes(siteId),
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.detail(siteId) });
      queryClient.invalidateQueries({ queryKey: WEBSITE_KEYS.all });
    },
  });
}
