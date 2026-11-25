import React, { useState, useEffect } from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { websitesService } from '../../../api/services/websites.service';
import { articlesService } from '../../../api/services/articles.service';
import type { ProcessedArticleDataDto } from '../../../api/types/article.dto';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { LiveArticleDetailModal } from './LiveArticleDetailModal';
import { WebsiteArticleEditModal } from './WebsiteArticleEditModal';
import {
  Plus,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Trash2,
  FileText,
} from 'lucide-react';

export const ArticlesListScreen: React.FC = () => {
  const {
    filteredArticles,
    isLoadingArticles,
    loadLiveArticles,
    ingestArticle,
    filters,
    setFilters,
    pagination,
    goToPage,
    refreshActiveSiteArticlesCount,
  } = useArticles();
  const { sites, activeSiteId, navigateToNewArticle, addToast } = useApp();

  // Active website is driven strictly by top navbar
  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0];
  const availableTypes = activeSite ? activeSite.discoveredTypes : [];

  // 2 Streamlined Navigation Tabs: 'website-articles' | 'live'
  const [activeTab, setActiveTab] = useState<'website-articles' | 'live'>('website-articles');

  // Search input for live tab
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Single Live Content Modal state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [ingestingId, setIngestingId] = useState<number | string | null>(null);

  // -------------------------------------------------------------
  // TAB 1: Website Articles State (Drafts & Published)
  // GET {{baseUrl}}/websites/:websiteId/articles?page=1&limit=10
  // -------------------------------------------------------------
  const [websiteArticles, setWebsiteArticles] = useState<ProcessedArticleDataDto[]>([]);
  const [isLoadingWebsiteArticles, setIsLoadingWebsiteArticles] = useState(false);
  const [websiteArticleStatusFilter, setWebsiteArticleStatusFilter] = useState<string>('ALL');
  const [websiteArticleSearchInput, setWebsiteArticleSearchInput] = useState<string>('');
  const [websiteArticlesPagination, setWebsiteArticlesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });

  // Website Article Detail / Edit Modal
  const [selectedWebsiteArticleId, setSelectedWebsiteArticleId] = useState<string | null>(null);
  const [isWebsiteArticleModalOpen, setIsWebsiteArticleModalOpen] = useState<boolean>(false);
  const [togglingArticleId, setTogglingArticleId] = useState<string | null>(null);
  const [deletingWebsiteArticleId, setDeletingWebsiteArticleId] = useState<string | null>(null);

  // Load Website Articles: GET /websites/:websiteId/articles
  const loadWebsiteArticles = async (
    page = websiteArticlesPagination.page,
    status = websiteArticleStatusFilter,
    search = websiteArticleSearchInput
  ) => {
    if (!activeSite?.id) return;
    setIsLoadingWebsiteArticles(true);
    try {
      // Map filter selection cleanly without restricting workflowStatus to IMPORTED
      let mappedStatus: string | undefined = undefined;
      let mappedWorkflowStatus: string | undefined = undefined;

      if (status === 'draft') {
        mappedStatus = 'draft';
      } else if (status === 'publish' || status === 'PUBLISHED') {
        mappedWorkflowStatus = 'PUBLISHED';
        mappedStatus = 'publish';
      } else if (['IMPORTED', 'ENHANCING', 'READY_FOR_REVIEW'].includes(status.toUpperCase())) {
        mappedWorkflowStatus = status.toUpperCase();
      }

      console.log('[loadWebsiteArticles] Fetching articles for site:', activeSite.id, {
        page,
        status,
        mappedWorkflowStatus,
        mappedStatus,
      });

      // Call primary endpoint: GET /websites/:websiteId/articles
      const res = await websitesService.getWebsiteArticles(activeSite.id, {
        page,
        limit: 10,
        workflowStatus: mappedWorkflowStatus,
        status: mappedStatus,
        search: search.trim() || undefined,
      });

      console.log('[loadWebsiteArticles] Primary response:', res);

      // Robust multi-key extractor for arrays
      const extractList = (raw: any): any[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw !== 'object') return [];

        const d = raw.data;
        if (Array.isArray(d)) return d;
        if (d && typeof d === 'object') {
          if (Array.isArray(d.data)) return d.data;
          if (Array.isArray(d.articles)) return d.articles;
          if (Array.isArray(d.items)) return d.items;
          if (Array.isArray(d.records)) return d.records;
          if (Array.isArray(d.results)) return d.results;
          if (Array.isArray(d.content)) return d.content;
          if (Array.isArray(d.rows)) return d.rows;
          if (Array.isArray(d.list)) return d.list;
        }

        if (Array.isArray(raw.articles)) return raw.articles;
        if (Array.isArray(raw.items)) return raw.items;
        if (Array.isArray(raw.records)) return raw.records;
        if (Array.isArray(raw.results)) return raw.results;
        if (Array.isArray(raw.list)) return raw.list;

        return [];
      };

      let list = extractList(res);
      let total =
        (res?.data && typeof res.data === 'object' && typeof res.data.total === 'number' && res.data.total) ||
        (res?.data && typeof res.data === 'object' && typeof res.data.totalItems === 'number' && res.data.totalItems) ||
        (res?.data && typeof res.data === 'object' && res.data.meta?.total) ||
        (res?.data && typeof res.data === 'object' && res.data.meta?.totalItems) ||
        (res as any)?.meta?.total ||
        (res as any)?.meta?.totalItems ||
        (res as any)?.total ||
        list.length;

      // Smart Fallback: If primary returned empty, also check GET /articles?websiteId=:id
      if (list.length === 0 && (!search || !search.trim())) {
        try {
          const fallbackRes = await articlesService.getArticles({
            websiteId: activeSite.id,
            page,
            limit: 10,
          });
          const fallbackList = extractList(fallbackRes);
          if (fallbackList.length > 0) {
            console.log('[loadWebsiteArticles] Fallback /articles returned:', fallbackList);
            list = fallbackList;
            total = fallbackList.length;
          }
        } catch {
          // Ignore fallback error
        }
      }

      // Normalize all items to ensure consistent ProcessedArticleDataDto shape
      const normalizedList: ProcessedArticleDataDto[] = list.map((item: any, idx: number) => ({
        id: String(item.id || item._id || `art-${idx + 1}`),
        websiteId: item.websiteId || activeSite.id,
        contentTypeSlug:
          item.contentTypeSlug || item.contentType?.slug || item.postType || 'post',
        contentTypeName:
          item.contentTypeName || item.contentType?.name || item.contentTypeSlug || 'Article',
        title: typeof item.title === 'object' ? item.title.rendered : (item.title || 'Untitled Article'),
        slug: item.slug || (typeof item.title === 'string' ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'article'),
        focusKeyword: item.focusKeyword || item.targetKeyword || '',
        metaDescription: item.metaDescription || item.excerpt || '',
        contentHtml: item.contentHtml || item.rawContent || (typeof item.content === 'object' ? item.content.rendered : item.content) || '',
        workflowStatus: item.workflowStatus || (item.wpStatus === 'publish' || item.status === 'publish' ? 'PUBLISHED' : 'READY_FOR_REVIEW'),
        wpStatus: (item.wpStatus || item.status || 'draft').toLowerCase(),
        featuredMediaUrl: item.featuredMediaUrl || item.featuredImage || item.featuredMedia?.sourceUrl || null,
        images: Array.isArray(item.images) ? item.images : [],
        createdAt: item.createdAt || item.date || new Date().toISOString(),
        updatedAt: item.updatedAt || item.modified || new Date().toISOString(),
        publishedUrl: item.publishedUrl || item.wpUrl || item.link || null,
      }));

      // Apply client-side filter if specific status is selected
      let filteredList = normalizedList;
      if (status === 'draft') {
        filteredList = normalizedList.filter(a => {
          const s = (a.wpStatus || '').toLowerCase();
          const ws = (a.workflowStatus || '').toUpperCase();
          return s === 'draft' || ws !== 'PUBLISHED';
        });
      } else if (status === 'publish') {
        filteredList = normalizedList.filter(a => {
          const s = (a.wpStatus || '').toLowerCase();
          const ws = (a.workflowStatus || '').toUpperCase();
          return s === 'publish' || ws === 'PUBLISHED';
        });
      }

      setWebsiteArticles(filteredList);
      setWebsiteArticlesPagination({
        page,
        limit: 10,
        total: total || filteredList.length,
        lastPage: Math.max(1, Math.ceil((total || filteredList.length) / 10)),
      });
    } catch (err: any) {
      console.error('[loadWebsiteArticles] Error:', err);
      setWebsiteArticles([]);
    } finally {
      setIsLoadingWebsiteArticles(false);
    }
  };

  // Toggle Switch between "publish" and "draft": POST /websites/:websiteId/articles/:articleId/publish
  const handleToggleArticleStatus = async (art: ProcessedArticleDataDto) => {
    if (!activeSite?.id) return;
    const isCurrentlyPublished = art.wpStatus === 'publish' || art.workflowStatus === 'PUBLISHED';
    const nextStatus = isCurrentlyPublished ? 'draft' : 'publish';

    setTogglingArticleId(art.id);
    try {
      await websitesService.publishWebsiteArticle(activeSite.id, art.id, {
        status: nextStatus,
      });
      addToast({
        title: nextStatus === 'publish' ? 'Article Published Live!' : 'Reverted to Draft',
        message:
          nextStatus === 'publish'
            ? `"${art.title}" is now published and live on WordPress.`
            : `"${art.title}" status changed back to draft.`,
        type: 'success',
      });
      // Refresh list & counts
      loadWebsiteArticles(websiteArticlesPagination.page);
      refreshActiveSiteArticlesCount(activeSite.id);
    } catch (err: any) {
      addToast({
        title: 'Status Update Failed',
        message: err.message || 'Could not update article status on WordPress.',
        type: 'error',
      });
    } finally {
      setTogglingArticleId(null);
    }
  };

  // Delete Website Article: DELETE /websites/:websiteId/articles/:articleId
  const handleDeleteWebsiteArticle = async (articleId: string, articleTitle: string) => {
    if (!activeSite?.id) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${articleTitle}"?`)) {
      return;
    }
    setDeletingWebsiteArticleId(articleId);
    try {
      await websitesService.deleteWebsiteArticle(activeSite.id, articleId);
      addToast({
        title: 'Article Deleted',
        message: `"${articleTitle}" was permanently deleted.`,
        type: 'info',
      });
      loadWebsiteArticles(websiteArticlesPagination.page);
      refreshActiveSiteArticlesCount(activeSite.id);
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete article.',
        type: 'error',
      });
    } finally {
      setDeletingWebsiteArticleId(null);
    }
  };

  // Trigger loads when tab or site changes
  useEffect(() => {
    if (activeTab === 'website-articles') {
      loadWebsiteArticles(1, websiteArticleStatusFilter, websiteArticleSearchInput);
    } else if (activeTab === 'live') {
      loadLiveArticles(activeSite?.id, undefined, searchInput, 1);
    }
  }, [activeTab, activeSite?.id, websiteArticleStatusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'website-articles') {
      loadWebsiteArticles(1, websiteArticleStatusFilter, websiteArticleSearchInput);
    } else {
      setFilters(prev => ({ ...prev, searchQuery: searchInput }));
      loadLiveArticles(activeSite?.id, undefined, searchInput, 1);
    }
  };

  const handleClearSearch = () => {
    if (activeTab === 'website-articles') {
      setWebsiteArticleSearchInput('');
      loadWebsiteArticles(1, websiteArticleStatusFilter, '');
    } else {
      setSearchInput('');
      setFilters(prev => ({ ...prev, searchQuery: '' }));
      loadLiveArticles(activeSite?.id, undefined, '', 1);
    }
  };

  const handleViewLiveDetail = async (art: any) => {
    setIsLiveModalOpen(true);
    setIsRecordLoading(true);
    try {
      const detail = await websitesService.getLiveContentItem(
        art.websiteId,
        art.postType,
        art.wpPostId || art.id
      );
      setSelectedRecord(detail);
    } catch {
      setSelectedRecord({
        id: art.wpPostId || art.id,
        slug: art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: art.title,
        status: art.status.toLowerCase(),
        date: art.createdAt,
        link: art.liveUrl,
        excerpt: art.excerpt || art.content,
        featuredMedia: art.featuredImage ? { sourceUrl: art.featuredImage } : null,
        hasSnapshot: art.hasSnapshot,
      });
    } finally {
      setIsRecordLoading(false);
    }
  };

  const handleIngest = async (art: any) => {
    const postId = art.wpPostId || art.id;
    setIngestingId(postId);
    try {
      await ingestArticle(art.websiteId, art.postType, postId);
      if (selectedRecord && selectedRecord.id === postId) {
        setSelectedRecord({ ...selectedRecord, hasSnapshot: true });
      }
      // Refresh website articles
      loadWebsiteArticles(websiteArticlesPagination.page);
      if (activeSite?.id) refreshActiveSiteArticlesCount(activeSite.id);
    } finally {
      setIngestingId(null);
    }
  };

  const handleRefreshCurrentTab = () => {
    if (activeTab === 'website-articles') {
      loadWebsiteArticles(websiteArticlesPagination.page);
    } else {
      loadLiveArticles();
    }
  };

  const isCurrentTabLoading =
    activeTab === 'website-articles' ? isLoadingWebsiteArticles : isLoadingArticles;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Articles & Content Hub
            </h1>
            {activeSite && (
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 text-xs font-semibold flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3" />
                {activeSite.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage drafts, publish live articles with instant switches, and monitor your WordPress content.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCurrentTab}
            isLoading={isCurrentTabLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isCurrentTabLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={navigateToNewArticle}
            icon={<Plus className="w-4 h-4" />}
          >
            New Article
          </Button>
        </div>
      </div>

      {/* 2 Navigation Tabs: Streamlined per user request */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 w-fit max-w-full overflow-x-auto shadow-2xs">
        {/* TAB 1: Website Articles (Drafts & Published) */}
        <button
          onClick={() => setActiveTab('website-articles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'website-articles'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Website Articles (Drafts & Published)</span>
          <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold">
            {websiteArticlesPagination.total}
          </span>
        </button>

        {/* TAB 2: Live WordPress Content */}
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'live'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Live WordPress Content</span>
          <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold">
            {pagination.totalItems || filteredArticles.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: WEBSITE ARTICLES (DRAFTS & PUBLISHED) ================= */}
      {activeTab === 'website-articles' && (
        <div className="space-y-4">
          {/* Responsive Filter Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={websiteArticleSearchInput}
                  onChange={e => setWebsiteArticleSearchInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder-slate-400 rounded-xl pl-8 pr-16 py-2 focus:border-violet-500 focus:outline-none"
                />
                {websiteArticleSearchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-violet-600 text-white text-[10px] font-semibold cursor-pointer hover:bg-violet-700"
                >
                  Search
                </button>
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span className="font-medium">Filter:</span>
                <select
                  value={websiteArticleStatusFilter}
                  onChange={e => setWebsiteArticleStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 cursor-pointer outline-none focus:border-violet-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="draft">Drafts Only</option>
                  <option value="publish">Published Only</option>
                </select>
              </div>
            </form>

            <span className="text-xs font-mono text-slate-400 self-end md:self-auto">
              Showing {websiteArticles.length} of {websiteArticlesPagination.total} records
            </span>
          </div>

          {/* Fully Responsive Table Wrapper */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Content Type</th>
                    <th className="py-3 px-4 hidden md:table-cell">Focus Keyword</th>
                    <th className="py-3 px-4 text-center">Status Switch</th>
                    <th className="py-3 px-4 text-center">Live Preview</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300">
                  {isLoadingWebsiteArticles ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
                        <span>Loading website articles from server...</span>
                      </td>
                    </tr>
                  ) : websiteArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                        <p className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">No Articles Found</p>
                        <p className="text-xs mt-1 text-slate-400">Process new articles or import content to get started.</p>
                        <Button
                          variant="glow"
                          size="xs"
                          onClick={navigateToNewArticle}
                          icon={<Plus className="w-3.5 h-3.5" />}
                          className="mt-4"
                        >
                          Process New Article
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    websiteArticles.map(art => {
                      const isPublished =
                        art.wpStatus === 'publish' || art.workflowStatus === 'PUBLISHED';
                      const liveUrl = art.publishedUrl || art.wpUrl || art.link;

                      return (
                        <tr
                          key={art.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Article Column */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-3 max-w-xs sm:max-w-sm md:max-w-md">
                              {art.featuredMediaUrl ? (
                                <img
                                  src={art.featuredMediaUrl}
                                  alt={art.title}
                                  className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-zinc-800 shadow-2xs"
                                />
                              ) : (
                                <div className="w-12 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-400">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">
                                  {art.title}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                  <span className="text-[11px] font-mono text-slate-400 truncate block">
                                    slug: {art.slug}
                                  </span>
                                  {/* Mobile fallback live link */}
                                  {isPublished && liveUrl && (
                                    <a
                                      href={liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex sm:hidden items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                    >
                                      <span>Live</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Content Type Column */}
                          <td className="py-3.5 px-4 hidden sm:table-cell">
                            <Badge variant="violet" size="sm">
                              {art.contentType?.name || art.contentTypeName || art.contentTypeSlug || 'Article'}
                            </Badge>
                          </td>

                          {/* Focus Keyword Column */}
                          <td className="py-3.5 px-4 font-mono text-[11px] hidden md:table-cell">
                            {art.focusKeyword ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 max-w-[140px] truncate block">
                                {art.focusKeyword}
                              </span>
                            ) : (
                              <span className="text-slate-400">&mdash;</span>
                            )}
                          </td>

                          {/* User-Friendly Status Switch Column */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-800 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleToggleArticleStatus(art)}
                                disabled={togglingArticleId === art.id}
                                role="switch"
                                aria-checked={isPublished}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isPublished ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'
                                }`}
                                title={isPublished ? 'Click to switch back to Draft' : 'Click to Publish Live'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                    isPublished ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                >
                                  {togglingArticleId === art.id && (
                                    <RefreshCw className="w-2 h-2 text-slate-600 animate-spin" />
                                  )}
                                </span>
                              </button>

                              <span
                                className={`text-[11px] font-bold ${
                                  isPublished
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {isPublished ? 'Live' : 'Draft'}
                              </span>
                            </div>
                          </td>

                          {/* Live Preview Link Column (Requested) */}
                          <td className="py-3.5 px-4 text-center">
                            {isPublished && liveUrl ? (
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
                                title="Open published page in new tab"
                              >
                                <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>View Live</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-400 italic">
                                &mdash;
                              </span>
                            )}
                          </td>

                          {/* Created Date Column */}
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] hidden lg:table-cell">
                            {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview & Edit Modal Trigger */}
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => {
                                  setSelectedWebsiteArticleId(art.id);
                                  setIsWebsiteArticleModalOpen(true);
                                }}
                                icon={<Eye className="w-3 h-3 text-slate-600 dark:text-zinc-400" />}
                              >
                                Preview & Edit
                              </Button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteWebsiteArticle(art.id, art.title)}
                                disabled={deletingWebsiteArticleId === art.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete Article"
                              >
                                {deletingWebsiteArticleId === art.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3.5 px-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-950/80">
              <div className="text-xs text-slate-500 font-mono">
                Showing Page <strong className="text-slate-900 dark:text-zinc-100">{websiteArticlesPagination.page}</strong> of{' '}
                <strong className="text-slate-900 dark:text-zinc-100">{Math.max(1, websiteArticlesPagination.lastPage)}</strong> &bull; Total: <strong>{websiteArticlesPagination.total}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => loadWebsiteArticles(websiteArticlesPagination.page - 1)}
                  disabled={websiteArticlesPagination.page <= 1 || isLoadingWebsiteArticles}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                <Button
                  variant="glow"
                  size="xs"
                  onClick={() => loadWebsiteArticles(websiteArticlesPagination.page + 1)}
                  disabled={websiteArticlesPagination.page >= websiteArticlesPagination.lastPage || isLoadingWebsiteArticles}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LIVE WORDPRESS RECORDS ================= */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* Enhanced Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search WordPress live records (press Enter)..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder-slate-400 rounded-xl pl-8 pr-16 py-2 focus:border-violet-500 focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-violet-600 text-white text-[10px] font-semibold cursor-pointer hover:bg-violet-700"
                >
                  Search
                </button>
              </div>

              {/* Content Type Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Type:</span>
                <select
                  value={filters.postType}
                  onChange={e => {
                    const newType = e.target.value;
                    setFilters(prev => ({ ...prev, postType: newType }));
                    loadLiveArticles(activeSite?.id, newType, searchInput, 1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 cursor-pointer outline-none"
                >
                  <option value="ALL">All Types</option>
                  {availableTypes.map(t => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Status:</span>
                <select
                  value={filters.status}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, status: e.target.value }));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 cursor-pointer outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </form>

            <span className="text-xs font-mono text-slate-400">
              Showing {filteredArticles.length} of {pagination.totalItems} live records
            </span>
          </div>

          {/* Table of Live WordPress Content */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                    <th className="py-3 px-4">Live Record</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">WP Status</th>
                    <th className="py-3 px-4">Last Sync</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300">
                  {isLoadingArticles ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
                        <span>Querying WordPress REST API...</span>
                      </td>
                    </tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                        <p className="font-semibold text-slate-700 dark:text-zinc-300">No WordPress Records Found</p>
                        <p className="text-xs mt-1 text-slate-400">Try adjusting your filters or connect additional post types.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-3 max-w-md">
                            {art.featuredImage ? (
                              <img
                                src={art.featuredImage}
                                alt={art.title}
                                className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-zinc-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">
                                {art.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-slate-400">#{art.wpPostId || art.id}</span>
                                {art.liveUrl && (
                                  <a
                                    href={art.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 font-mono truncate max-w-[200px]"
                                  >
                                    <span>view link</span>
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="violet" size="sm">
                            {art.postType}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={art.status === 'Published' ? 'success' : 'default'}
                            size="sm"
                          >
                            {art.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {art.updatedAt || art.createdAt}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Live Modal */}
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleViewLiveDetail(art)}
                              icon={<Eye className="w-3 h-3 text-slate-600 dark:text-zinc-400" />}
                            >
                              Inspect
                            </Button>

                            {/* Ingest Action */}
                            <Button
                              variant="glow"
                              size="xs"
                              onClick={() => handleIngest(art)}
                              isLoading={ingestingId === (art.wpPostId || art.id)}
                              disabled={(art as any).hasSnapshot}
                              icon={<Plus className="w-3 h-3" />}
                            >
                              {(art as any).hasSnapshot ? 'Ingested' : 'Ingest'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 px-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-950/80">
              <div className="text-xs text-slate-500 font-mono">
                Showing Page <strong className="text-slate-900 dark:text-zinc-100">{pagination.page}</strong> of{' '}
                <strong className="text-slate-900 dark:text-zinc-100">{Math.max(1, pagination.totalPages)}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoadingArticles}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                <Button
                  variant="glow"
                  size="xs"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoadingArticles}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Article Edit & Preview Modal */}
      <WebsiteArticleEditModal
        isOpen={isWebsiteArticleModalOpen}
        onClose={() => {
          setIsWebsiteArticleModalOpen(false);
          setSelectedWebsiteArticleId(null);
        }}
        websiteId={activeSite?.id || ''}
        articleId={selectedWebsiteArticleId}
        onArticleUpdated={() => {
          loadWebsiteArticles(websiteArticlesPagination.page);
          if (activeSite?.id) refreshActiveSiteArticlesCount(activeSite.id);
        }}
      />

      {/* Live Record Detail Modal */}
      <LiveArticleDetailModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        loading={isRecordLoading}
        article={selectedRecord}
        onIngest={selectedRecord ? () => handleIngest(selectedRecord) : undefined}
        isIngesting={ingestingId === selectedRecord?.id}
      />
    </div>
  );
};
