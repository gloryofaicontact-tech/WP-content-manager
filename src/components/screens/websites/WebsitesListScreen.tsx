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
} from 'lucide-react';

export const WebsitesListScreen: React.FC = () => {
  const {
    sites,
    setIsAddWebsiteModalOpen,
    navigateToWebsiteDetail,
    scanWebsite,
    testWebsiteConnection,
  } = useApp();

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

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsAddWebsiteModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Website
        </Button>
      </div>

      {/* Websites Grid */}
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
                    {site.discoveredTypes.length} Types Found
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Last Scanned:</span>
                  <span>{site.lastScanned || 'Never'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => testWebsiteConnection(site.id)}
                icon={<RefreshCw className="w-3 h-3 text-slate-500" />}
                className="flex-1"
              >
                Test Connection
              </Button>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => scanWebsite(site.id)}
                icon={<RefreshCw className="w-3 h-3 text-violet-600 dark:text-violet-400" />}
                className="flex-1"
              >
                Scan Site
              </Button>

              <Button
                variant="primary"
                size="xs"
                onClick={() => navigateToWebsiteDetail(site.id)}
                icon={<ArrowRight className="w-3 h-3" />}
                className="px-3"
              >
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
