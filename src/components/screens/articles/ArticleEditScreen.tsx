import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useArticles } from '../../../context/ArticleContext';
import { websitesService } from '../../../api/services/websites.service';
import type { ProcessedArticleDataDto } from '../../../api/types/article.dto';
import { ArticleImagesPanel } from './ArticleImagesPanel';
import { PreviewGuardModal, type PreviewPlaceholderWarning } from './PreviewGuardModal';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import {
  ArrowLeft,
  FileText,
  Save,
  Code2,
  Eye,
  Globe,
  RefreshCw,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Key,
  AlertTriangle,
} from 'lucide-react';

export const ArticleEditScreen: React.FC = () => {
  const {
    selectedArticleIdForEdit,
    activeSiteId,
    sites,
    setCurrentScreen,
    addToast,
  } = useApp();
  const { refreshActiveSiteArticlesCount } = useArticles();

  const [article, setArticle] = useState<ProcessedArticleDataDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [previewGuardOpen, setPreviewGuardOpen] = useState<boolean>(false);
  const [previewWarnings, setPreviewWarnings] = useState<PreviewPlaceholderWarning[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Active Tab: 'preview' (default), 'edit', 'images', 'html'
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'images' | 'html'>('preview');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [contentHtml, setContentHtml] = useState<string>('');

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;
  const websiteId = activeSite?.id || '';
  const articleId = selectedArticleIdForEdit || '';

  // Load article details
  const loadArticleDetail = async () => {
    if (!websiteId || !articleId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await websitesService.getWebsiteArticleDetail(websiteId, articleId);
      setArticle(data);
      setTitle(data.title || '');
      setFocusKeyword(data.focusKeyword || '');
      setMetaDescription(data.metaDescription || '');
      setContentHtml(data.contentHtml || (data as any).rawContent || '');
    } catch (err: any) {
      console.error('Failed to load article detail', err);
      addToast({
        title: 'Error Loading Article',
        message: err.message || 'Could not fetch full article details from server.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticleDetail();
  }, [websiteId, articleId]);

  // PATCH /websites/:websiteId/articles/:articleId
  const handleSavePatch = async () => {
    if (!websiteId || !articleId) return;
    setIsSaving(true);
    try {
      const updated = await websitesService.updateWebsiteArticle(websiteId, articleId, {
        title,
        focusKeyword,
        metaDescription,
        contentHtml,
      });
      setArticle(updated);
      addToast({
        title: 'Changes Saved',
        message: 'Article metadata and content updated successfully.',
        type: 'success',
      });
      refreshActiveSiteArticlesCount(websiteId);
    } catch (err: any) {
      console.error('Failed to save article changes', err);
      addToast({
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Could not save changes.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Switch between "publish" and "draft"
  const handleToggleStatusSwitch = async (allowPreviewImages = false) => {
    if (!websiteId || !articleId || !article) return;
    const currentIsPublished = article.wpStatus === 'publish' || article.workflowStatus === 'PUBLISHED';
    const nextStatus = currentIsPublished ? 'draft' : 'publish';

    setIsTogglingStatus(true);
    try {
      await websitesService.publishWebsiteArticle(websiteId, articleId, {
        status: nextStatus,
        ...(allowPreviewImages ? { allowPreviewImages: true } : {}),
      });

      setPreviewGuardOpen(false);
      addToast({
        title: nextStatus === 'publish' ? 'Article Published Live!' : 'Reverted to Draft',
        message:
          nextStatus === 'publish'
            ? 'Article is now published and live on WordPress.'
            : 'Article status has been reverted to draft.',
        type: 'success',
      });

      await loadArticleDetail();
      refreshActiveSiteArticlesCount(websiteId);
    } catch (err: any) {
      const errData = err.response?.data;
      if (
        nextStatus === 'publish' &&
        (Array.isArray(errData?.previewPlaceholders) ||
          String(errData?.message || err.message || '').toLowerCase().includes('preview'))
      ) {
        setPreviewWarnings(errData?.previewPlaceholders || []);
        setPreviewGuardOpen(true);
        return;
      }
      console.error('Failed to toggle status', err);
      addToast({
        title: 'Status Switch Failed',
        message: errData?.message || err.message || 'Could not switch article status.',
        type: 'error',
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // DELETE /websites/:websiteId/articles/:articleId
  const handleDeleteArticle = async () => {
    if (!websiteId || !articleId) return;
    setIsDeleting(true);
    try {
      await websitesService.deleteWebsiteArticle(websiteId, articleId);
      addToast({
        title: 'Article Deleted',
        message: 'The article was permanently removed from your website.',
        type: 'info',
      });
      refreshActiveSiteArticlesCount(websiteId);
      setIsDeleteModalOpen(false);
      setCurrentScreen('articles');
    } catch (err: any) {
      console.error('Failed to delete article', err);
      addToast({
        title: 'Delete Failed',
        message: err.response?.data?.message || err.message || 'Could not delete article.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyHtml = () => {
    if (!contentHtml) return;
    navigator.clipboard.writeText(contentHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
    addToast({
      title: 'Copied HTML',
      message: 'Article HTML markup copied to clipboard.',
      type: 'success',
    });
  };

  const isPublished = article?.wpStatus === 'publish' || article?.workflowStatus === 'PUBLISHED';
  const liveUrl = article?.publishedUrl || article?.wpUrl || (article as any)?.link;
  const wordCount = contentHtml
    ? contentHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Loading article details...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Article Not Found</h2>
        <p className="text-xs text-slate-500">The requested article could not be loaded or has been deleted.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentScreen('articles')}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Sticky-Friendly Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setCurrentScreen('articles')}
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Articles</span>
            </button>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <span className="text-slate-400 dark:text-zinc-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPublished ? 'success' : 'default'} size="sm" className="whitespace-nowrap shrink-0">
              {isPublished ? 'PUBLISHED' : 'DRAFT'}
            </Badge>
            {article.contentTypeSlug && (
              <Badge variant="violet" size="sm" className="whitespace-nowrap shrink-0">
                {article.contentTypeName || article.contentTypeSlug}
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Quick Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-snug">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Slug: <strong className="text-slate-600 dark:text-zinc-300 font-mono">{article.slug}</strong></span>
              <span>&bull;</span>
              <span>Target: <strong className="text-violet-600 dark:text-violet-400 font-medium">{activeSite?.name || 'WordPress'}</strong></span>
              {article.wpPostId && (
                <>
                  <span>&bull;</span>
                  <span>WP ID: #{article.wpPostId}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* View Live Button */}
            {isPublished && liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>View Live</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}

            {/* Status Switch Toggle */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0">
              <span className={`text-xs font-bold ${!isPublished ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                Draft
              </span>

              <button
                type="button"
                onClick={() => handleToggleStatusSwitch(false)}
                disabled={isTogglingStatus}
                role="switch"
                aria-checked={isPublished}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'
                }`}
                title={isPublished ? 'Click to revert to Draft' : 'Click to Publish Live to WordPress'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {isTogglingStatus && (
                    <RefreshCw className="w-2.5 h-2.5 text-slate-600 animate-spin" />
                  )}
                </span>
              </button>

              <span className={`text-xs font-bold ${isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                Live
              </span>
            </div>

            {/* Save Changes Button */}
            <Button
              variant="glow"
              size="sm"
              onClick={handleSavePatch}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
              className="whitespace-nowrap shrink-0"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'preview'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Structured Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'edit'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Edit Content & SEO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'images'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Stock Images ({article.images?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'html'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw HTML</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Tab Content (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ================= TAB 1: STRUCTURED PREVIEW ================= */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Featured Hero Banner */}
              {article.featuredMediaUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 group shadow-sm bg-slate-900">
                  <img
                    src={article.featuredMediaUrl}
                    alt={article.title}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent flex flex-col justify-end p-5 sm:p-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold self-start mb-3">
                      <ImageIcon className="w-3.5 h-3.5" /> Featured Hero Image
                    </span>
                    <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      {article.title}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                    {article.title}
                  </h1>
                </div>
              )}

              {/* Formatted Reading View */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div
                  className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 space-y-4 font-sans"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            </div>
          )}

          {/* ================= TAB 2: EDIT METADATA & CONTENT ================= */}
          {activeTab === 'edit' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs block mb-1.5">
                  Article Title / Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter article headline..."
                  className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs block mb-1.5">
                    Target Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="e.g. is liqui moly good"
                    className="w-full px-4 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs block mb-1.5">
                    Content Type Schema
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                    {article.contentTypeSlug} ({article.contentTypeName || article.contentTypeSlug})
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                    SEO Meta Description
                  </label>
                  <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                    {metaDescription.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Concise summary for search engine snippet ranking (150-160 characters recommended)..."
                  className="w-full p-3.5 text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 resize-y"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs block mb-1.5">
                  Article Body / Content HTML
                </label>
                <textarea
                  rows={18}
                  value={contentHtml}
                  onChange={e => setContentHtml(e.target.value)}
                  placeholder="Full article markup..."
                  className="w-full p-4 font-mono text-xs leading-relaxed rounded-xl bg-slate-900 text-slate-100 border border-slate-800 outline-none focus:border-violet-500 resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleSavePatch}
                  isLoading={isSaving}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Changes (PATCH)
                </Button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: STOCK IMAGES (ENVATO) ================= */}
          {activeTab === 'images' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs">
              <ArticleImagesPanel
                websiteId={websiteId}
                articleId={article.id}
                images={article.images}
                featuredMediaUrl={article.featuredMediaUrl}
                articleTitle={article.title}
                onUpdated={async ({ images, featuredMediaUrl, reloadDetail }) => {
                  setArticle(prev =>
                    prev
                      ? {
                          ...prev,
                          images,
                          ...(featuredMediaUrl !== undefined ? { featuredMediaUrl } : {}),
                        }
                      : prev
                  );
                  if (reloadDetail) {
                    await loadArticleDetail();
                  }
                }}
              />
            </div>
          )}

          {/* ================= TAB 4: RAW HTML ================= */}
          {activeTab === 'html' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Length: {contentHtml.length} characters &bull; {wordCount} words
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCopyHtml}
                  icon={copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedHtml ? 'Copied' : 'Copy HTML'}
                </Button>
              </div>

              <textarea
                rows={18}
                readOnly
                value={contentHtml}
                className="w-full p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 outline-none resize-y"
              />
            </div>
          )}
        </div>

        {/* Right Column: Telemetry, Publishing & Actions Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Publishing & Telemetry */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Publishing Status
              </h3>
              <Badge variant={isPublished ? 'success' : 'default'} size="sm">
                {isPublished ? 'Live on WP' : 'Draft'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-zinc-400">Status Switch</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${!isPublished ? 'text-amber-600' : 'text-slate-400'}`}>
                    Draft
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatusSwitch(false)}
                    disabled={isTogglingStatus}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublished ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        isPublished ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    >
                      {isTogglingStatus && (
                        <RefreshCw className="w-2 h-2 text-slate-600 animate-spin" />
                      )}
                    </span>
                  </button>
                  <span className={`text-[11px] font-bold ${isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Live
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-500 dark:text-zinc-400">Word Count</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                  {wordCount} words
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-500 dark:text-zinc-400">Read Time</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> ~{readTimeMinutes} min
                </span>
              </div>

              {article.createdAt && (
                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/60">
                  <span className="text-slate-500 dark:text-zinc-400">Created</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-300 text-[11px]">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {article.updatedAt && (
                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/60">
                  <span className="text-slate-500 dark:text-zinc-400">Last Modified</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-300 text-[11px]">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Live Preview URL */}
            {isPublished && liveUrl && (
              <div className="pt-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Published Page</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            )}
          </div>

          {/* Card 2: SEO & Google SERP Snippet Preview */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Google SERP Snippet
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                {title || article.title}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-mono truncate">
                {liveUrl || `https://${activeSite?.url?.replace(/^https?:\/\//, '') || 'yoursite.com'}/${article.contentTypeSlug}/${article.slug}`}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {metaDescription || article.metaDescription || 'No meta description configured for this article.'}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Target Keyword:</span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-mono text-xs">
                <Key className="w-3 h-3 text-violet-500" />
                <span>{focusKeyword || article.focusKeyword || 'None specified'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Danger Zone */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Permanently remove this article from your dashboard and database.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Delete Article
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Article"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Are you sure you want to permanently delete this article?
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 break-words">
                &ldquo;{article.title}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400">
                This action cannot be undone. Any published data on WordPress will also be removed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteArticle}
              isLoading={isDeleting}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Article
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Guard Watermark Warning Modal */}
      <PreviewGuardModal
        isOpen={previewGuardOpen}
        onClose={() => setPreviewGuardOpen(false)}
        placeholders={previewWarnings}
        isPublishing={isTogglingStatus}
        onGoToImages={() => setActiveTab('images')}
        onPublishAnyway={() => handleToggleStatusSwitch(true)}
      />
    </div>
  );
};
