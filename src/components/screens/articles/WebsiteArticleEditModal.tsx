import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { websitesService } from '../../../api/services/websites.service';
import type { ProcessedArticleDataDto } from '../../../api/types/article.dto';
import { useApp } from '../../../context/AppContext';
import { useArticles } from '../../../context/ArticleContext';
import {
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
  Layers,
  Key,
} from 'lucide-react';

interface WebsiteArticleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
  articleId: string | null;
  onArticleUpdated?: () => void;
}

export const WebsiteArticleEditModal: React.FC<WebsiteArticleEditModalProps> = ({
  isOpen,
  onClose,
  websiteId,
  articleId,
  onArticleUpdated,
}) => {
  const { addToast } = useApp();
  const { refreshActiveSiteArticlesCount } = useArticles();

  const [article, setArticle] = useState<ProcessedArticleDataDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Active Tab: 'preview' (default), 'edit', 'images', 'html'
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'images' | 'html'>('preview');

  // Editable Form fields
  const [title, setTitle] = useState<string>('');
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [contentHtml, setContentHtml] = useState<string>('');

  // Load article full details: GET /websites/:websiteId/articles/:articleId
  const loadArticleDetail = async () => {
    if (!websiteId || !articleId) return;
    setIsLoading(true);
    setShowDeleteConfirm(false);
    try {
      const data = await websitesService.getWebsiteArticleDetail(websiteId, articleId);
      setArticle(data);
      setTitle(data.title || '');
      setFocusKeyword(data.focusKeyword || '');
      setMetaDescription(data.metaDescription || '');
      setContentHtml(data.contentHtml || (data as any).rawContent || '');
    } catch (err: any) {
      console.error('Failed to load website article details', err);
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
    if (isOpen && articleId && websiteId) {
      loadArticleDetail();
      setActiveTab('preview');
    } else {
      setArticle(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, articleId, websiteId]);

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
        title: 'Article Updated',
        message: 'Changes saved successfully via PATCH.',
        type: 'success',
      });
      onArticleUpdated?.();
    } catch (err: any) {
      console.error('Failed to patch article', err);
      addToast({
        title: 'Update Failed',
        message: err.response?.data?.message || err.message || 'Could not save changes.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // POST /websites/:websiteId/articles/:articleId/publish
  // User-friendly switch toggle between "publish" and "draft"
  const handleToggleStatusSwitch = async () => {
    if (!websiteId || !articleId || !article) return;
    const currentIsPublished = article.wpStatus === 'publish' || article.workflowStatus === 'PUBLISHED';
    const nextStatus = currentIsPublished ? 'draft' : 'publish';

    setIsTogglingStatus(true);
    try {
      await websitesService.publishWebsiteArticle(websiteId, articleId, {
        status: nextStatus,
      });

      addToast({
        title: nextStatus === 'publish' ? 'Article Published Live!' : 'Reverted to Draft',
        message:
          nextStatus === 'publish'
            ? 'Article is now published and live on WordPress.'
            : 'Article status has been reverted to draft.',
        type: 'success',
      });

      // Reload article to update state
      await loadArticleDetail();
      onArticleUpdated?.();
      refreshActiveSiteArticlesCount(websiteId);
    } catch (err: any) {
      console.error('Failed to toggle status', err);
      addToast({
        title: 'Status Switch Failed',
        message: err.response?.data?.message || err.message || 'Could not switch article status.',
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
        message: 'The article was permanently removed from your workspace.',
        type: 'info',
      });
      onArticleUpdated?.();
      refreshActiveSiteArticlesCount(websiteId);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete article', err);
      addToast({
        title: 'Delete Failed',
        message: err.response?.data?.message || err.message || 'Could not delete article.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pr-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-xs border border-violet-100 dark:border-violet-900/50">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate max-w-sm sm:max-w-md block">
                  {article?.title || 'Structured Article Details'}
                </span>
                <Badge variant={isPublished ? 'success' : 'default'} size="sm">
                  {isPublished ? 'PUBLISHED' : (article?.workflowStatus || 'DRAFT')}
                </Badge>
                {article?.contentTypeSlug && (
                  <Badge variant="violet" size="sm">
                    {article.contentTypeName || article.contentTypeSlug}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 block mt-0.5 truncate">
                ID: <code className="text-violet-600 dark:text-violet-400">{articleId}</code> &bull; Slug: <code className="text-slate-600 dark:text-zinc-300">{article?.slug}</code>
              </span>
            </div>
          </div>

          {/* Header Controls: Live Link, Friendly Toggle Switch & Delete */}
          {article && (
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
              {/* Live Link Button if Published */}
              {isPublished && liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>View Live</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}

              {/* User-Friendly iOS-Style Status Toggle Switch */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className={`text-[11px] font-bold ${!isPublished ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                  Draft
                </span>

                <button
                  type="button"
                  onClick={handleToggleStatusSwitch}
                  disabled={isTogglingStatus}
                  role="switch"
                  aria-checked={isPublished}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublished ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'
                  }`}
                  title={isPublished ? 'Click to revert to Draft' : 'Click to Publish Live'}
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

                <span className={`text-[11px] font-bold ${isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  Live
                </span>
              </div>

              {/* Delete Button */}
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-xl border border-rose-200 dark:border-rose-800">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-1">
                    Delete?
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteArticle}
                    disabled={isDeleting}
                    className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-1.5 py-0.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      }
      description="Preview structured article, modify metadata via PATCH, and toggle live publish status."
    >
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching article and assets from server...</p>
        </div>
      ) : article ? (
        <div className="space-y-4">
          {/* Responsive Tabs Navigation */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'edit'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Edit Metadata (PATCH)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'html'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw HTML</span>
            </button>
          </div>

          {/* ===================== TAB 1: STRUCTURED PREVIEW ===================== */}
          {activeTab === 'preview' && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Featured Hero Banner */}
              {article.featuredMediaUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 group shadow-xs bg-slate-900">
                  <img
                    src={article.featuredMediaUrl}
                    alt={article.title}
                    className="w-full h-56 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-4 sm:p-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-[11px] font-bold self-start mb-2">
                      <ImageIcon className="w-3 h-3" /> Featured Hero Photo
                    </span>
                    <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">
                      {article.title}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                    {article.title}
                  </h1>
                </div>
              )}

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                    <Key className="w-3 h-3 text-violet-500" /> Focus Keyword
                  </span>
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                    {article.focusKeyword || 'None'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-amber-500" /> Read Length
                  </span>
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {wordCount} words &bull; ~{readTimeMinutes}m
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                    <Layers className="w-3 h-3 text-sky-500" /> Content Type
                  </span>
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                    {article.contentTypeName || article.contentTypeSlug}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3 text-emerald-500" /> Status
                  </span>
                  <p className="font-mono text-xs font-semibold">
                    {isPublished ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">LIVE</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">DRAFT</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Direct Live URL Link Banner if Published */}
              {isPublished && liveUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold shrink-0">Live URL:</span>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono underline truncate hover:text-emerald-950 dark:hover:text-white"
                    >
                      {liveUrl}
                    </a>
                  </div>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shrink-0"
                  >
                    <span>Open in Browser</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* SEO Meta Description SERP Preview */}
              {article.metaDescription && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-violet-500" /> Google Search SERP Snippet Preview
                  </span>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 truncate">
                    {article.title}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-500 font-mono truncate">
                    {liveUrl || `https://yoursite.com/${article.contentTypeSlug}/${article.slug}`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {article.metaDescription}
                  </p>
                </div>
              )}

              {/* Formatted Reading View */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <div
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-zinc-200 space-y-3 font-sans"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            </div>
          )}

          {/* ===================== TAB 2: EDIT METADATA (PATCH) ===================== */}
          {activeTab === 'edit' && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter article headline..."
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Target Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="e.g. is liqui moly good"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Content Type
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                    {article.contentTypeSlug} ({article.contentTypeName || article.contentTypeSlug})
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Concise summary for search engine ranking (150-160 characters recommended)..."
                  className="w-full p-3 text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 resize-y"
                />
                <span className="text-[11px] font-mono text-slate-400 block text-right mt-1">
                  {metaDescription.length} characters
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Article Body / Content HTML
                </label>
                <textarea
                  rows={13}
                  value={contentHtml}
                  onChange={e => setContentHtml(e.target.value)}
                  placeholder="Article content markup..."
                  className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl bg-slate-900 text-slate-100 border border-slate-800 outline-none focus:border-violet-500 resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleSavePatch}
                  isLoading={isSaving}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes (PATCH)
                </Button>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: STOCK IMAGES (ENVATO) ===================== */}
          {activeTab === 'images' && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {article.images && article.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {article.images.map((imgItem, idx) => {
                    const asset = imgItem.selectedAsset;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-900/60 p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-violet-600 dark:text-violet-400 font-mono">
                            Placeholder #{idx + 1}: {imgItem.position || imgItem.placeholderId || 'Hero'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 font-mono text-slate-600 dark:text-zinc-400 truncate max-w-[150px]">
                            "{imgItem.recommendedSearch}"
                          </span>
                        </div>

                        {asset?.previewUrl ? (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black aspect-video relative group">
                            <img
                              src={asset.previewUrl}
                              alt={asset.title || imgItem.altText || 'Stock image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {asset.sourceUrl && (
                              <a
                                href={asset.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2 bottom-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white flex items-center gap-1 font-semibold hover:bg-black"
                              >
                                <span>Envato</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="h-28 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 text-xs">
                            No image preview
                          </div>
                        )}

                        <div className="space-y-0.5 text-xs">
                          <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                            {asset?.title || imgItem.altText || 'Layout Asset'}
                          </p>
                          {imgItem.altText && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              Alt: {imgItem.altText}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : article.featuredMediaUrl ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-3">
                  <img
                    src={article.featuredMediaUrl}
                    alt={article.title}
                    className="max-h-64 mx-auto rounded-xl object-cover border border-slate-200 dark:border-zinc-800"
                  />
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Hero Media URL: <span className="font-mono text-violet-600">{article.featuredMediaUrl}</span>
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
                  <p className="text-xs font-semibold">No media assets configured for this article.</p>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 4: RAW HTML ===================== */}
          {activeTab === 'html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Length: {contentHtml.length} chars &bull; {wordCount} words
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
                rows={14}
                readOnly
                value={contentHtml}
                className="w-full p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 outline-none resize-y"
              />
            </div>
          )}

          {/* Responsive Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Globe className="w-3.5 h-3.5 text-violet-500" />
              <span>Status: <strong className={isPublished ? 'text-emerald-500' : 'text-amber-500'}>{article.wpStatus || article.workflowStatus}</strong></span>
              {article.createdAt && (
                <>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="hidden sm:inline">Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeTab === 'edit' && (
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleSavePatch}
                  isLoading={isSaving}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="flex-1 sm:flex-none"
                >
                  Save Changes (PATCH)
                </Button>
              )}

              <Button
                variant={isPublished ? 'outline' : 'glow'}
                size="sm"
                onClick={handleToggleStatusSwitch}
                isLoading={isTogglingStatus}
                className="flex-1 sm:flex-none"
              >
                {isPublished ? 'Revert to Draft' : 'Publish Live to WordPress'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
