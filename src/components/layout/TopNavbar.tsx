import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus,
  Bell,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '../common/Button';

export const TopNavbar: React.FC = () => {
  const {
    sites,
    activeSiteId,
    setActiveSiteId,
    setIsAddWebsiteModalOpen,
    navigateToNewArticle,
    currentUser,
    logout,
    addToast,
    toggleMobileSidebar,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle & Active WordPress Site Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shrink-0"
          title="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {sites.length > 0 ? (
          <div className="relative min-w-0">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 shadow-xs cursor-pointer max-w-[170px] sm:max-w-xs md:max-w-sm">
              <Globe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              <select
                value={activeSiteId}
                onChange={e => {
                  setActiveSiteId(e.target.value);
                  const s = sites.find(site => site.id === e.target.value);
                  addToast({
                    title: 'Active Website Changed',
                    message: `Now managing ${s?.name}`,
                    type: 'info',
                  });
                }}
                className="bg-transparent text-xs text-slate-800 dark:text-zinc-200 outline-none cursor-pointer pr-4 appearance-none font-medium truncate w-full"
              >
                {sites.map(site => (
                  <option
                    key={site.id}
                    value={site.id}
                    className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
                  >
                    {site.name} ({site.url})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddWebsiteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-semibold text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Connect Website</span>
          </button>
        )}

        {sites.length > 0 && (
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        )}
      </div>

      {/* Right: Quick actions, Theme switcher, Notifications, User info & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddWebsiteModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="hidden md:inline-flex"
        >
          Connect Website
        </Button>

        <Button
          variant="glow"
          size="sm"
          onClick={navigateToNewArticle}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          Add New Article
        </Button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() =>
            addToast({
              title: 'All Systems Operational',
              message: 'REST API connections are active and ready to publish.',
              type: 'info',
            })
          }
          className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        {/* User Profile Avatar & Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
          {currentUser?.profileImage ? (
            <img
              src={currentUser.profileImage}
              alt={currentUser.fullName || 'User Avatar'}
              className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              {currentUser?.fullName
                ? currentUser.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </div>
          )}

          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block leading-tight truncate max-w-[120px]">
              {currentUser?.fullName || 'User'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[120px]">
              {currentUser?.email || 'admin@quicksite.asia'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ml-0.5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
