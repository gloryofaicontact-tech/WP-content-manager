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
  Key,
  Eye,
  Sparkles,
} from 'lucide-react';

export const WebsiteDetailScreen: React.FC = () => {
  const {
    sites,
    selectedWebsiteIdForDetail,
    setCurrentScreen,
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
      // Re-fetch content-types after discover scan completes
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
      // Calls GET {{baseUrl}}/websites/{{websiteId}}/content-types/{{contentTypeSlug}}
      const detail = await websitesService.getContentTypeDetail(site.id, slug);
      setSelectedSchema(detail);
    } catch {
      // Schema detail fallback from existing state
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('websites')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Websites"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {site.name}
              </h1>
              <Badge variant="success" size="sm">
                {site.status}
              </Badge>
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 font-mono flex items-center gap-1 mt-0.5"
            >
              {site.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Scan & Refresh Actions */}
        <div className="flex items-center gap-2">
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
            variant="glow"
            size="sm"
            onClick={handleScan}
            isLoading={isScanning}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />}
          >
            Scan Content Types
          </Button>
        </div>
      </div>

      {/* Site Credentials Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          Connection Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-500 block mb-1">WordPress REST API</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 truncate block">
              {site.url}/wp-json/wp/v2
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-500 block mb-1">Authenticated Username</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 block">
              {site.username}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-500 block mb-1 flex items-center gap-1">
              <Key className="w-3 h-3" /> Application Password
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 block">
              •••• •••• •••• ••••
            </span>
          </div>
        </div>
      </div>

      {/* Discovered Content Types Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Discovered Content Types ({contentTypes.length})
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Scanned & Ready for Publishing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingContentTypes && contentTypes.length === 0 ? (
            <div className="md:col-span-3 py-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-2">
              <RefreshCw className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading discovered content types from WordPress...</p>
            </div>
          ) : contentTypes.length === 0 ? (
            <div className="md:col-span-3 py-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-6">
              <Layers className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Content Types Discovered Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Scan Content Types" above to discover posts, custom post types, and taxonomies from this WordPress site.
              </p>
              <Button
                variant="glow"
                size="sm"
                onClick={handleScan}
                isLoading={isScanning}
                className="mt-3"
              >
                Start Discovery Scan
              </Button>
            </div>
          ) : (
            contentTypes.map(ct => (
              <div
                key={ct.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{ct.name}</h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 block mt-0.5">
                        Slug: <code className="text-violet-600 dark:text-violet-400 font-semibold">{ct.slug}</code>
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>

                  {/* REST Namespace info */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>REST Base:</span>
                    <span className="text-slate-700 dark:text-zinc-300">
                      /{ct.restNamespace || 'wp/v2'}/{ct.restBase || ct.slug}
                    </span>
                  </div>

                  {/* Taxonomies */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                      Taxonomies:
                    </span>
                    {ct.taxonomies && ct.taxonomies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
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
                        No taxonomies
                      </span>
                    )}
                  </div>
                </div>

                {/* Inspect Schema Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Fully Discovered
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenSchemaDetail(ct.slug)}
                    icon={<Eye className="w-3 h-3 text-slate-500" />}
                  >
                    View Schema
                  </Button>
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
