import React from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import {
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  ArrowRight,
  Send,
  Eye,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { stats, articles, publishArticleToWP } = useArticles();
  const {
    sites,
    setIsAddWebsiteModalOpen,
    navigateToNewArticle,
    setCurrentScreen,
    navigateToWebsiteDetail,
    setSelectedArticleIdForEdit,
  } = useApp();

  const recentArticles = articles.slice(0, 6);

  const getSiteName = (siteId: string) => {
    return sites.find(s => s.id === siteId)?.name || 'WordPress Site';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Monitor connected WordPress sites, content status, and AI publishing telemetry.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Connect Website
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

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Connected Websites</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {stats.totalWebsites}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
              All active & verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Articles</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {stats.totalArticles}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 inline-block">
              Across all sites
            </span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Published on WordPress</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {stats.published}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
              Live via REST API
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Drafts / In Progress</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {stats.drafts}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-block">
              Ready for review
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Articles (Left 65%) & Connected Sites (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              Recent Articles
            </h3>
            <button
              onClick={() => setCurrentScreen('articles')}
              className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              View all articles <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Post Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {recentArticles.map(art => (
                  <tr key={art.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-200 max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-400">
                      {getSiteName(art.websiteId)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
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
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="View Live Post"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {art.status !== 'Published' && (
                          <button
                            onClick={() => publishArticleToWP(art.id)}
                            className="p-1.5 text-violet-600 hover:text-violet-700 dark:text-violet-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Publish to WordPress"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedArticleIdForEdit(art.id);
                            setCurrentScreen('article-new');
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Edit Article"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected Sites Quick Status */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Connected Websites
            </h3>
            <button
              onClick={() => setCurrentScreen('websites')}
              className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-semibold cursor-pointer"
            >
              Manage ({sites.length})
            </button>
          </div>

          <div className="space-y-3">
            {sites.map(site => (
              <div
                key={site.id}
                onClick={() => navigateToWebsiteDetail(site.id)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-violet-600 transition-colors">
                      {site.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate block mt-0.5">
                    {site.url}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                    {site.discoveredTypes.length} CPTs
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="w-full mt-2"
          >
            Connect Another Website
          </Button>
        </div>
      </div>
    </div>
  );
};
