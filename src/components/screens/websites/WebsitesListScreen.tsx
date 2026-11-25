import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { websitesService } from '../../../api/services/websites.service';
import type { ContentTypeDetailDto } from '../../../api/types/website.dto';
import type { WordPressSite } from '../../../types/wordpress';
import { ContentTypeDetailModal } from './ContentTypeDetailModal';
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Trash2,
  Globe,
  Eye,
} from 'lucide-react';

interface WebsiteCardProps {
  site: WordPressSite;
  onTest: (id: string) => Promise<void>;
  onScan: (id: string) => Promise<void>;
  onDetails: (id: string) => void;
  onDelete: (id: string, name: string) => Promise<void>;
  onOpenSchema: (siteId: string, slug: string) => void;
  isTesting: boolean;
  isScanning: boolean;
  isDeleting: boolean;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  site,
  onTest,
  onScan,
  onDetails,
  onDelete,
  onOpenSchema,
  isTesting,
  isScanning,
  isDeleting,
}) => {
  const [types, setTypes] = useState<any[]>(site.discoveredTypes || []);
  const [isLoadingTypes, setIsLoadingTypes] = useState<boolean>(false);
  const [lastScannedDisplay, setLastScannedDisplay] = useState<string>(site.lastScanned || 'Never');

  // Load content types directly from GET /websites/:id/content-types
  const fetchCardContentTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const res: any = await websitesService.getContentTypes(site.id);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      if (list.length > 0) {
        setTypes(list);

        // Find latest lastDiscoveredAt
        const latest = list.reduce((acc: string | null, curr: any) => {
          const d = curr.lastDiscoveredAt || curr.updatedAt;
          if (!d) return acc;
          if (!acc) return d;
          return new Date(d) > new Date(acc) ? d : acc;
        }, null);

        if (latest) {
          setLastScannedDisplay(new Date(latest).toLocaleString());
        }
      }
    } catch {
      // Keep existing types
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (site.discoveredTypes && site.discoveredTypes.length > 0) {
      setTypes(site.discoveredTypes);
      if (site.lastScanned && site.lastScanned !== 'Never') {
        setLastScannedDisplay(site.lastScanned);
      }
    } else {
      fetchCardContentTypes();
    }
  }, [site.id, site.discoveredTypes, site.lastScanned]);

  const handleScanClick = async () => {
    await onScan(site.id);
    await fetchCardContentTypes();
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
              {site.name}
            </h3>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-mono flex items-center gap-1 mt-0.5 truncate"
            >
              {site.url} <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <Badge variant={site.status === 'CONNECTED' ? 'success' : 'warning'} size="sm">
            {site.status}
          </Badge>
        </div>

        {/* Specs & info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5 text-xs text-slate-600 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Shield className="w-3.5 h-3.5" /> Username:
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">{site.username}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Layers className="w-3.5 h-3.5" /> Scanned Post Types:
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              {isLoadingTypes ? (
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <RefreshCw className="w-3 h-3 animate-spin text-violet-500" />
                  Checking...
                </span>
              ) : (
                <span>{types.length} Types Found</span>
              )}
            </span>
          </div>

          {/* Live Discovered Types Badges on the Card */}
          {types && types.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {types.map((t: any, i: number) => {
                const typeName = t.name || t.slug;
                const typeSlug = t.slug || t.name;
                return (
                  <button
                    key={t.id || typeSlug || i}
                    type="button"
                    onClick={() => onOpenSchema(site.id, typeSlug)}
                    title={`Click to view schema & endpoints for ${typeName}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 transition-colors cursor-pointer group"
                  >
                    <span>{typeName}</span>
                    <Eye className="w-2.5 h-2.5 text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-200" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
            <span>Last Scanned:</span>
            <span className="truncate max-w-[190px]" title={lastScannedDisplay}>
              {lastScannedDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onTest(site.id)}
          isLoading={isTesting}
          icon={<RefreshCw className="w-3 h-3 text-slate-500" />}
          className="flex-1"
        >
          Test
        </Button>

        <Button
          variant="secondary"
          size="xs"
          onClick={handleScanClick}
          isLoading={isScanning}
          icon={<RefreshCw className="w-3 h-3 text-violet-600 dark:text-violet-400" />}
          className="flex-1"
        >
          Scan
        </Button>

        <Button
          variant="primary"
          size="xs"
          onClick={() => onDetails(site.id)}
          icon={<ArrowRight className="w-3 h-3" />}
          className="px-2.5"
          title="View Scanned Details"
        >
          Details
        </Button>

        <button
          type="button"
          onClick={() => onDelete(site.id, site.name)}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          title="Delete Website"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const WebsitesListScreen: React.FC = () => {
  const {
    sites,
    isWebsitesLoading,
    loadWebsites,
    deleteWebsite,
    setIsAddWebsiteModalOpen,
    navigateToWebsiteDetail,
    scanWebsite,
    testWebsiteConnection,
  } = useApp();

  // Trigger loadWebsites on mount
  useEffect(() => {
    loadWebsites();
  }, []);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Content type schema modal state
  const [selectedSchema, setSelectedSchema] = useState<ContentTypeDetailDto | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      await testWebsiteConnection(id);
    } finally {
      setTestingId(null);
    }
  };

  const handleScanWebsite = async (id: string) => {
    setScanningId(id);
    try {
      await scanWebsite(id);
    } finally {
      setScanningId(null);
    }
  };

  const handleDeleteWebsite = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteWebsite(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleOpenSchemaDetail = async (siteId: string, slug: string) => {
    setIsSchemaModalOpen(true);
    setIsSchemaLoading(true);
    try {
      // Calls GET {{baseUrl}}/websites/{{websiteId}}/content-types/{{contentTypeSlug}}
      const detail = await websitesService.getContentTypeDetail(siteId, slug);
      setSelectedSchema(detail);
    } catch {
      // Fallback schema object if detail call fails
      setSelectedSchema({
        id: slug,
        websiteId: siteId,
        slug: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        restNamespace: 'wp/v2',
        restBase: slug,
        hierarchical: false,
        taxonomies: [],
        supports: ['title', 'editor', 'author', 'thumbnail', 'excerpt'],
        schemaStatus: 'FULLY_DISCOVERED',
      });
    } finally {
      setIsSchemaLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Websites Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Connect WordPress sites, scan post types and taxonomies, and manage publishing permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWebsites()}
            isLoading={isWebsitesLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isWebsitesLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Website
          </Button>
        </div>
      </div>

      {/* Websites Grid or Empty State */}
      {isWebsitesLoading && sites.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Loading Websites...</h3>
          <p className="text-xs text-slate-500 mt-1">Fetching your WordPress sites from the backend.</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">No WordPress Sites Connected</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Connect your first WordPress website using an Application Password to scan content types and start publishing.
          </p>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="mt-4"
          >
            Connect WordPress Site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map(site => (
            <WebsiteCard
              key={site.id}
              site={site}
              onTest={handleTestConnection}
              onScan={handleScanWebsite}
              onDetails={navigateToWebsiteDetail}
              onDelete={handleDeleteWebsite}
              onOpenSchema={handleOpenSchemaDetail}
              isTesting={testingId === site.id}
              isScanning={scanningId === site.id}
              isDeleting={deletingId === site.id}
            />
          ))}
        </div>
      )}

      {/* Content Type Schema Inspector Modal */}
      <ContentTypeDetailModal
        isOpen={isSchemaModalOpen}
        onClose={() => {
          setIsSchemaModalOpen(false);
          setSelectedSchema(null);
        }}
        loading={isSchemaLoading}
        contentType={selectedSchema}
      />
    </div>
  );
};
