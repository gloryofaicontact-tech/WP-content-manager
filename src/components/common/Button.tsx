import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 active:scale-[0.98]';

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded-md gap-1.5',
    sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
    md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
    icon: 'p-2 rounded-lg',
  }[size];

  const variantClasses = {
    primary:
      'bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm shadow-violet-500/20 border border-violet-600',
    glow:
      'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-violet-500/20 border border-violet-500/40',
    secondary:
      'bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 shadow-xs',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-zinc-700',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100',
    destructive:
      'bg-rose-50 dark:bg-rose-600/10 hover:bg-rose-100 dark:hover:bg-rose-600/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
