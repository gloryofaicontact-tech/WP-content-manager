import React, { useState, useEffect } from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { settingsService } from '../../../api/services/settings.service';
import { websitesService } from '../../../api/services/websites.service';
import { articlesService } from '../../../api/services/articles.service';
import type { ProcessedArticleDataDto } from '../../../api/types/article.dto';
import type { AiSettingsDataDto } from '../../../api/types/settings.dto';
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
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { stats } = useArticles();
  const {
    sites,
    activeSiteId,
    setIsAddWebsiteModalOpen,
    navigateToNewArticle,
    navigateToEditArticle,
    navigateToWebsiteDetail,
    setCurrentScreen,
    currentUser,
    addToast,
  } = useApp();

  const [aiSettings, setAiSettings] = useState<AiSettingsDataDto | null>(null);
  const [createdArticles, setCreatedArticles] = useState<ProcessedArticleDataDto[]>([]);
  const [isLoadingCreatedArticles, setIsLoadingCreatedArticles] = useState<boolean>(true);
  const [togglingArticleId, setTogglingArticleId] = useState<string | null>(null);

  // Canonical helper detecting whether an article is Published (Live) vs Draft
  const isArticlePublished = (art: any): boolean => {
    if (!art) return false;
    if (art.isPublished === true || art.published === true || art.isLive === true || art.live === true) {
      return true;
    }
    const candidates = [
      art.wpStatus,
      art.status,
      art.post_status,
      art.postStatus,
      art.workflowStatus,
      art.workflow_status,
      art.state,
    ];
    for (const c of candidates) {
      if (typeof c === 'string') {
        const val = c.trim().toLowerCase();
        if (val === 'publish' || val === 'published' || val === 'live' || val === 'public') {
          return true;
        }
      }
    }
    if (art.publishedUrl || art.liveUrl || art.wpUrl) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    settingsService
      .getAiSettings()
      .then(data => setAiSettings(data))
      .catch(() => {});
  }, []);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;

  // Load created/processed articles for active site (or all sites)
  useEffect(() => {
    let isMounted = true;
    const fetchCreatedArticles = async () => {
      setIsLoadingCreatedArticles(true);
      try {
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
          }
          if (Array.isArray(raw.articles)) return raw.articles;
          if (Array.isArray(raw.items)) return raw.items;
          return [];
        };

        let list: any[] = [];
        if (activeSite?.id) {
          const res = await websitesService.getWebsiteArticles(activeSite.id, {
            page: 1,
            limit: 10,
          });
          list = extractList(res);

          // Fallback if empty
          if (list.length === 0) {
            try {
              const fallbackRes = await articlesService.getArticles({
                websiteId: activeSite.id,
                page: 1,
                limit: 10,
              });
              const fallbackList = extractList(fallbackRes);
              if (fallbackList.length > 0) list = fallbackList;
            } catch {}
          }
        } else {
          try {
            const allRes = await articlesService.getArticles({ page: 1, limit: 10 });
            list = extractList(allRes);
          } catch {}
        }

        const normalizedList: ProcessedArticleDataDto[] = list.map((item: any, idx: number) => {
          const published = isArticlePublished(item);
          return {
            id: String(item.id || item._id || `art-${idx + 1}`),
            websiteId: item.websiteId || activeSite?.id || '',
            contentTypeSlug:
              item.contentTypeSlug || item.contentType?.slug || item.postType || 'post',
            contentTypeName:
              item.contentTypeName || item.contentType?.name || item.contentTypeSlug || 'Article',
            title: typeof item.title === 'object' ? item.title.rendered : (item.title || 'Untitled Article'),
            slug: item.slug || 'article',
            focusKeyword: item.focusKeyword || item.targetKeyword || '',
            metaDescription: item.metaDescription || item.excerpt || '',
            contentHtml: item.contentHtml || '',
            workflowStatus: published ? 'PUBLISHED' : (item.workflowStatus || 'READY_FOR_REVIEW'),
            wpStatus: published ? 'publish' : 'draft',
            featuredMediaUrl: item.featuredMediaUrl || item.featuredImage || null,
            images: Array.isArray(item.images) ? item.images : [],
            createdAt: item.createdAt || item.date || new Date().toISOString(),
            updatedAt: item.updatedAt || item.modified || new Date().toISOString(),
            publishedUrl: item.publishedUrl || item.wpUrl || item.link || null,
          };
        });

        if (isMounted) {
          setCreatedArticles(normalizedList);
        }
      } catch (err) {
        if (isMounted) setCreatedArticles([]);
      } finally {
        if (isMounted) setIsLoadingCreatedArticles(false);
      }
    };

    fetchCreatedArticles();
    return () => {
      isMounted = false;
    };
  }, [activeSite?.id]);

  const recentArticles = createdArticles.slice(0, 5);

  const handleToggleArticleStatus = async (art: ProcessedArticleDataDto) => {
    const isPublished = isArticlePublished(art);
    const nextStatus = isPublished ? 'draft' : 'publish';
    setTogglingArticleId(art.id);
    try {
      if (art.websiteId) {
        await websitesService.publishWebsiteArticle(art.websiteId, art.id, {
          status: nextStatus,
        });
      }
      setCreatedArticles(prev =>
        prev.map(a =>
          a.id === art.id
            ? {
                ...a,
                wpStatus: nextStatus,
                status: nextStatus,
                workflowStatus: nextStatus === 'publish' ? 'PUBLISHED' : 'READY_FOR_REVIEW',
                published: nextStatus === 'publish',
                isPublished: nextStatus === 'publish',
                isLive: nextStatus === 'publish',
              }
            : a
        )
      );
      addToast({
        title: nextStatus === 'publish' ? 'Article Published Live!' : 'Reverted to Draft',
        message: `"${art.title}" is now ${nextStatus === 'publish' ? 'live on WordPress' : 'in draft'}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Action Failed',
        message: err.message || 'Could not update status.',
        type: 'error',
      });
    } finally {
      setTogglingArticleId(null);
    }
  };

  const getSiteName = (siteId: string) => {
    return sites.find(s => s.id === siteId)?.name || 'WordPress Site';
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-violet-800/40">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-violet-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Content Generation Engine Ready</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {currentUser?.fullName || 'Publisher'}!
            </h1>

            <p className="text-xs sm:text-sm text-violet-200/90 leading-relaxed">
              Multi-site WordPress automation hub is live. Transform raw content into SEO-optimized, schema-tagged custom post types with Envato stock assets.
            </p>

            {activeSite && (
              <div className="pt-2 flex items-center gap-2 text-xs text-violet-200/80 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active site: </span>
                <span className="font-semibold text-white">{activeSite.name}</span>
                <span className="opacity-60">({activeSite.url.replace(/^https?:\/\//, '')})</span>
              </div>
            )}
          </div>

          {/* Quick Actions in Hero */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddWebsiteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Connect Site</span>
            </button>

            <button
              onClick={navigateToNewArticle}
              className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-all shadow-md shadow-violet-950/40 hover:shadow-violet-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Process New Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connected Sites */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-violet-400/50 dark:hover:border-violet-500/30 transition-all hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Connected Websites</span>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {stats.totalWebsites}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REST Active</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Discovered CPTs</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300 font-mono">
              {sites.reduce((acc, s) => acc + (s.discoveredTypes?.length || 0), 0)} Types
            </span>
          </div>
        </div>

        {/* Card 2: Total Articles */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-sky-400/50 dark:hover:border-sky-500/30 transition-all hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Articles</span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {stats.totalArticles}
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Across all sites</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Active Site Total</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300 font-mono">
              {activeSite?.totalArticles || 0} Articles
            </span>
          </div>
        </div>

        {/* Card 3: Published Live */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-emerald-400/50 dark:hover:border-emerald-500/30 transition-all hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Published Live</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {stats.published}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Live on WordPress</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Publish Rate</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.totalArticles > 0
                ? `${Math.round((stats.published / stats.totalArticles) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Card 4: Drafts & Review Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 dark:hover:border-amber-500/30 transition-all hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Drafts & Review</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {stats.drafts}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Queue Health</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300 font-mono">
              Ready to Publish
            </span>
          </div>
        </div>
      </div>

      {/* AI Engine & Telemetry Status Pill Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                Active AI Engine:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                {aiSettings?.activeProvider || 'OpenAI'}
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Envato Media Discovery: {aiSettings?.envato?.isConfigured ? 'Active (Automated Stock Discovery)' : 'Not Configured'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen('settings')}
          className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>Configure Engine & Keys</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Grid: Recent Articles (2 cols) & Connected Websites (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles Table / Mobile Cards */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Recent Articles
                </h3>
              </div>
              <button
                onClick={() => setCurrentScreen('articles')}
                className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({createdArticles.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">Website</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {isLoadingCreatedArticles ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-600" />
                        <span>Loading created articles...</span>
                      </td>
                    </tr>
                  ) : recentArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                        <p className="font-semibold text-slate-700 dark:text-zinc-300">No articles created yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Process New Article" to generate content.</p>
                        <Button
                          variant="glow"
                          size="xs"
                          onClick={navigateToNewArticle}
                          icon={<Plus className="w-3.5 h-3.5" />}
                          className="mt-3"
                        >
                          Process New Article
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    recentArticles.map(art => {
                      const isPublished = isArticlePublished(art);
                      const liveUrl = art.publishedUrl || art.wpUrl || art.link;

                      return (
                        <tr
                          key={art.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-200 max-w-[260px]">
                            <div className="flex items-center gap-3">
                              {art.featuredMediaUrl ? (
                                <img
                                  src={art.featuredMediaUrl}
                                  alt={art.title}
                                  className="w-10 h-8 object-cover rounded-md shrink-0 border border-slate-200 dark:border-zinc-800"
                                />
                              ) : (
                                <div className="w-10 h-8 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-400">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                  {art.title}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                  {art.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-400 max-w-[140px] truncate">
                            {getSiteName(art.websiteId)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-violet-700 dark:text-violet-300 font-semibold">
                              {art.contentTypeName || art.contentTypeSlug || 'Article'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                isPublished
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                }`}
                              />
                              {isPublished ? 'Live' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {liveUrl && (
                                <a
                                  href={liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                                  title="View Live Post"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleToggleArticleStatus(art)}
                                disabled={togglingArticleId === art.id}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer ${
                                  isPublished ? 'text-amber-600 hover:text-amber-700' : 'text-violet-600 hover:text-violet-700'
                                }`}
                                title={isPublished ? 'Revert to Draft' : 'Publish to WordPress'}
                              >
                                {togglingArticleId === art.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => navigateToEditArticle(art.id, art.websiteId)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                title="Edit Article"
                              >
                                <Eye className="w-3.5 h-3.5" />
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

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-zinc-800/60">
              {isLoadingCreatedArticles ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-600" />
                  <span>Loading created articles...</span>
                </div>
              ) : recentArticles.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No articles created yet.
                </div>
              ) : (
                recentArticles.map(art => {
                  const isPublished = isArticlePublished(art);
                  const liveUrl = art.publishedUrl || art.wpUrl || art.link;

                  return (
                    <div key={art.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 line-clamp-2">
                          {art.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                        <span>{getSiteName(art.websiteId)}</span>
                        <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                          {art.contentTypeName || art.contentTypeSlug || 'Article'}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/40">
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Live</span>
                          </a>
                        )}
                        <button
                          onClick={() => navigateToEditArticle(art.id, art.websiteId)}
                          className="px-2 py-1 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-zinc-950/40 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Showing {recentArticles.length} of {createdArticles.length} created articles
            </span>
            <button
              onClick={() => setCurrentScreen('articles')}
              className="text-xs text-violet-600 dark:text-violet-400 font-semibold cursor-pointer"
            >
              Browse Library →
            </button>
          </div>
        </div>

        {/* Connected Websites Panel */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
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

            <div className="space-y-2.5">
              {sites.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <Globe className="w-6 h-6 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                  No WordPress sites connected yet.
                </div>
              ) : (
                sites.map(site => (
                  <div
                    key={site.id}
                    onClick={() => navigateToWebsiteDetail(site.id)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 hover:bg-slate-100/80 dark:hover:bg-zinc-800/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-violet-600 transition-colors">
                          {site.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate block mt-0.5">
                        {site.url.replace(/^https?:\/\//, '')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{site.discoveredTypes?.length || 0} CPTs</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
