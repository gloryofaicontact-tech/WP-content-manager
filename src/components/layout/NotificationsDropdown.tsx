import React, { useState, useEffect, useRef } from 'react';
import { notificationsService } from '../../api/services/notifications.service';
import type { NotificationItemDto } from '../../api/types/notification.dto';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
} from 'lucide-react';

export const NotificationsDropdown: React.FC = () => {
  const { addToast } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [isClearingAll, setIsClearingAll] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load unread count on mount and periodically
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore count fetch errors
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 45 seconds
    const interval = setInterval(fetchUnreadCount, 45000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications list
  const loadNotifications = async (targetPage = 1, unreadOnly = filterUnreadOnly) => {
    setIsLoading(true);
    try {
      const result = await notificationsService.getNotifications({
        page: targetPage,
        limit: 10,
        unreadOnly: unreadOnly || undefined,
      });
      setNotifications(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
      // Also refresh unread count
      fetchUnreadCount();
    } catch (err: any) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when dropdown opens or filter toggles
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, filterUnreadOnly);
    }
  }, [isOpen, filterUnreadOnly]);

  // Handle outside click & Escape key
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

  // Mark a single notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not mark notification as read.',
        type: 'error',
      });
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast({
        title: 'All Read',
        message: 'All notifications marked as read.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not mark all as read.',
        type: 'error',
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Delete a single notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const target = notifications.find(n => n.id === id);
      await notificationsService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete notification.',
        type: 'error',
      });
    }
  };

  // Delete all notifications
  const handleConfirmClearAll = async () => {
    setIsClearingAll(true);
    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setShowClearConfirmModal(false);
      addToast({
        title: 'Notifications Cleared',
        message: 'All notifications have been removed.',
        type: 'info',
      });
    } catch (err: any) {
      addToast({
        title: 'Clear Failed',
        message: err.message || 'Could not clear notifications.',
        type: 'error',
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  // Icon helper based on notification type
  const getTypeIcon = (type?: string) => {
    const t = (type || 'info').toLowerCase();
    if (t.includes('success') || t.includes('publish')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (t.includes('warning') || t.includes('placeholder')) {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    if (t.includes('error') || t.includes('fail')) {
      return <AlertCircle className="w-4 h-4 text-rose-500" />;
    }
    return <Info className="w-4 h-4 text-violet-500" />;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-label="Open notifications"
        className={`
          relative p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200
          hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl border transition-colors cursor-pointer
          ${
            isOpen
              ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-slate-200 dark:border-zinc-800'
          }
        `}
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-4 h-4" />

        {/* Unread badge count or pulse indicator */}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-700 opacity-50" />
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Mark all read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => loadNotifications(1, filterUnreadOnly)}
                disabled={isLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-violet-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                !filterUnreadOnly
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterUnreadOnly
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                  filterUnreadOnly ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-violet-600 mx-auto" />
                <p className="text-xs">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {filterUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  You are completely caught up! We will notify you when article publishing or sync activities complete.
                </p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 group ${
                    !item.isRead
                      ? 'bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50/70 dark:hover:bg-violet-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Type Icon */}
                  <div className="mt-0.5 shrink-0">
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs leading-snug line-clamp-1 ${
                        !item.isRead
                          ? 'font-bold text-slate-900 dark:text-zinc-100'
                          : 'font-semibold text-slate-700 dark:text-zinc-300'
                      }`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline pt-0.5"
                      >
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Pagination / Status */}
          {totalPages > 1 && (
            <div className="p-2.5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => loadNotifications(page - 1)}
                  disabled={page <= 1 || isLoading}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => loadNotifications(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        title="Clear All Notifications"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-700 dark:text-zinc-200 font-semibold">
                Are you sure you want to delete all notifications?
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This will permanently delete all records across all pages. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirmModal(false)}
              disabled={isClearingAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmClearAll}
              isLoading={isClearingAll}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
