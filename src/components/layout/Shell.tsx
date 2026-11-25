import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { ToastContainer } from '../common/ToastContainer';
import { useApp } from '../../context/AppContext';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 animate-in fade-in"
          aria-label="Close menu"
        />
      )}

      {/* Collapsible Minimizable Animated Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto bg-slate-50/80 dark:bg-zinc-950/50 p-3.5 sm:p-5 md:p-6 lg:p-8 transition-all">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
