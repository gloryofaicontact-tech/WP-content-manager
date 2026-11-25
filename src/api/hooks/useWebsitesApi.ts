import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websitesService } from '../services/websites.service';
import type { CreateWebsiteDto } from '../types/website.dto';

export const WEBSITE_KEYS = {
  all: ['websites'] as const,
  detail: (id: string) => ['websites', id] as const,
};

export function useWebsitesQuery() {
  return useQuery({
    queryKey: WEBSITE_KEYS.all,
    queryFn: () => websitesService.getWebsites(),
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
