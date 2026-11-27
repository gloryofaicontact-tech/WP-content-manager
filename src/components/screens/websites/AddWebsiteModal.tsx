import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { websitesService } from '../../../api/services/websites.service';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import {
  Globe,
  Shield,
  Key,
  User,
  Plug,
  Download,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AddWebsiteModal: React.FC = () => {
  const {
    isAddWebsiteModalOpen,
    setIsAddWebsiteModalOpen,
    addWebsite,
    loadWebsites,
    addToast,
  } = useApp();

  const [mode, setMode] = useState<'plugin' | 'manual'>('plugin');

  // Manual Application Password state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 1-Click Plugin state
  const [pluginSiteUrl, setPluginSiteUrl] = useState('');
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [connectEndpoint, setConnectEndpoint] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isRefreshingSites, setIsRefreshingSites] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const fallbackDownloadUrl = `${apiBase.replace(/\/$/, '')}${API_ENDPOINTS.WP_CONNECTOR.PLUGIN_DOWNLOAD}`;

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !username.trim()) return;

    setIsVerifying(true);
    try {
      await addWebsite({
        name: name.trim(),
        url: url.trim(),
        username: username.trim(),
        applicationPassword: appPassword.trim(),
      });
      setName('');
      setUrl('');
      setUsername('');
      setAppPassword('');
    } catch {
      // Error toast is already shown by AppContext
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateConnectToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await websitesService.generateConnectorToken();
      setConnectToken(res.connectToken);
      setConnectEndpoint(res.connectEndpoint);
      setDownloadUrl(res.downloadUrl);
      addToast({
        title: 'Connect Token Ready',
        message: 'Valid for 10 minutes. Click Open WordPress & Connect or paste into Settings → WP-Automation.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Token Generation Failed',
        message: err.message || 'Could not generate WordPress connect token.',
        type: 'error',
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (!connectToken) return;
    navigator.clipboard.writeText(connectToken);
    setCopiedToken(true);
    addToast({
      title: 'Token Copied',
      message: 'Paste it in WordPress Admin → Settings → WP-Automation.',
      type: 'success',
    });
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleOpenWordPressConnect = () => {
    if (!pluginSiteUrl.trim() || !connectToken) return;
    const base = pluginSiteUrl.trim().replace(/\/+$/, '');
    const normalizedBase =
      base.startsWith('http://') || base.startsWith('https://') ? base : `https://${base}`;
    const targetUrl =
      `${normalizedBase}/wp-admin/options-general.php?page=wp-automation-connector` +
      `&token=${encodeURIComponent(connectToken)}` +
      (connectEndpoint ? `&api=${encodeURIComponent(connectEndpoint)}` : '');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRefreshAfterConnect = async () => {
    setIsRefreshingSites(true);
    try {
      await loadWebsites();
      setConnectToken(null);
      setPluginSiteUrl('');
      setIsAddWebsiteModalOpen(false);
      addToast({
        title: 'Websites Refreshed',
        message: 'Checked for newly connected WordPress sites.',
        type: 'success',
      });
    } finally {
      setIsRefreshingSites(false);
    }
  };

  return (
    <Modal
      isOpen={isAddWebsiteModalOpen}
      onClose={() => setIsAddWebsiteModalOpen(false)}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span>Connect WordPress Website</span>
        </div>
      }
      description="Connect in 1 click using our WordPress plugin or enter an Application Password manually."
    >
      <div className="space-y-4">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setMode('plugin')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'plugin'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Plug className="w-3.5 h-3.5" />
            1-Click Plugin
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'manual'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            App Password
          </button>
        </div>

        {/* TAB 1: 1-Click Plugin Onboarding */}
        {mode === 'plugin' && (
          <div className="space-y-4 text-xs">
            {/* Step 1: Download Plugin */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 dark:text-zinc-100">
                  1. Install WP-Automation Connector
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Upload in WordPress Admin → Plugins → Add New → Upload Plugin.
                </p>
              </div>
              <a
                href={downloadUrl || fallbackDownloadUrl}
                download="wp-automation-connector.zip"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold hover:border-violet-500 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                Download .zip
              </a>
            </div>

            {/* Step 2: Generate Connect Token */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div>
                <p className="font-bold text-slate-900 dark:text-zinc-100">
                  2. Connect Your Site
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Enter your WordPress URL and generate a 1-time Connect Token (valid for 10 min).
                </p>
              </div>

              <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="url"
                  placeholder="https://yoursite.com"
                  value={pluginSiteUrl}
                  onChange={e => setPluginSiteUrl(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {!connectToken ? (
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  isLoading={isGeneratingToken}
                  onClick={handleGenerateConnectToken}
                  className="w-full"
                >
                  Generate Connect Token
                </Button>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 truncate">
                      {connectToken}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleCopyToken}
                      icon={copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedToken ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  {pluginSiteUrl.trim() && (
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      onClick={handleOpenWordPressConnect}
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="w-full"
                    >
                      Open WordPress &amp; Connect
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-1 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddWebsiteModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isRefreshingSites}
                onClick={handleRefreshAfterConnect}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                I&apos;ve Connected — Refresh Sites
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: Manual Application Password */}
        {mode === 'manual' && (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            {/* Website Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Website Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Travel Blog"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* WordPress URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                WordPress URL
              </label>
              <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                WordPress Username
              </label>
              <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or editor_user"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Application Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                WordPress Application Password
              </label>
              <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <Key className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={appPassword}
                  onChange={e => setAppPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" />
                Generated in WordPress Admin &gt; Users &gt; Profile &gt; Application Passwords.
              </p>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddWebsiteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="sm"
                isLoading={isVerifying}
              >
                Connect & Verify
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
