import React, { useState, useRef } from 'react';
import { websitesService } from '../../../api/services/websites.service';
import type { ProcessedArticleImageItemDto } from '../../../api/types/article.dto';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import {
  ExternalLink,
  Upload,
  Search,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

interface ArticleImagesPanelProps {
  websiteId: string;
  articleId: string;
  images?: ProcessedArticleImageItemDto[];
  featuredMediaUrl?: string | null;
  articleTitle?: string;
  onUpdated: (updates: {
    images: ProcessedArticleImageItemDto[];
    featuredMediaUrl?: string | null;
    reloadDetail?: boolean;
  }) => void;
}

export const ArticleImagesPanel: React.FC<ArticleImagesPanelProps> = ({
  websiteId,
  articleId,
  images,
  featuredMediaUrl,
  articleTitle,
  onUpdated,
}) => {
  const { addToast } = useApp();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [searchingId, setSearchingId] = useState<string | null>(null);
  const [selectingKey, setSelectingKey] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUploadFile = async (placeholderId: string, file?: File | null) => {
    if (!file) return;
    setUploadingId(placeholderId);
    try {
      const res = await websitesService.uploadArticleMedia(websiteId, articleId, file, placeholderId);
      onUpdated({
        images: res.images,
        featuredMediaUrl: placeholderId === 'featured_hero' ? res.mediaUrl : undefined,
        reloadDetail: true,
      });
      addToast({
        title: 'Licensed Image Uploaded',
        message: 'Uploaded to WordPress Media Library and replaced preview in draft.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Upload Failed',
        message: err.response?.data?.message || err.message || 'Could not upload image.',
        type: 'error',
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleSelectAlternative = async (placeholderId: string, assetId: string) => {
    const key = `${placeholderId}:${assetId}`;
    setSelectingKey(key);
    try {
      const res = await websitesService.selectArticleMedia(websiteId, articleId, placeholderId, assetId);
      onUpdated({
        images: res.images,
        featuredMediaUrl: res.featuredMediaUrl,
        reloadDetail: true,
      });
      addToast({
        title: 'Image Selected',
        message: 'Updated placeholder with selected option.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Selection Failed',
        message: err.response?.data?.message || err.message || 'Could not select image.',
        type: 'error',
      });
    } finally {
      setSelectingKey(null);
    }
  };

  const handleReSearch = async (placeholderId: string, fallbackQuery?: string) => {
    const query = (searchQueries[placeholderId] ?? fallbackQuery ?? '').trim();
    if (query.length < 2) {
      addToast({
        title: 'Enter a Keyword',
        message: 'Type at least 2 characters to search Envato.',
        type: 'warning',
      });
      return;
    }

    setSearchingId(placeholderId);
    try {
      const res = await websitesService.searchArticleMedia(websiteId, articleId, placeholderId, query);
      if (res.found === 0) {
        addToast({
          title: 'No Results Found',
          message: `No Envato images matched "${query}". Try a shorter 2-3 word keyword.`,
          type: 'warning',
        });
        return;
      }
      onUpdated({
        images: res.images,
        featuredMediaUrl: res.featuredMediaUrl,
        reloadDetail: true,
      });
      addToast({
        title: 'Search Refreshed',
        message: `Found ${res.found} Envato options for "${query}".`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Search Failed',
        message: err.response?.data?.message || err.message || 'Could not search Envato.',
        type: 'error',
      });
    } finally {
      setSearchingId(null);
    }
  };

  if (!images || images.length === 0) {
    if (featuredMediaUrl) {
      return (
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
          <img
            src={featuredMediaUrl}
            alt={articleTitle || 'Featured media'}
            className="w-full h-64 object-cover"
          />
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-500 break-all">
            Featured Hero Image URL: {featuredMediaUrl}
          </div>
        </div>
      );
    }

    return (
      <div className="py-12 text-center text-slate-400 space-y-2">
        <ImageIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
        <p className="text-xs font-semibold">No media assets configured for this article.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {images.map((imgGroup, idx) => {
        const pid = imgGroup.placeholderId || `placeholder_${idx}`;
        const isPreviewOnly =
          imgGroup.isPreviewOnly ??
          (imgGroup.selectedAsset?.provider === 'envato' && !imgGroup.selectedAsset?.isLicensed);
        const elementsUrl =
          imgGroup.elementsSearchUrl ||
          imgGroup.selectedAsset?.elementsSearchUrl ||
          (imgGroup.recommendedSearch
            ? `https://elements.envato.com/photos/${encodeURIComponent(imgGroup.recommendedSearch)}`
            : undefined);
        const queryValue = searchQueries[pid] ?? imgGroup.recommendedSearch ?? '';

        return (
          <div
            key={pid}
            className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-4"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="violet" size="sm">
                  {imgGroup.position || `Image ${idx + 1}`}
                </Badge>
                {isPreviewOnly ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    <AlertTriangle className="w-3 h-3" />
                    Preview Only (Envato)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Licensed / Ready
                  </span>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {imgGroup.targetHeading || 'Article Section'}
                </span>
              </div>

              {/* Re-search input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={queryValue}
                  onChange={e => setSearchQueries(prev => ({ ...prev, [pid]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReSearch(pid);
                    }
                  }}
                  placeholder="Custom keyword..."
                  className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 w-44"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  isLoading={searchingId === pid}
                  onClick={() => handleReSearch(pid)}
                  icon={<Search className="w-3 h-3" />}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Active Selection Card */}
            {imgGroup.selectedAsset && (
              <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/60 shadow-xs">
                <img
                  src={imgGroup.selectedAsset.previewUrl}
                  alt={imgGroup.selectedAsset.title}
                  className="w-full sm:w-48 h-32 object-cover rounded-lg shrink-0"
                />
                <div className="flex flex-col justify-between py-1 min-w-0 flex-1 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
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

                  {/* Action Buttons: Open on Envato Elements + Upload Licensed Image */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {elementsUrl && (
                      <a
                        href={elementsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      >
                        Open on Envato Elements
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <input
                      ref={el => {
                        fileInputRefs.current[pid] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        handleUploadFile(pid, file);
                      }}
                    />
                    <Button
                      type="button"
                      variant={isPreviewOnly ? 'glow' : 'outline'}
                      size="xs"
                      isLoading={uploadingId === pid}
                      onClick={() => fileInputRefs.current[pid]?.click()}
                      icon={<Upload className="w-3 h-3" />}
                    >
                      {isPreviewOnly ? 'Upload Licensed Image' : 'Replace Image'}
                    </Button>

                    {imgGroup.selectedAsset.sourceUrl && (
                      <a
                        href={imgGroup.selectedAsset.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-violet-600 font-mono flex items-center gap-0.5 ml-auto"
                      >
                        Item Page <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Options Grid */}
            {imgGroup.alternativeOptions && imgGroup.alternativeOptions.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Alternative Options (Click to Swap)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {imgGroup.alternativeOptions.map((alt, altIdx) => {
                    const isSelecting = selectingKey === `${pid}:${alt.id}`;
                    return (
                      <div
                        key={alt.id || altIdx}
                        onClick={() => !isSelecting && handleSelectAlternative(pid, alt.id)}
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
                          {isSelecting ? 'Selecting...' : 'Select Image →'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
