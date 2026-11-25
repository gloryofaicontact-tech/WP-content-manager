import React from 'react';
import type { ArticleStatus } from '../../types/article';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'violet' | 'secondary' | 'outline';
  status?: ArticleStatus;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'sm',
  className = '',
  showDot = true,
}) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60';
  let dotColor = 'bg-slate-400 dark:bg-zinc-400';

  if (status) {
    switch (status) {
      case 'Draft':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
        dotColor = 'bg-amber-500 dark:bg-amber-400';
        break;
      case 'AI Enhanced':
        colorClasses = 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/40 ring-1 ring-violet-500/10 dark:ring-violet-500/20';
        dotColor = 'bg-violet-600 dark:bg-violet-400';
        break;
      case 'Published':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
        dotColor = 'bg-emerald-500 dark:bg-emerald-400';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'success':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
        dotColor = 'bg-emerald-500 dark:bg-emerald-400';
        break;
      case 'warning':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
        dotColor = 'bg-amber-500 dark:bg-amber-400';
        break;
      case 'violet':
        colorClasses = 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/30';
        dotColor = 'bg-violet-600 dark:bg-violet-400';
        break;
      case 'outline':
        colorClasses = 'bg-transparent text-slate-600 border-slate-300 dark:text-zinc-400 dark:border-zinc-700/80';
        dotColor = 'bg-slate-400 dark:bg-zinc-400';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60';
        dotColor = 'bg-slate-400 dark:bg-zinc-400';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-tight whitespace-nowrap shrink-0 ${colorClasses} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {children}
    </span>
  );
};
