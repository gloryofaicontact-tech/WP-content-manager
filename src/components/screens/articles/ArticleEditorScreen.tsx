import React, { useState } from 'react';
import { useArticles } from '../../../context/ArticleContext';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Save,
  Globe,
  Layers,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

export const ArticleEditorScreen: React.FC = () => {
  const { articles, addArticle, updateArticle, publishArticleToWP } = useArticles();
  const {
    sites,
    selectedArticleIdForEdit,
    setCurrentScreen,
    addToast,
  } = useApp();

  const editingArticle = articles.find(a => a.id === selectedArticleIdForEdit);

  // Form State
  const [websiteId, setWebsiteId] = useState(editingArticle?.websiteId || sites[0]?.id || 'site-1');
  const [postType, setPostType] = useState(editingArticle?.postType || 'post');
  const [title, setTitle] = useState(editingArticle?.title || '');
  const [content, setContent] = useState(editingArticle?.content || '');
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || '');
  const [categories, setCategories] = useState<string[]>(editingArticle?.categories || ['Travel Guides']);
  const [tags, setTags] = useState<string[]>(editingArticle?.tags || ['Ella', 'Highlands']);
  const [featuredImage, setFeaturedImage] = useState(editingArticle?.featuredImage || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedSite = sites.find(s => s.id === websiteId) || sites[0];
  const scannedTypes = selectedSite?.discoveredTypes || [];
  const selectedTypeObj = scannedTypes.find(t => t.id === postType);
  const availableCategories = selectedTypeObj?.taxonomies[0]?.terms.map(t => t.name) || [
    'Travel Guides',
    'Wildlife & Safari',
    'Cultural Heritage',
    'Eco-Tourism',
  ];

  // AI Enhancement simulation
  const handleEnhanceWithAI = () => {
    if (!title.trim() && !content.trim()) {
      addToast({
        title: 'Title or Content Required',
        message: 'Please enter a preliminary title or raw draft to enhance.',
        type: 'warning',
      });
      return;
    }

    setIsEnhancing(true);
    addToast({
      title: 'AI Enhancement Running...',
      message: 'Generating SEO title, subheadings, meta excerpt, and taxonomy tags...',
      type: 'info',
    });

    setTimeout(() => {
      setIsEnhancing(false);
      const enhancedTitle = title
        ? `${title} (Complete 2026 Travel Guide & Insider Tips)`
        : 'Top 10 Hidden Sights in Ella: Complete 2026 Highland Guide';

      const enhancedContent = `<h2>Introduction & Overview</h2>
<p>${content || 'Nestled in the lush hills of Sri Lanka, this enchanting destination offers serene tea plantations, legendary colonial bridges, and panoramic alpine views.'}</p>

<h3>Key Highlights & Must-See Attractions</h3>
<ul>
  <li><strong>Historic Architecture:</strong> Marvel at stone viaducts built during the colonial railway era.</li>
  <li><strong>Sunrise Hikes:</strong> Panoramic viewing platforms reachable via scenic mountain trails.</li>
  <li><strong>Natural Waterfalls:</strong> Plunge into pristine cool rock infinity pools with valley vistas.</li>
</ul>

<h3>Best Time to Visit & Local Tips</h3>
<p>Plan your visit between December and April for dry, sunny morning walks and mist-free photography vantage points.</p>`;

      const generatedExcerpt = `Discover the ultimate guide to ${title || 'Sri Lanka highlands'}. Featuring top attractions, sunrise hikes, and essential travel tips.`;

      setTitle(enhancedTitle);
      setContent(enhancedContent);
      setExcerpt(generatedExcerpt);
      setCategories(['Travel Guides', 'Eco-Tourism']);
      setTags(['Highlands', 'Scenic Spots', 'Travel 2026']);
      if (!featuredImage) {
        setFeaturedImage('https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80');
      }

      addToast({
        title: 'AI Enhancement Complete!',
        message: 'Formatted with proper H2/H3 subheadings, SEO meta excerpt, and categories.',
        type: 'success',
      });
    }, 1200);
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      addToast({ title: 'Title Required', message: 'Please provide an article title.', type: 'warning' });
      return;
    }

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        title,
        content,
        excerpt,
        websiteId,
        postType,
        categories,
        tags,
        featuredImage,
        status: editingArticle.status === 'Published' ? 'Published' : 'Draft',
      });
    } else {
      addArticle({
        title,
        content,
        excerpt,
        websiteId,
        postType,
        status: 'Draft',
        categories,
        tags,
        featuredImage,
      });
    }

    setCurrentScreen('articles');
  };

  const handlePublishNow = () => {
    if (!title.trim()) {
      addToast({ title: 'Title Required', message: 'Please provide an article title before publishing.', type: 'warning' });
      return;
    }

    setIsPublishing(true);

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        title,
        content,
        excerpt,
        websiteId,
        postType,
        categories,
        tags,
        featuredImage,
      });
      publishArticleToWP(editingArticle.id);
    } else {
      addArticle({
        title,
        content,
        excerpt,
        websiteId,
        postType,
        status: 'Draft',
        categories,
        tags,
        featuredImage,
      });
      // publish last added
      setTimeout(() => {
        setIsPublishing(false);
        setCurrentScreen('articles');
      }, 1300);
      return;
    }

    setTimeout(() => {
      setIsPublishing(false);
      setCurrentScreen('articles');
    }, 1300);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('articles')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Articles"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {editingArticle ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Write, enhance with AI, and publish directly to WordPress via REST API.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            icon={<Save className="w-3.5 h-3.5 text-slate-500" />}
          >
            Save as Draft
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={handlePublishNow}
            isLoading={isPublishing}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            🚀 Publish to WordPress
          </Button>
        </div>
      </div>

      {/* Main 2-Column Layout: Left (Editor 65%) & Right (Publishing Options 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target & Content Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Target Selection Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3 h-3 text-violet-600" /> Destination WordPress Site
              </label>
              <select
                value={websiteId}
                onChange={e => {
                  setWebsiteId(e.target.value);
                  const targetS = sites.find(s => s.id === e.target.value);
                  if (targetS?.discoveredTypes[0]) {
                    setPostType(targetS.discoveredTypes[0].id);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.url})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3 h-3 text-emerald-600" /> Scanned Post Type
              </label>
              <select
                value={postType}
                onChange={e => setPostType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {scannedTypes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Article Title Input */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Article Title
            </label>
            <input
              type="text"
              placeholder="e.g. Top 10 Things to Do in Ella, Sri Lanka"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-900 dark:text-zinc-100 rounded-xl p-3 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Content Body Editor with AI Toolbar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Content Body (Rich Text / Markdown)
              </label>

              {/* AI Enhancement Trigger Button */}
              <Button
                variant="glow"
                size="sm"
                onClick={handleEnhanceWithAI}
                isLoading={isEnhancing}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                ✨ Enhance with AI
              </Button>
            </div>

            <textarea
              rows={14}
              placeholder="Paste raw article notes, outline, or full text here. Click '✨ Enhance with AI' to automatically generate H2/H3 subheadings, formatting, and SEO optimization."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl p-3.5 focus:border-violet-500 focus:outline-none font-mono leading-relaxed resize-y"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Word Count: {content ? content.trim().split(/\s+/).length : 0} words</span>
              <span>Clean HTML / Markdown Supported</span>
            </div>
          </div>
        </div>

        {/* Right Column: Publishing Options Sidebar */}
        <div className="space-y-4">
          {/* SEO Meta Excerpt */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              SEO Meta Excerpt
            </label>
            <textarea
              rows={3}
              placeholder="Short 150-character summary for Google search..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 font-mono block text-right">
              {excerpt.length} / 160 chars
            </span>
          </div>

          {/* WordPress Categories (scanned from site) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              WordPress Categories
            </label>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Fetched directly from {selectedSite.name}:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableCategories.map(cat => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategories(prev =>
                        isSelected ? prev.filter(c => c !== cat) : [...prev, cat]
                      );
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-violet-100 dark:bg-violet-600/20 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-500/40 font-bold'
                        : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* WordPress Tags */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-600" /> Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                >
                  #{t}
                  <button
                    onClick={() => setTags(prev => prev.filter(item => item !== t))}
                    className="text-slate-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  if (!tags.includes(e.currentTarget.value.trim())) {
                    setTags(prev => [...prev, e.currentTarget.value.trim()]);
                  }
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Featured Image URL / Upload */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-violet-600" /> Featured Image
            </label>

            {featuredImage && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                <img
                  src={featuredImage}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={featuredImage}
              onChange={e => setFeaturedImage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Bottom Publishing Actions */}
          <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-zinc-900 border border-violet-200 dark:border-zinc-800 space-y-2">
            <Button
              variant="glow"
              size="md"
              onClick={handlePublishNow}
              isLoading={isPublishing}
              icon={<Send className="w-4 h-4" />}
              className="w-full font-bold"
            >
              🚀 Publish to WordPress
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              className="w-full"
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
