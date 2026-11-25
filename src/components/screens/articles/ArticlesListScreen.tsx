import React from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Eye,
  Send,
} from 'lucide-react';

export const ArticlesListScreen: React.FC = () => {
  const {
    filteredArticles,
    filters,
    setFilters,
    publishArticleToWP,
  } = useArticles();
  const { sites, navigateToNewArticle, setSelectedArticleIdForEdit, setCurrentScreen } = useApp();

  const getSiteName = (siteId: string) => {
    return sites.find(s => s.id === siteId)?.name || 'WordPress Site';
  };

  const currentSite = sites.find(s => s.id === filters.websiteId);
  const availableTypes = currentSite ? currentSite.discoveredTypes : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Articles Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Create, enhance with AI, and publish articles to standard posts or Custom Post Types.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={navigateToNewArticle}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Article
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl pl-8 pr-3 py-2 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Website Filter */}
          <select
            value={filters.websiteId}
            onChange={e => setFilters(prev => ({ ...prev, websiteId: e.target.value, postType: 'ALL' }))}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Websites ({sites.length})</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Post Type Filter */}
          <select
            value={filters.postType}
            onChange={e => setFilters(prev => ({ ...prev, postType: e.target.value }))}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Content Types</option>
            {availableTypes.length > 0 ? (
              availableTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            ) : (
              <>
                <option value="post">Standard Posts</option>
                <option value="tour-package">Tour Packages (CPT)</option>
                <option value="destination">Destinations (CPT)</option>
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
            <option value="Draft">Draft</option>
            <option value="AI Enhanced">AI Enhanced</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          Showing <strong>{filteredArticles.length}</strong> articles
        </span>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-950/80 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Target Website</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    No articles found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredArticles.map(art => (
                  <tr
                    key={art.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-100 max-w-sm truncate">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{art.title}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-400">
                      {getSiteName(art.websiteId)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium">
                        {art.postType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={art.status}>{art.status}</Badge>
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
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold"
                            title="View Live on WordPress"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {art.status !== 'Published' && (
                          <Button
                            variant="glow"
                            size="xs"
                            onClick={() => publishArticleToWP(art.id)}
                            icon={<Send className="w-3 h-3" />}
                          >
                            Publish
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setSelectedArticleIdForEdit(art.id);
                            setCurrentScreen('article-new');
                          }}
                          icon={<Eye className="w-3 h-3 text-slate-600" />}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
