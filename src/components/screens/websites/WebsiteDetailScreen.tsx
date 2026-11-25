import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Sliders,
  CheckCircle2,
  Key,
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

        {/* Scan Button Action */}
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
            variant="glow"
            size="sm"
            onClick={() => scanWebsite(site.id)}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Scan Site for Post Types
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
              Discovered Content Types ({site.discoveredTypes.length})
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Scanned & Ready for Publishing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {site.discoveredTypes.map(ct => (
            <div
              key={ct.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{ct.name}</h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 block mt-0.5">
                    Slug: <code>{ct.slug}</code>
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              {/* Taxonomies */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                  Taxonomies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ct.taxonomies.map(tax => (
                    <span
                      key={tax.id}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono font-medium"
                    >
                      {tax.name} ({tax.terms.length})
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Fields if any */}
              {ct.customFields.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-600" /> Custom Fields (ACF):
                  </span>
                  <div className="space-y-1">
                    {ct.customFields.map(f => (
                      <div
                        key={f.key}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] flex justify-between font-mono"
                      >
                        <span className="text-slate-800 dark:text-zinc-200">{f.label}</span>
                        <span className="text-slate-400 dark:text-zinc-500 uppercase">{f.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
