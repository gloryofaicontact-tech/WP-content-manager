import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { useApp } from '../../../context/AppContext';
import {
  Plug,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Globe,
  Terminal,
  Sparkles,
  ShieldCheck,
  Download,
  Info,
  Wrench,
} from 'lucide-react';

interface MockApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const AVAILABLE_MCP_TOOLS = [
  { name: 'list_my_websites', desc: 'List connected WordPress sites' },
  { name: 'get_content_types', desc: 'Inspect post types & ACF schemas' },
  { name: 'list_wp_content', desc: 'Search live WordPress posts' },
  { name: 'get_wp_content_item', desc: 'Read full HTML & ACF of a live post' },
  { name: 'send_article_to_backend', desc: 'Save structured draft + Envato search' },
  { name: 'list_articles', desc: 'List backend drafts & articles' },
  { name: 'get_article', desc: 'Read full draft HTML & image links' },
  { name: 'update_article', desc: 'Edit title, SEO, HTML, or ACF fields' },
  { name: 'publish_article', desc: 'Publish, unpublish, or delete posts' },
];

export const McpIntegrationsTab: React.FC = () => {
  const { addToast } = useApp();

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const mcpEndpointUrl = apiBase.replace(/\/api(\/v\d+)?\/?$/, '') + '/mcp';

  const [selectedClient, setSelectedClient] = useState<'claude' | 'chatgpt' | 'gemini'>('claude');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Interactive preview state for Personal API Keys (will connect to backend /api-keys later)
  const [keyLabel, setKeyLabel] = useState<string>('');
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<MockApiKey[]>([
    {
      id: 'demo-1',
      name: 'Claude Desktop (Work PC)',
      prefix: 'wpa_live_8c4e••••••91a2',
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    },
  ]);

  const handleCopy = (value: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldId);
    addToast({
      title: 'Copied',
      message: `${label} copied to clipboard.`,
      type: 'success',
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = keyLabel.trim() || `AI Client #${apiKeys.length + 1}`;
    const randomPart = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    const fullKey = `wpa_live_${randomPart}`;

    setNewlyGeneratedKey(fullKey);
    setApiKeys(prev => [
      {
        id: `key-${Date.now()}`,
        name: cleanName,
        prefix: `${fullKey.slice(0, 13)}••••••${fullKey.slice(-4)}`,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
      ...prev,
    ]);
    setKeyLabel('');
    addToast({
      title: 'Connection Key Generated (UI Preview)',
      message: 'Copy this key now — in production it is shown only once.',
      type: 'success',
    });
  };

  const handleRevokeKey = (id: string, name: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    addToast({
      title: 'Key Revoked',
      message: `"${name}" has been disconnected.`,
      type: 'info',
    });
  };

  const handleDownloadLocalConfig = () => {
    const tokenValue = newlyGeneratedKey || 'PASTE_YOUR_MCP_KEY_HERE';
    const config = {
      mcpServers: {
        'wp-automation': {
          url: mcpEndpointUrl,
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        },
      },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_desktop_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Preview Mode Notice */}
      <div className="p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-violet-900 dark:text-violet-200">
            UI Design Preview — Ready for Backend Wiring
          </p>
          <p className="text-violet-800/80 dark:text-violet-300/80">
            This tab shows the end-user MCP connection experience. Once we add the backend{' '}
            <code className="font-mono px-1 py-0.5 rounded bg-violet-100 dark:bg-violet-900/60">/mcp</code>{' '}
            Streamable HTTP endpoint and <code className="font-mono px-1 py-0.5 rounded bg-violet-100 dark:bg-violet-900/60">/api-keys</code>{' '}
            table, keys generated here will work directly on any VPS.
          </p>
        </div>
      </div>

      {/* Card 1: Remote MCP Endpoint + Client Setup Guide */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
              <Plug className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Remote MCP Server Endpoint
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Connect Claude, ChatGPT, or Gemini CLI directly over HTTPS — no Node.js or manual JSON required.
              </p>
            </div>
          </div>
          <Badge variant="violet" size="sm">
            Streamable HTTP
          </Badge>
        </div>

        {/* Copyable Endpoint URL */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Your MCP Server URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-800 dark:text-zinc-200 truncate">
              {mcpEndpointUrl}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy(mcpEndpointUrl, 'mcp-url', 'MCP Server URL')}
              icon={copiedField === 'mcp-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedField === 'mcp-url' ? 'Copied' : 'Copy URL'}
            </Button>
          </div>
        </div>

        {/* Client Setup Switcher */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedClient('claude')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedClient === 'claude'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Claude (Web & Desktop)
            </button>
            <button
              type="button"
              onClick={() => setSelectedClient('chatgpt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedClient === 'chatgpt'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              ChatGPT Web
            </button>
            <button
              type="button"
              onClick={() => setSelectedClient('gemini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedClient === 'gemini'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Gemini CLI / Antigravity
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-2">
            {selectedClient === 'claude' && (
              <>
                <p className="font-bold text-slate-900 dark:text-zinc-100">
                  Connect in 3 steps (Claude Web or Claude Desktop):
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Generate a Personal MCP Key below and copy it.</li>
                  <li>
                    In Claude, go to <strong>Settings → Connectors → Add custom connector</strong>.
                  </li>
                  <li>
                    Paste <code className="font-mono text-violet-600 dark:text-violet-400">{mcpEndpointUrl}</code> and enter your Bearer key.
                  </li>
                </ol>
              </>
            )}

            {selectedClient === 'chatgpt' && (
              <>
                <p className="font-bold text-slate-900 dark:text-zinc-100">
                  Connect to ChatGPT Web (Custom GPT or Connector):
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Generate a Personal MCP Key below and copy it.</li>
                  <li>
                    In ChatGPT, add an MCP Connector (or Custom GPT Action using{' '}
                    <code className="font-mono text-violet-600 dark:text-violet-400">/api/v1/docs-json</code>).
                  </li>
                  <li>Set Authentication to <strong>Bearer Token</strong> and paste your key.</li>
                </ol>
              </>
            )}

            {selectedClient === 'gemini' && (
              <>
                <p className="font-bold text-slate-900 dark:text-zinc-100">
                  Connect to Gemini CLI / Antigravity:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Generate a Personal MCP Key below.</li>
                  <li>
                    Add the remote URL <code className="font-mono text-violet-600 dark:text-violet-400">{mcpEndpointUrl}</code> with{' '}
                    <code className="font-mono">Authorization: Bearer &lt;KEY&gt;</code> to your MCP settings.
                  </li>
                </ol>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Personal MCP Connection Keys */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Personal MCP Connection Keys
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Long-lived tokens scoped to your account. Revoke anytime without changing your password.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleDownloadLocalConfig}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Download Config JSON
          </Button>
        </div>

        {/* Create New Key Form */}
        <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={keyLabel}
            onChange={e => setKeyLabel(e.target.value)}
            placeholder="Key label (e.g. Claude Desktop - MacBook)"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500"
          />
          <Button type="submit" variant="glow" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Generate MCP Key
          </Button>
        </form>

        {/* Newly Generated One-Time Key Banner */}
        {newlyGeneratedKey && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Save your new MCP key — it won&apos;t be shown again
              </span>
              <button
                type="button"
                onClick={() => setNewlyGeneratedKey(null)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 font-mono text-xs text-slate-900 dark:text-zinc-100 select-all">
                {newlyGeneratedKey}
              </code>
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={() => handleCopy(newlyGeneratedKey, 'new-key', 'MCP Key')}
                icon={copiedField === 'new-key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedField === 'new-key' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        {/* Active Keys List */}
        <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          {apiKeys.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No active MCP keys. Generate one above to connect Claude or ChatGPT.
            </div>
          ) : (
            apiKeys.map(item => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {item.prefix}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Created: {new Date(item.createdAt).toLocaleDateString()} •{' '}
                    Last used: {item.lastUsedAt ? new Date(item.lastUsedAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleRevokeKey(item.id, item.name)}
                  icon={<Trash2 className="w-3 h-3 text-rose-500" />}
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Card 3: Tools Exposed via MCP */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Tools Available to Connected AI Assistants ({AVAILABLE_MCP_TOOLS.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {AVAILABLE_MCP_TOOLS.map(tool => (
            <div
              key={tool.name}
              className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800"
            >
              <p className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
                {tool.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
