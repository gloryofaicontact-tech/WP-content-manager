import React, { useState } from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { websitesService } from '../../../api/services/websites.service';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { LiveArticleDetailModal } from './LiveArticleDetailModal';
import {
  Plus,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Database,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
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
  } = useArticles();
  const { sites, activeSiteId, navigateToNewArticle } = useApp();

  // Search input
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Single Live Content Modal state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [ingestingId, setIngestingId] = useState<number | string | null>(null);

  // Active website is driven strictly by the top navbar
  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0];
  const availableTypes = activeSite ? activeSite.discoveredTypes : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchQuery: searchInput }));
    loadLiveArticles(activeSite?.id, undefined, searchInput, 1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters(prev => ({ ...prev, searchQuery: '' }));
    loadLiveArticles(activeSite?.id, undefined, '', 1);
  };

  const handleViewLiveDetail = async (art: any) => {
    setIsModalOpen(true);
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
    } finally {
      setIngestingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Live WordPress Content
            </h1>
            {activeSite && (
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 text-xs font-semibold flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3" />
                {activeSite.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Browse live records from the website active in the top navbar. Use live search, filter by post type or status, and ingest snapshots into your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLiveArticles(activeSite?.id, undefined, searchInput, pagination.page)}
            isLoading={isLoadingArticles}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingArticles ? 'animate-spin' : ''}`} />}
          >
            Refresh Records
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={navigateToNewArticle}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Article
          </Button>
        </div>
      </div>

      {/* Enhanced Filter Bar: Server Search, Content Type, and Status Filter (No website selector) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
          {/* Server Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search WordPress live records (press Enter)..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl pl-8 pr-16 py-2 focus:border-violet-500 focus:outline-none"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-mono"
              >
                Clear
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-[10px] font-bold text-white transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Content Type Filter */}
          <select
            value={filters.postType}
            onChange={e => {
              setFilters(prev => ({ ...prev, postType: e.target.value }));
              loadLiveArticles(activeSite?.id, e.target.value, searchInput, 1);
            }}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Content Types</option>
            {availableTypes.length > 0 ? (
              availableTypes.map(t => (
                <option key={t.id} value={t.slug}>
                  {t.name} ({t.slug})
                </option>
              ))
            ) : (
              <>
                <option value="post">Posts (post)</option>
                <option value="tour-package">Tour Packages (tour-package)</option>
                <option value="destination">Destinations (destination)</option>
              </>
            )}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Private">Private</option>
          </select>
        </form>

        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          Showing <strong>{filteredArticles.length}</strong> of <strong>{pagination.totalItems}</strong> records
        </span>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-950/80 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Title & Image</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {isLoadingArticles ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 space-y-2">
                    <RefreshCw className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
                    <p className="text-xs">Fetching live WordPress records...</p>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    No records found on {activeSite ? `"${activeSite.name}"` : 'this website'}. Try scanning content types or clearing filters.
                  </td>
                </tr>
              ) : (
                filteredArticles.map(art => (
                  <tr
                    key={art.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-100 max-w-sm truncate">
                      <div className="flex items-center gap-2.5">
                        {art.featuredImage ? (
                          <img
                            src={art.featuredImage}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="truncate block font-semibold" title={art.title}>
                            {art.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{art.wpPostId || art.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium">
                        {art.postType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={art.status.toLowerCase() === 'published' ? 'success' : 'default'} size="sm">
                        {art.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-zinc-500">
                      {art.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.liveUrl && (
                          <a
                            href={art.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="View Live on WordPress"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Ingest into Workflow Button */}
                        {(art as any).hasSnapshot ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 px-2 py-1">
                            <CheckCircle2 className="w-3 h-3" /> Snapshotted
                          </span>
                        ) : (
                          <Button
                            variant="glow"
                            size="xs"
                            onClick={() => handleIngest(art)}
                            isLoading={ingestingId === (art.wpPostId || art.id)}
                            icon={<Database className="w-3 h-3" />}
                            title="Ingest Snapshot into Workflow"
                          >
                            Ingest
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleViewLiveDetail(art)}
                          icon={<Eye className="w-3 h-3 text-slate-600 dark:text-zinc-400" />}
                        >
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer - Always visible whenever table has records */}
        <div className="p-3.5 px-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-950/80">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-2">
            <span>
              Showing Page <strong className="text-slate-900 dark:text-zinc-100">{pagination.page}</strong> of{' '}
              <strong className="text-slate-900 dark:text-zinc-100">{Math.max(1, pagination.totalPages)}</strong>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
            <span>
              <strong className="text-slate-900 dark:text-zinc-100">{pagination.totalItems || filteredArticles.length}</strong> total records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => goToPage(1)}
              disabled={pagination.page <= 1 || isLoadingArticles}
              className="hidden sm:inline-flex"
            >
              First
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoadingArticles}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, Math.max(1, pagination.totalPages)) }, (_, i) => {
                let pageNum = i + 1;
                // If on high page numbers, shift window
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  pageNum = pagination.page - 2 + i;
                  if (pageNum > pagination.totalPages) {
                    pageNum = pagination.totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    disabled={isLoadingArticles}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      pagination.page === pageNum
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <Button
              variant="glow"
              size="xs"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={
                (pagination.totalPages > 1 && pagination.page >= pagination.totalPages) ||
                (pagination.totalPages <= 1 && filteredArticles.length < pagination.limit) ||
                isLoadingArticles
              }
              icon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Live Record Detail & Ingest Modal */}
      <LiveArticleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={isRecordLoading}
        article={selectedRecord}
        onIngest={selectedRecord ? () => handleIngest(selectedRecord) : undefined}
        isIngesting={ingestingId === selectedRecord?.id}
      />
    </div>
  );
};
