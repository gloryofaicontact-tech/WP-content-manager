import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { Article } from '../types/article';
import { useApp } from './AppContext';
import { websitesService } from '../api/services/websites.service';

interface ArticleFilters {
  postType: string;
  status: string;
  searchQuery: string;
}

interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ArticleContextType {
  articles: Article[];
  isLoadingArticles: boolean;
  loadLiveArticles: (
    overrideWebsiteId?: string,
    overrideContentType?: string,
    overrideSearch?: string,
    overridePage?: number
  ) => Promise<void>;
  ingestArticle: (websiteId: string, contentTypeSlug: string, wpPostId: number | string) => Promise<boolean>;
  filters: ArticleFilters;
  setFilters: React.Dispatch<React.SetStateAction<ArticleFilters>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  goToPage: (page: number) => void;
  filteredArticles: Article[];
  addArticle: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  publishArticleToWP: (id: string) => void;
  stats: {
    totalWebsites: number;
    totalArticles: number;
    published: number;
    drafts: number;
  };
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast, sites, activeSiteId } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(false);
  const [filters, setFilters] = useState<ArticleFilters>({
    postType: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Load live content from GET /websites/:websiteId/content/:contentTypeSlug?page=xxx&limit=xxx&search=xxx
  const loadLiveArticles = async (
    overrideWebsiteId?: string,
    overrideContentType?: string,
    overrideSearch?: string,
    overridePage?: number
  ) => {
    // Only use active website from navbar or override
    const targetSiteId = overrideWebsiteId || activeSiteId || sites[0]?.id;

    if (!targetSiteId) {
      setArticles([]);
      setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 1 }));
      return;
    }

    const currentSite = sites.find(s => s.id === targetSiteId);
    const availableTypes = currentSite?.discoveredTypes || [];
    
    // Determine post types to fetch
    let typeSlugsToFetch: string[] = [];
    const chosenType = overrideContentType !== undefined ? overrideContentType : filters.postType;

    if (chosenType && chosenType !== 'ALL') {
      typeSlugsToFetch = [chosenType];
    } else if (availableTypes.length > 0) {
      typeSlugsToFetch = availableTypes.map(t => t.slug);
    } else {
      typeSlugsToFetch = ['post'];
    }

    const searchParam = overrideSearch !== undefined ? overrideSearch : filters.searchQuery;
    const targetPage = overridePage !== undefined ? overridePage : pagination.page;

    setIsLoadingArticles(true);
    try {
      let aggregatedTotal = 0;
      let calculatedTotalPages = 1;

      const recordsPerType = await Promise.all(
        typeSlugsToFetch.map(async slug => {
          try {
            const res = await websitesService.getLiveContent(targetSiteId, slug, {
              page: targetPage,
              limit: pagination.limit,
              search: searchParam.trim() || undefined,
            });
            const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
            const paginationMeta = res?.data?.meta?.pagination;
            if (paginationMeta) {
              aggregatedTotal += paginationMeta.totalItems || list.length;
              calculatedTotalPages = Math.max(calculatedTotalPages, paginationMeta.totalPages || 1);
            } else {
              aggregatedTotal += list.length;
            }
            
            return list.map((item: any) => ({
              id: String(item.id),
              title: item.title?.rendered || item.title || 'Untitled Record',
              content: item.content?.rendered || item.excerpt?.rendered || item.excerpt || '',
              excerpt: item.excerpt?.rendered || item.excerpt || '',
              websiteId: targetSiteId,
              postType: slug,
              status: item.status === 'publish' ? 'Published' : (item.status === 'draft' ? 'Draft' : (item.status || 'Draft')),
              categories: [],
              tags: [],
              featuredImage: item.featuredMedia?.sourceUrl || '',
              wpPostId: typeof item.id === 'number' ? item.id : undefined,
              liveUrl: item.link || '',
              hasSnapshot: !!item.hasSnapshot,
              workflowStatus: item.workflowStatus || null,
              createdAt: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
              updatedAt: item.modified ? item.modified.split('T')[0] : new Date().toISOString().split('T')[0],
            }));
          } catch {
            return [];
          }
        })
      );

      const flattened = recordsPerType.flat();
      setArticles(flattened);
      setPagination(prev => ({
        ...prev,
        page: targetPage,
        totalItems: aggregatedTotal || flattened.length,
        totalPages: Math.max(1, calculatedTotalPages || Math.ceil(flattened.length / prev.limit)),
      }));
    } catch {
      setArticles([]);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && (pagination.totalPages <= 1 || newPage <= pagination.totalPages)) {
      setPagination(prev => ({ ...prev, page: newPage }));
      loadLiveArticles(undefined, undefined, undefined, newPage);
    }
  };

  // Ingest content snapshot via POST /websites/:websiteId/content/:contentTypeSlug/:wpPostId/ingest
  const ingestArticle = async (
    websiteId: string,
    contentTypeSlug: string,
    wpPostId: number | string
  ): Promise<boolean> => {
    try {
      addToast({
        title: 'Ingesting Content...',
        message: `Creating workflow snapshot for post #${wpPostId}...`,
        type: 'info',
      });
      await websitesService.ingestContent(websiteId, contentTypeSlug, wpPostId);
      addToast({
        title: 'Content Ingested',
        message: `Post #${wpPostId} has been snapshotted into the pipeline.`,
        type: 'success',
      });
      // Mark as snapshotted locally
      setArticles(prev =>
        prev.map(a =>
          a.websiteId === websiteId && a.wpPostId === wpPostId
            ? { ...a, hasSnapshot: true }
            : a
        )
      );
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to ingest content snapshot.';
      addToast({
        title: 'Ingestion Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      return false;
    }
  };

  // Re-fetch live articles when active website (from navbar) or postType changes
  useEffect(() => {
    if (activeSiteId) {
      loadLiveArticles(activeSiteId, filters.postType, filters.searchQuery, 1);
    }
  }, [activeSiteId, filters.postType]);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      // Filter by status if specified
      if (filters.status !== 'ALL') {
        if (filters.status.toLowerCase() !== art.status.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [articles, filters.status]);

  const stats = useMemo(() => {
    return {
      totalWebsites: sites.length,
      totalArticles: articles.length,
      published: articles.filter(a => a.status === 'Published').length,
      drafts: articles.filter(a => a.status !== 'Published').length,
    };
  }, [sites, articles]);

  const addArticle = (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticle: Article = {
      ...data,
      id: 'art-' + (articles.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setArticles(prev => [newArticle, ...prev]);
    addToast({
      title: 'Article Created',
      message: `"${newArticle.title}" saved as ${newArticle.status}.`,
      type: 'success',
    });
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
  };

  const publishArticleToWP = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    const site = sites.find(s => s.id === art.websiteId) || sites[0];
    const generatedId = Math.floor(140 + Math.random() * 80);
    const slug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const liveUrl = `${site.url}/${slug}/`;

    addToast({
      title: 'Publishing to WordPress...',
      message: `Creating live post on ${site.url} via REST API...`,
      type: 'info',
    });

    setTimeout(() => {
      setArticles(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                status: 'Published',
                wpPostId: generatedId,
                liveUrl,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : a
        )
      );

      addToast({
        title: 'Published to WordPress!',
        message: `Post #${generatedId} is now live on ${site.name}`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <ArticleContext.Provider
      value={{
        articles,
        isLoadingArticles,
        loadLiveArticles,
        ingestArticle,
        filters,
        setFilters,
        pagination,
        setPagination,
        goToPage,
        filteredArticles,
        addArticle,
        updateArticle,
        publishArticleToWP,
        stats,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) throw new Error('useArticles must be used within ArticleProvider');
  return context;
};
