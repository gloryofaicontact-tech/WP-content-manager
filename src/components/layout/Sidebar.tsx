import React from 'react';
import { useApp, type ScreenId } from '../../context/AppContext';
import { useArticles } from '../../context/ArticleContext';
import {
  LayoutDashboard,
  Globe,
  FileText,
  Settings,
  Zap,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, sites, activeSiteId, navigateToNewArticle, setIsAddWebsiteModalOpen } = useApp();
  const { stats, activeSiteArticlesCount } = useArticles();

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;

  const navItems: Array<{
    id: ScreenId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'websites',
      label: 'Websites',
      icon: <Globe className="w-4 h-4" />,
      badge: stats.totalWebsites,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: <FileText className="w-4 h-4" />,
      badge: activeSiteArticlesCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-60 h-screen bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80 flex flex-col shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shadow-sm shadow-violet-500/20">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight block">
              WP-Automation
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">
              Publishing SaaS
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
          Menu
        </div>

        {navItems.map(item => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'websites' && currentScreen === 'website-detail') ||
            (item.id === 'articles' && currentScreen === 'article-new');

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-violet-50 dark:bg-violet-600/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Create Action Button */}
        <div className="pt-4 px-1">
          <button
            onClick={navigateToNewArticle}
            className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Connected Site Indicator Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60">
        {activeSite ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate block">
                  {activeSite.name}
                </span>
                <a
                  href={activeSite.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:text-zinc-500 flex items-center gap-0.5 truncate"
                >
                  {activeSite.url.replace('https://', '')} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddWebsiteModalOpen(true)}
            className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 hover:border-violet-500 text-slate-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Connect Website</span>
          </button>
        )}
      </div>
    </aside>
  );
};
