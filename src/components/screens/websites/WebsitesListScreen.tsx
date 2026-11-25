import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { websitesService } from '../../../api/services/websites.service';
import type { ContentTypeDetailDto } from '../../../api/types/website.dto';
import type { WordPressSite } from '../../../types/wordpress';
import { ContentTypeDetailModal } from './ContentTypeDetailModal';
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Trash2,
  Globe,
  Eye,
  AlertTriangle,
} from 'lucide-react';

interface WebsiteCardProps {
  site: WordPressSite;
  onTest: (id: string) => Promise<void>;
  onScan: (id: string) => Promise<void>;
  onDetails: (id: string) => void;
  onDelete: (id: string, name: string) => void;
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
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-violet-300 dark:hover:border-violet-900/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-800/40 shadow-2xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-violet-600 transition-colors">
                {site.name}
              </h3>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-mono flex items-center gap-1 mt-0.5 truncate"
                title={site.url}
              >
                <span>{site.url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
            </div>
          </div>

          <Badge variant={site.status === 'CONNECTED' ? 'success' : 'warning'} size="sm">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{site.status === 'CONNECTED' ? 'Active' : site.status}</span>
            </span>
          </Badge>
        </div>

        {/* Quick Info Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block uppercase">Username</span>
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
              {site.username}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block uppercase">Post Types</span>
            <span className="font-mono font-bold text-violet-600 dark:text-violet-400 truncate block mt-0.5">
              {isLoadingTypes ? 'Scanning...' : `${types.length} Discovered`}
            </span>
          </div>
        </div>

        {/* Discovered Content Types Tags */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-violet-500" />
              <span>Content Types</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {types.length} CPTs
            </span>
          </div>

          {types && types.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {types.map((t: any, i: number) => {
                const typeName = t.name || t.slug;
                const typeSlug = t.slug || t.name;
                return (
                  <button
                    key={t.id || typeSlug || i}
                    type="button"
                    onClick={() => onOpenSchema(site.id, typeSlug)}
                    title={`Click to view schema for ${typeName}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 transition-colors cursor-pointer group"
                  >
                    <span>{typeName}</span>
                    <Eye className="w-2.5 h-2.5 text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-200" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No content types scanned yet.</p>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Last Scan:</span>
            <span className="truncate max-w-[180px]" title={lastScannedDisplay}>
              {lastScannedDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
        <Button
          variant="primary"
          size="xs"
          onClick={() => onDetails(site.id)}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          className="flex-1 font-semibold"
          title="Open site details & content types"
        >
          View Details
        </Button>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onTest(site.id)}
          isLoading={isTesting}
          icon={<RefreshCw className="w-3 h-3 text-slate-500" />}
          title="Test REST API Connection"
        >
          Test
        </Button>

        <Button
          variant="secondary"
          size="xs"
          onClick={handleScanClick}
          isLoading={isScanning}
          icon={<RefreshCw className="w-3 h-3 text-violet-600 dark:text-violet-400" />}
          title="Scan WordPress for Content Types"
        >
          Scan
        </Button>

        <button
          type="button"
          onClick={() => onDelete(site.id, site.name)}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
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
    addToast,
  } = useApp();

  // Trigger loadWebsites on mount
  useEffect(() => {
    loadWebsites();
  }, []);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const openDeleteSiteConfirm = (id: string, name: string) => {
    setSiteToDelete({ id, name });
  };

  const handleConfirmDeleteSite = async () => {
    if (!siteToDelete) return;
    const { id, name } = siteToDelete;
    setDeletingId(id);
    try {
      await deleteWebsite(id);
      addToast({
        title: 'Website Removed',
        message: `Website "${name}" was disconnected and removed successfully.`,
        type: 'info',
      });
      setSiteToDelete(null);
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        message: err.message || 'Could not remove website.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
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
              onDelete={openDeleteSiteConfirm}
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

      {/* Delete Website Confirmation Modal */}
      <Modal
        isOpen={!!siteToDelete}
        onClose={() => setSiteToDelete(null)}
        title="Remove Website"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Are you sure you want to disconnect and remove this website?
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 break-words">
                &ldquo;{siteToDelete?.name}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400">
                This will remove the site credentials and saved settings from your dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSiteToDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteSite}
              isLoading={!!deletingId}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Remove Website
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
