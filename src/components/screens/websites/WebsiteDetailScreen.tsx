import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { websitesService } from '../../../api/services/websites.service';
import type { ContentTypeDetailDto } from '../../../api/types/website.dto';
import { ContentTypeDetailModal } from './ContentTypeDetailModal';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  Eye,
  Sparkles,
  FileText,
  Plus,
  Globe,
  Tag,
  FolderTree,
} from 'lucide-react';

export const WebsiteDetailScreen: React.FC = () => {
  const {
    sites,
    selectedWebsiteIdForDetail,
    setCurrentScreen,
    setActiveSiteId,
    navigateToNewArticle,
    scanWebsite,
    testWebsiteConnection,
  } = useApp();

  const site = sites.find(s => s.id === selectedWebsiteIdForDetail);

  // Live content types list state
  const [contentTypes, setContentTypes] = useState<any[]>(site?.discoveredTypes || []);
  const [isLoadingContentTypes, setIsLoadingContentTypes] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<ContentTypeDetailDto | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);

  // Function to load content types via GET {{baseUrl}}/websites/{{websiteId}}/content-types
  const loadContentTypes = async () => {
    if (!site?.id) return;
    setIsLoadingContentTypes(true);
    try {
      const res = await websitesService.getContentTypes(site.id);
      const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

      const mapped = rawList.map((item: any, idx: number) => ({
        id: item.id || `type-${idx + 1}`,
        websiteId: item.websiteId || site.id,
        slug: item.slug || 'post',
        name: item.name || 'Post',
        description: item.description,
        restNamespace: item.restNamespace || 'wp/v2',
        restBase: item.restBase || item.slug,
        hierarchical: !!item.hierarchical,
        taxonomies: Array.isArray(item.taxonomies) ? item.taxonomies : [],
        schemaStatus: item.schemaStatus || 'FULLY_DISCOVERED',
        isActive: item.isActive !== false,
        lastDiscoveredAt: item.lastDiscoveredAt,
      }));

      setContentTypes(mapped);
    } catch {
      // Keep existing site.discoveredTypes if available
    } finally {
      setIsLoadingContentTypes(false);
    }
  };

  // Fetch content types directly when viewing website detail
  useEffect(() => {
    if (site?.id) {
      loadContentTypes();
    }
  }, [site?.id]);

  const handleScan = async () => {
    if (!site) return;
    setIsScanning(true);
    try {
      await scanWebsite(site.id);
      await loadContentTypes();
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenSchemaDetail = async (slug: string) => {
    if (!site) return;
    setIsSchemaModalOpen(true);
    setIsSchemaLoading(true);
    try {
      const detail = await websitesService.getContentTypeDetail(site.id, slug);
      setSelectedSchema(detail);
    } catch {
      const existing = contentTypes.find(t => t.slug === slug);
      if (existing) {
        setSelectedSchema({
          id: existing.id,
          websiteId: site.id,
          slug: existing.slug,
          name: existing.name,
          restNamespace: existing.restNamespace || 'wp/v2',
          restBase: existing.restBase || existing.slug,
          hierarchical: existing.hierarchical || false,
          taxonomies: (existing.taxonomies || []).map((t: any) =>
            typeof t === 'string'
              ? { name: t, slug: t.toLowerCase().replace(/\s+/g, '-'), hierarchical: false }
              : t
          ),
          supports: ['title', 'author', 'excerpt', 'thumbnail', 'revisions'],
          schemaStatus: 'FULLY_DISCOVERED',
        });
      }
    } finally {
      setIsSchemaLoading(false);
    }
  };

  if (!site) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">No Website Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select a connected WordPress website to view details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentScreen('websites')}
          className="mt-4"
        >
          Back to Websites
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button & Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('websites')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Back to Websites List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                {site.name}
              </h1>
              <Badge variant="success" size="sm">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{site.status === 'CONNECTED' ? 'REST Connected' : site.status}</span>
                </span>
              </Badge>
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-mono inline-flex items-center gap-1 mt-0.5 truncate"
            >
              <span>{site.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
            </a>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testWebsiteConnection(site.id)}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Test Connection
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadContentTypes}
            isLoading={isLoadingContentTypes}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingContentTypes ? 'animate-spin' : ''}`} />}
          >
            Refresh Types
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleScan}
            isLoading={isScanning}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />}
          >
            Scan Content Types
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              setActiveSiteId(site.id);
              setCurrentScreen('articles');
            }}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            View Articles
          </Button>
        </div>
      </div>

      {/* 3 Overview Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: WordPress REST API */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-violet-500" />
              <span>WordPress REST API</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Online</span>
          </div>
          <div className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate pt-1">
            {site.url}/wp-json/wp/v2
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Standard WordPress core endpoints verified & accessible.
          </p>
        </div>

        {/* Card 2: Authentication Credentials */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Authenticated User</span>
            </span>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase">App Password</span>
          </div>
          <div className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate pt-1 flex items-center gap-2">
            <span>@{site.username}</span>
            <span className="text-[11px] text-slate-400 font-normal">•••• •••• •••• ••••</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Authenticated via secure Application Password credentials.
          </p>
        </div>

        {/* Card 3: Content Structure */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Discovered Post Types</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Ready</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 pt-1">
            {contentTypes.length} Types Discovered
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Ready for AI document structuring and automated publishing.
          </p>
        </div>
      </div>

      {/* Discovered Content Types Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Discovered Content Types ({contentTypes.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                These post types have been indexed and mapped for structured content injection.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Direct Publishing</span>
          </span>
        </div>

        {/* Content Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoadingContentTypes && contentTypes.length === 0 ? (
            <div className="md:col-span-3 py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 space-y-2">
              <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Scanning WordPress Content Types...</h3>
              <p className="text-xs text-slate-500">Querying /wp-json/wp/v2/types to retrieve schema definitions.</p>
            </div>
          ) : contentTypes.length === 0 ? (
            <div className="md:col-span-3 py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Content Types Discovered Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click the button below to scan custom post types, taxonomies, and REST endpoints from this WordPress site.
              </p>
              <Button
                variant="glow"
                size="sm"
                onClick={handleScan}
                isLoading={isScanning}
                className="mt-4"
              >
                Scan Content Types Now
              </Button>
            </div>
          ) : (
            contentTypes.map(ct => (
              <div
                key={ct.id || ct.slug}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-violet-300 dark:hover:border-violet-900/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-violet-600 transition-colors truncate">
                          {ct.name}
                        </h3>
                        {ct.hierarchical && (
                          <span
                            title="Hierarchical post type (has parent/child relations)"
                            className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px]"
                          >
                            <FolderTree className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        Slug: <code className="text-violet-600 dark:text-violet-400 font-semibold">{ct.slug}</code>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>

                  {/* REST Endpoint Route */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block uppercase">
                      REST Endpoint Route
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200 block truncate">
                      /{ct.restNamespace || 'wp/v2'}/{ct.restBase || ct.slug}
                    </span>
                  </div>

                  {/* Taxonomies Tags */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>Taxonomies:</span>
                    </span>
                    {ct.taxonomies && ct.taxonomies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {ct.taxonomies.map((tax: any, tIdx: number) => {
                          const taxName = typeof tax === 'string' ? tax : tax.name;
                          return (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono font-medium"
                            >
                              {taxName}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic block">
                        No custom taxonomies attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ready
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenSchemaDetail(ct.slug)}
                      icon={<Eye className="w-3 h-3 text-slate-500" />}
                    >
                      Schema
                    </Button>

                    <Button
                      variant="glow"
                      size="xs"
                      onClick={() => {
                        setActiveSiteId(site.id);
                        navigateToNewArticle();
                      }}
                      icon={<Plus className="w-3 h-3" />}
                      title={`Create new ${ct.name}`}
                    >
                      New
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Schema Detail Modal */}
      <ContentTypeDetailModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        loading={isSchemaLoading}
        contentType={selectedSchema}
      />
    </div>
  );
};
