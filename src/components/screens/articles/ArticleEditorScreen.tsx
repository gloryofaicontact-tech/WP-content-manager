import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useArticles } from '../../../context/ArticleContext';
import { websitesService } from '../../../api/services/websites.service';
import type { ProcessedArticleDataDto, ImageAssetDto } from '../../../api/types/article.dto';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Layers,
  Globe,
  Tag,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
  Eye,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Hash,
  Database,
  Send,
  Save,
  ToggleLeft,
} from 'lucide-react';

const SAMPLE_RAW_DOCUMENT = `ARTICLE 1
Is Liqui Moly Engine Oil Worth the Price? An Honest Buyer's Guide
Target search term: is Liqui Moly good
Meta description: Liqui Moly costs more than most oils on the shelf. This guide explains what you pay for, which vehicles benefit, and when a cheaper oil is good enough.

Liqui Moly sits at the higher end of the price list in almost every spare parts shop in Sri Lanka. Drivers who have used it tend to stay with it, while first-time buyers often ask the same thing at the counter: is Liqui Moly good enough to justify the extra money? The honest answer is that it depends on your engine, your driving and how long you plan to keep the vehicle. This guide walks through each of those points.

Who makes Liqui Moly?
Liqui Moly is a German lubricant company that started in Ulm in 1957. Its first product was an oil additive based on molybdenum disulphide (MoS2), a solid lubricant that clings to metal surfaces. The name comes from that ingredient. Today the company produces motor oils, additives, car care products and workshop chemicals, and it blends and fills its oils in Germany. For a buyer, that means one consistent source and one quality system behind every can.

What you are paying for
Three things separate a premium oil from a budget oil.
• Base oil quality. Liqui Moly's main passenger car oils use synthetic technology base stocks, which resist heat and oxidation better than mineral oil.
• Additive package. Detergents keep pistons clean, anti-wear agents protect cams and bearings, and viscosity improvers keep the oil stable from cold start to full temperature.
• Approvals. Many Liqui Moly oils carry API and ACEA ratings plus named approvals from car makers. An approval means the oil passed that manufacturer's own engine tests.

Why it matters in Sri Lankan driving
Our conditions are harder on oil than most owner's manuals assume. Colombo traffic means long periods of idling with little airflow. Short school and office runs never let the engine reach a steady temperature. Hill-country climbs load the engine heavily at low speed, and ambient temperatures stay above 27 degrees for much of the year. All of this is classed as severe service. An oil that holds its viscosity and keeps deposits in suspension has a real advantage in these conditions.

Which Liqui Moly oil suits which vehicle?
Semini Motors stocks five Liqui Moly motor oils, and each has a clear purpose.
• Special Tec AA 0W-20: for modern Japanese petrol and hybrid engines that specify 0W-20, such as the Toyota Aqua, Prius and newer Honda models.
• Special Tec AA 5W-30: for Japanese and American petrol engines that specify 5W-30.
• Special Tec AA 10W-30: for slightly older Japanese petrol engines designed around 10W-30.
• Leichtlauf High Tech 5W-40: for European cars and for petrol or diesel engines that call for 5W-40.
• MoS2 Leichtlauf 10W-40: a semi-synthetic oil with MoS2, suited to high-mileage engines.

When Liqui Moly is worth it
The extra cost makes sense in these cases:
• Your car is a hybrid or a turbocharged model with tight tolerances.
• You own a European vehicle that requires a specific manufacturer approval.
• You plan to keep the vehicle for many years and want to delay an engine overhaul.
• You drive mostly in heavy traffic or on short trips.

The verdict
Liqui Moly is a good oil, and for hybrids, European cars and vehicles kept for the long term it is worth the price. For a simple engine with a short ownership plan, the correct grade matters more than the label. Visit seminimotors.com or call to check stock and current prices.`;

export const ArticleEditorScreen: React.FC = () => {
  const { sites, activeSiteId, setCurrentScreen, addToast } = useApp();
  const { refreshActiveSiteArticlesCount } = useArticles();

  // Selected site: drives from active navbar site or fallback
  const currentSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;
  const [selectedSiteId, setSelectedSiteId] = useState<string>(currentSite?.id || '');

  // Keep siteId in sync when navbar activeSiteId changes
  useEffect(() => {
    if (activeSiteId) {
      setSelectedSiteId(activeSiteId);
    }
  }, [activeSiteId]);

  const targetSite = sites.find(s => s.id === selectedSiteId) || currentSite;

  // Content types list for target site
  const [contentTypes, setContentTypes] = useState<any[]>(targetSite?.discoveredTypes || []);
  const [contentTypeSlug, setContentTypeSlug] = useState<string>('post');
  const [isLoadingTypes, setIsLoadingTypes] = useState<boolean>(false);

  // Raw document input
  const [rawDocument, setRawDocument] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Processed response state
  const [processedResult, setProcessedResult] = useState<ProcessedArticleDataDto | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'images' | 'meta'>('preview');
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Load content types when target site changes
  useEffect(() => {
    if (!targetSite?.id) return;
    const fetchTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const res: any = await websitesService.getContentTypes(targetSite.id);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        if (list.length > 0) {
          setContentTypes(list);
          // Set first slug
          setContentTypeSlug(list[0].slug);
        } else if (targetSite.discoveredTypes && targetSite.discoveredTypes.length > 0) {
          setContentTypes(targetSite.discoveredTypes);
          setContentTypeSlug(targetSite.discoveredTypes[0].slug);
        } else {
          setContentTypeSlug('post');
        }
      } catch {
        if (targetSite.discoveredTypes && targetSite.discoveredTypes.length > 0) {
          setContentTypes(targetSite.discoveredTypes);
          setContentTypeSlug(targetSite.discoveredTypes[0].slug);
        }
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchTypes();
  }, [targetSite?.id]);

  // Handle Submit Document for Processing
  const handleProcessArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSite?.id) {
      addToast({
        title: 'Website Required',
        message: 'Please connect and select a WordPress website first.',
        type: 'warning',
      });
      return;
    }

    if (!rawDocument.trim()) {
      addToast({
        title: 'Document Empty',
        message: 'Please paste or type the raw article document to process.',
        type: 'warning',
      });
      return;
    }

    setIsProcessing(true);
    addToast({
      title: 'Processing Document...',
      message: 'Structuring article, extracting SEO metadata, and curating stock photography assets...',
      type: 'info',
    });

    try {
      const response = await websitesService.processArticle(targetSite.id, {
        contentTypeSlug,
        rawDocument,
      });

      const structured = response.data || (response as any);
      setProcessedResult(structured);
      setEditTitle(structured.title || '');
      setEditFocusKeyword(structured.focusKeyword || '');
      setEditMetaDescription(structured.metaDescription || '');

      // Refresh counts in sidebar
      refreshActiveSiteArticlesCount(targetSite.id);

      addToast({
        title: 'Article Processed Successfully!',
        message: response.message || `Structured "${structured.title || 'Article'}" and saved as draft.`,
        type: 'success',
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to process article document via NestJS pipeline.';
      addToast({
        title: 'Processing Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy HTML to clipboard
  const handleCopyHtml = () => {
    if (!processedResult?.contentHtml) return;
    navigator.clipboard.writeText(processedResult.contentHtml);
    setCopiedHtml(true);
    addToast({
      title: 'HTML Copied',
      message: 'Article HTML content copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // State for in-editor PATCH and Publish
  const [isPatching, setIsPatching] = useState<boolean>(false);
  const [isPublishingArticle, setIsPublishingArticle] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editFocusKeyword, setEditFocusKeyword] = useState<string>('');
  const [editMetaDescription, setEditMetaDescription] = useState<string>('');

  // PATCH {{baseUrl}}/websites/:websiteId/articles/:articleId
  const handleSavePatch = async () => {
    if (!targetSite?.id || !processedResult?.id) return;
    setIsPatching(true);
    try {
      const updated = await websitesService.updateWebsiteArticle(targetSite.id, processedResult.id, {
        title: editTitle,
        focusKeyword: editFocusKeyword,
        metaDescription: editMetaDescription,
      });
      setProcessedResult(prev => (prev ? { ...prev, ...updated, title: editTitle, focusKeyword: editFocusKeyword, metaDescription: editMetaDescription } : updated));
      setIsEditMode(false);
      addToast({
        title: 'Article Updated (PATCH)',
        message: 'Successfully updated title and SEO metadata.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.message || 'Failed to update article.',
        type: 'error',
      });
    } finally {
      setIsPatching(false);
    }
  };

  // POST {{baseUrl}}/websites/:websiteId/articles/:articleId/publish
  // Switch between "publish" and "draft"
  const handleTogglePublishStatus = async () => {
    if (!targetSite?.id || !processedResult?.id) return;
    const isCurrentlyPublished = processedResult.wpStatus === 'publish';
    const nextStatus = isCurrentlyPublished ? 'draft' : 'publish';

    setIsPublishingArticle(true);
    try {
      await websitesService.publishWebsiteArticle(targetSite.id, processedResult.id, {
        status: nextStatus,
      });
      setProcessedResult(prev => (prev ? { ...prev, wpStatus: nextStatus } : null));
      refreshActiveSiteArticlesCount(targetSite.id);
      addToast({
        title: nextStatus === 'publish' ? 'Published to WordPress!' : 'Reverted to Draft',
        message:
          nextStatus === 'publish'
            ? `Article "${processedResult.title}" is now published on WordPress.`
            : `Article "${processedResult.title}" status reverted to draft.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Status Update Failed',
        message: err.message || 'Failed to update article status.',
        type: 'error',
      });
    } finally {
      setIsPublishingArticle(false);
    }
  };

  // Switch selected asset with an alternative option
  const handleSelectAlternativeImage = (placeholderId: string | undefined, newAsset: ImageAssetDto) => {
    if (!processedResult || !placeholderId) return;

    const updatedImages = (processedResult.images || []).map(img => {
      if (img.placeholderId === placeholderId) {
        // Swap selected asset
        return {
          ...img,
          selectedAsset: newAsset,
        };
      }
      return img;
    });

    setProcessedResult({
      ...processedResult,
      images: updatedImages,
      // If hero was replaced, update featuredMediaUrl
      featuredMediaUrl: placeholderId === 'hero_featured' ? newAsset.previewUrl : processedResult.featuredMediaUrl,
    });

    addToast({
      title: 'Image Updated',
      message: `Selected "${newAsset.title || 'Alternative Asset'}" for ${placeholderId}.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentScreen('articles')}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Articles
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Process New Article
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60">
                <Sparkles className="w-3 h-3 text-violet-500" />
                AI Document Ingestion
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Paste raw drafts, research notes, or documents. The pipeline structures SEO headings, metadata, Envato stock photos, and saves draft snapshots.
            </p>
          </div>
        </div>

        {processedResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setProcessedResult(null);
              setRawDocument('');
            }}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Process Another
          </Button>
        )}
      </div>

      {/* Target Setup Card: Website & Content Type */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Website Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-violet-500" />
            Target WordPress Website
          </label>
          <div className="relative">
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.url})
                </option>
              ))}
            </select>
          </div>
          {targetSite && (
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Status: {targetSite.status}</span>
              <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
              <span>{targetSite.username}</span>
            </div>
          )}
        </div>

        {/* Content Type Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            Content Type (Post Type)
          </label>
          <div className="relative">
            <select
              value={contentTypeSlug}
              onChange={e => setContentTypeSlug(e.target.value)}
              disabled={isLoadingTypes}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
            >
              {contentTypes.length > 0 ? (
                contentTypes.map((t: any) => (
                  <option key={t.id || t.slug} value={t.slug}>
                    {t.name || t.slug} ({t.slug})
                  </option>
                ))
              ) : (
                <option value="post">Posts (post)</option>
              )}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            REST Endpoint: <code className="text-violet-600 dark:text-violet-400 font-mono">/websites/{targetSite?.id ? targetSite.id.slice(0, 8) + '...' : ''}/articles/process</code>
          </p>
        </div>
      </div>

      {/* Main Form Workspace: Input Document vs Processed Result */}
      {!processedResult ? (
        <form onSubmit={handleProcessArticle} className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Raw Article Document
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setRawDocument(SAMPLE_RAW_DOCUMENT)}
                  icon={<Sparkles className="w-3 h-3 text-amber-500" />}
                >
                  Load Sample Article
                </Button>
                {rawDocument && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRawDocument('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Monospace Text Area */}
            <div className="relative">
              <textarea
                value={rawDocument}
                onChange={e => setRawDocument(e.target.value)}
                rows={16}
                placeholder="Paste raw article text, notes, research, or structured draft here...&#10;&#10;Example:&#10;ARTICLE 1&#10;Is Liqui Moly Engine Oil Worth the Price? An Honest Buyer's Guide&#10;Target search term: is Liqui Moly good&#10;Meta description: Liqui Moly costs more than most oils on the shelf..."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
              <span>{rawDocument.split(/\s+/).filter(Boolean).length} words &bull; {rawDocument.length} characters</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold">
                Will be structured into semantic HTML with stock images
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentScreen('articles')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isProcessing}
              disabled={!rawDocument.trim()}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isProcessing ? 'Processing Article with AI...' : 'Parse & Process Article'}
            </Button>
          </div>
        </form>
      ) : (
        /* Structured Output View */
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Article Parsed, Structured, and Saved as Draft
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Workflow Status: <strong className="font-mono">{processedResult.workflowStatus}</strong> &bull; WP Status: <strong className="font-mono">{processedResult.wpStatus}</strong> &bull; Content Type: <strong className="font-mono">{processedResult.contentTypeName || processedResult.contentTypeSlug}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentScreen('articles')}
                icon={<Database className="w-3.5 h-3.5" />}
              >
                View Articles
              </Button>
              <Button
                variant={processedResult.wpStatus === 'publish' ? 'outline' : 'glow'}
                size="sm"
                onClick={handleTogglePublishStatus}
                isLoading={isPublishingArticle}
                icon={
                  processedResult.wpStatus === 'publish' ? (
                    <ToggleLeft className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )
                }
              >
                {processedResult.wpStatus === 'publish' ? 'Revert to Draft' : 'Publish Live (POST)'}
              </Button>
            </div>
          </div>

          {/* Article Summary Header Card with Inline PATCH edit support */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="violet" size="sm">
                    {processedResult.contentTypeName || processedResult.contentTypeSlug}
                  </Badge>
                  <Badge variant="success" size="sm">
                    {processedResult.workflowStatus}
                  </Badge>
                  <Badge variant={processedResult.wpStatus === 'publish' ? 'success' : 'default'} size="sm">
                    {processedResult.wpStatus}
                  </Badge>
                </div>

                {!isEditMode ? (
                  <>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                      {processedResult.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                      <span>Slug: <strong className="text-violet-600 dark:text-violet-400">{processedResult.slug}</strong></span>
                      {processedResult.id && (
                        <>
                          <span>&bull;</span>
                          <span>ID: {processedResult.id}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Edit Title (PATCH)
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                {!isEditMode ? (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setIsEditMode(true)}
                    icon={<Save className="w-3 h-3 text-violet-600" />}
                  >
                    Edit Metadata (PATCH)
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="glow"
                      size="xs"
                      onClick={handleSavePatch}
                      isLoading={isPatching}
                      icon={<Save className="w-3 h-3" />}
                    >
                      Save (PATCH)
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Attributes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Focus Keyword
                </span>
                {!isEditMode ? (
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {processedResult.focusKeyword || 'None specified'}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={editFocusKeyword}
                    onChange={e => setEditFocusKeyword(e.target.value)}
                    placeholder="e.g. is liqui moly good"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none"
                  />
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Meta Description
                </span>
                {!isEditMode ? (
                  <span className="text-slate-600 dark:text-zinc-300">
                    {processedResult.metaDescription || 'None specified'}
                  </span>
                ) : (
                  <textarea
                    rows={2}
                    value={editMetaDescription}
                    onChange={e => setEditMetaDescription(e.target.value)}
                    placeholder="Meta description..."
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none resize-none"
                  />
                )}
              </div>
            </div>

            {/* Tags row */}
            {processedResult.tags && processedResult.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Tags:</span>
                {processedResult.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tabbed Inspector: Visual Preview / Stock Images / HTML Code / Meta */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            {/* Tabs Header */}
            <div className="px-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visual Article Preview
                </button>

                <button
                  onClick={() => setActiveTab('images')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'images'
                      ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Stock Images ({processedResult.images?.length || (processedResult.featuredMediaUrl ? 1 : 0)})
                </button>

                <button
                  onClick={() => setActiveTab('html')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'html'
                      ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Structured HTML
                </button>

                <button
                  onClick={() => setActiveTab('meta')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'meta'
                      ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  Summary & Notes
                </button>
              </div>

              {activeTab === 'html' && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCopyHtml}
                  icon={copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedHtml ? 'Copied' : 'Copy HTML'}
                </Button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* Tab 1: Visual Preview */}
              {activeTab === 'preview' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {processedResult.featuredMediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xs">
                      <img
                        src={processedResult.featuredMediaUrl}
                        alt={processedResult.title}
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}

                  <div
                    className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-zinc-300 prose-ul:my-3 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: processedResult.contentHtml }}
                  />
                </div>
              )}

              {/* Tab 2: Stock Images & Assets */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {processedResult.images && processedResult.images.length > 0 ? (
                    processedResult.images.map((imgGroup, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="violet" size="sm">
                              {imgGroup.position || `Image ${idx + 1}`}
                            </Badge>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              Heading: {imgGroup.targetHeading || 'Article Section'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Search: &ldquo;{imgGroup.recommendedSearch}&rdquo;
                          </span>
                        </div>

                        {/* Selected Hero Asset */}
                        {imgGroup.selectedAsset && (
                          <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/60 shadow-xs">
                            <img
                              src={imgGroup.selectedAsset.previewUrl}
                              alt={imgGroup.selectedAsset.title}
                              className="w-full sm:w-48 h-32 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex flex-col justify-between py-1 min-w-0 flex-1">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    Active Selection
                                  </span>
                                  {imgGroup.selectedAsset.provider && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                      {imgGroup.selectedAsset.provider}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                                  {imgGroup.selectedAsset.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Alt text: {imgGroup.altText || imgGroup.selectedAsset.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-2">
                                <span>Author: {imgGroup.selectedAsset.author || 'Envato Author'}</span>
                                {imgGroup.selectedAsset.sourceUrl && (
                                  <a
                                    href={imgGroup.selectedAsset.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-violet-600 hover:underline flex items-center gap-0.5"
                                  >
                                    View Source <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Alternative Options Grid */}
                        {imgGroup.alternativeOptions && imgGroup.alternativeOptions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Alternative Stock Options (Click to Swap)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {imgGroup.alternativeOptions.map((alt, altIdx) => (
                                <div
                                  key={altIdx}
                                  onClick={() => handleSelectAlternativeImage(imgGroup.placeholderId, alt)}
                                  className="group p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-violet-500 cursor-pointer transition-all shadow-2xs"
                                >
                                  <img
                                    src={alt.previewUrl}
                                    alt={alt.title}
                                    className="w-full h-24 object-cover rounded-lg mb-2 group-hover:opacity-90"
                                  />
                                  <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 line-clamp-1">
                                    {alt.title}
                                  </p>
                                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium mt-1 block group-hover:underline">
                                    Select Image &rarr;
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : processedResult.featuredMediaUrl ? (
                    <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                      <img
                        src={processedResult.featuredMediaUrl}
                        alt={processedResult.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-3 bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-500">
                        Featured Hero Image URL: {processedResult.featuredMediaUrl}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No stock photo assets attached to this article.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: HTML Code */}
              {activeTab === 'html' && (
                <div className="space-y-3">
                  <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[500px]">
                    <code>{processedResult.contentHtml}</code>
                  </pre>
                </div>
              )}

              {/* Tab 4: Metadata & Notes */}
              {activeTab === 'meta' && (
                <div className="space-y-4 max-w-2xl text-xs">
                  {processedResult.summaryNotes && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Executive Summary Notes
                      </span>
                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {processedResult.summaryNotes}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400">Article ID:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{processedResult.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400">Created At:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{processedResult.createdAt || 'Just now'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400">Post Type:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{processedResult.contentTypeSlug}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Workflow Status:</span>
                      <span className="text-emerald-600 font-bold">{processedResult.workflowStatus}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
