import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Globe,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Menu,
  Bell,
  Check,
  Plus,
  Search,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    sites,
    activeSiteId,
    setActiveSiteId,
    setSelectedWebsiteIdForDetail,
    setIsAddWebsiteModalOpen,
    setCurrentScreen,
    currentUser,
    logout,
    addToast,
    toggleMobileSidebar,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredSites = sites.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q);
  });

  const handleSelectSite = (site: (typeof sites)[0]) => {
    setActiveSiteId(site.id);
    setSelectedWebsiteIdForDetail(site.id);
    setIsOpen(false);
    setSearchQuery('');
    addToast({
      title: 'Active Website Switched',
      message: `Now viewing & managing "${site.name}"`,
      type: 'info',
    });
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Left: Mobile Menu Toggle & Attractive Active WordPress Site Switcher */}
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
          <div ref={dropdownRef} className="relative min-w-0">
            {/* Custom Interactive Trigger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className={`
                flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none
                ${
                  isOpen
                    ? 'bg-violet-50/90 dark:bg-violet-950/50 border-violet-400 dark:border-violet-600 ring-2 ring-violet-500/20'
                    : 'bg-slate-50/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }
              `}
              title="Click to switch active WordPress site"
            >
              {/* Site Icon Badge with pulse indicator */}
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Globe className="w-3.5 h-3.5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
              </div>

              {/* Site Information */}
              <div className="text-left min-w-0 pr-0.5">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[170px] md:max-w-[210px] block leading-tight">
                  {activeSite ? activeSite.name : 'Select Website'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[120px] sm:max-w-[170px] md:max-w-[210px] block leading-tight">
                  {activeSite ? activeSite.url.replace(/^https?:\/\//, '') : 'No site selected'}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-violet-600 dark:text-violet-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Popover Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-3 px-3.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Select Website
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold">
                      {sites.length} {sites.length === 1 ? 'Site' : 'Sites'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setCurrentScreen('websites');
                    }}
                    className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Search Bar if > 3 sites */}
                {sites.length > 3 && (
                  <div className="p-2 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-950/30">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search websites..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-violet-500 text-slate-800 dark:text-zinc-200 placeholder-slate-400"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Sites List */}
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {filteredSites.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No matching websites found.
                    </div>
                  ) : (
                    filteredSites.map(site => {
                      const isCurrent = site.id === activeSiteId;
                      const typesCount = site.discoveredTypes?.length || 0;

                      return (
                        <button
                          key={site.id}
                          type="button"
                          onClick={() => handleSelectSite(site)}
                          className={`
                            w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group
                            ${
                              isCurrent
                                ? 'bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 shadow-2xs'
                                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Site Initial Avatar */}
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                isCurrent
                                  ? 'bg-violet-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:bg-violet-100 dark:group-hover:bg-violet-950/60 group-hover:text-violet-600'
                              }`}
                            >
                              {site.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                                  {site.name}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span className="truncate max-w-[150px] sm:max-w-[180px]">
                                  {site.url.replace(/^https?:\/\//, '')}
                                </span>
                                {typesCount > 0 && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5">
                                      <Layers className="w-2.5 h-2.5" />
                                      {typesCount} types
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {isCurrent && (
                            <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer: Connect New Site */}
                <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAddWebsiteModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect New WordPress Site</span>
                  </button>
                </div>
              </div>
            )}
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

      {/* Right: Theme switcher, Notifications, User info & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
