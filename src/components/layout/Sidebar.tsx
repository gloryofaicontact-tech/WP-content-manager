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
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    sites,
    activeSiteId,
    navigateToNewArticle,
    setIsAddWebsiteModalOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();
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
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'websites',
      label: 'Websites',
      icon: <Globe className="w-4 h-4 shrink-0" />,
      badge: stats.totalWebsites,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      badge: activeSiteArticlesCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 md:static md:z-auto
        h-screen bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80
        flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out shadow-xl md:shadow-none
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-violet-500/25 shrink-0 transition-transform hover:scale-105">
            <Zap className="w-4.5 h-4.5 fill-white" />
          </div>

          {!isSidebarCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight block truncate">
                WP-Automation
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium block truncate">
                Publishing SaaS
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Button in Header (Optional when expanded) */}
        {!isSidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
            title="Minimize sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {!isSidebarCollapsed && (
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase transition-opacity">
            Navigation
          </div>
        )}

        {navItems.map(item => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'websites' && currentScreen === 'website-detail') ||
            (item.id === 'articles' && (currentScreen === 'article-new' || currentScreen === 'article-edit'));

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => {
                  setCurrentScreen(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-violet-50 dark:bg-violet-600/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 border border-transparent'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <span className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-400'}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Pill Indicator */}
                {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white dark:ring-zinc-950" />
                )}
              </button>

              {/* Floating Tooltip when Collapsed */}
              {isSidebarCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-medium shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap hidden md:block">
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[10px] opacity-80 font-mono">({item.badge})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Quick Create Action Button */}
        <div className="pt-4 px-1">
          {isSidebarCollapsed ? (
            <div className="relative group flex justify-center">
              <button
                onClick={() => {
                  navigateToNewArticle();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                title="Create New Article"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-medium shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap hidden md:block">
                Process New Article
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                navigateToNewArticle();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-violet-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Process New Article</span>
            </button>
          )}
        </div>
      </div>

      {/* Connected Site Indicator Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 space-y-2">
        {activeSite ? (
          isSidebarCollapsed ? (
            <div className="relative group flex justify-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs cursor-pointer flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="absolute left-full bottom-2 ml-3 px-3 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap hidden md:block">
                <div className="font-bold">{activeSite.name}</div>
                <div className="text-[10px] opacity-75 font-mono">{activeSite.url}</div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
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
                    {activeSite.url.replace(/^https?:\/\//, '')} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          )
        ) : (
          !isSidebarCollapsed && (
            <button
              onClick={() => {
                setIsAddWebsiteModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 hover:border-violet-500 text-slate-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Connect Website</span>
            </button>
          )
        )}

        {/* Bottom Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={toggleSidebarCollapse}
          className={`hidden md:flex items-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-900 transition-all cursor-pointer ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between px-3 text-xs font-semibold'
          }`}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {!isSidebarCollapsed && <span>Minimize Sidebar</span>}
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform hover:scale-110" />
          ) : (
            <ChevronLeft className="w-4 h-4 transition-transform hover:scale-110" />
          )}
        </button>
      </div>
    </aside>
  );
};
