import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Trash2,
  Globe,
} from 'lucide-react';

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

  // Trigger loadWebsites directly on mount
  React.useEffect(() => {
    loadWebsites();
  }, []);

  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [scanningId, setScanningId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

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
          <div
            key={site.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
          >
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
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
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
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                    {site.discoveredTypes?.length || 0} Types Found
                  </span>
                </div>

                {/* Live Discovered Types Badges on the Card */}
                {site.discoveredTypes && site.discoveredTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {site.discoveredTypes.map((t: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60"
                      >
                        {t.name || t.slug}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                  <span>Last Scanned:</span>
                  <span className="truncate max-w-[170px]" title={site.lastScanned}>
                    {site.lastScanned || 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleTestConnection(site.id)}
                isLoading={testingId === site.id}
                icon={<RefreshCw className="w-3 h-3 text-slate-500" />}
                className="flex-1"
              >
                Test
              </Button>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleScanWebsite(site.id)}
                isLoading={scanningId === site.id}
                icon={<RefreshCw className="w-3 h-3 text-violet-600 dark:text-violet-400" />}
                className="flex-1"
              >
                Scan
              </Button>

              <Button
                variant="primary"
                size="xs"
                onClick={() => navigateToWebsiteDetail(site.id)}
                icon={<ArrowRight className="w-3 h-3" />}
                className="px-2.5"
                title="View Scanned Details"
              >
                Details
              </Button>

              <button
                type="button"
                onClick={() => handleDeleteWebsite(site.id, site.name)}
                disabled={deletingId === site.id}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete Website"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
