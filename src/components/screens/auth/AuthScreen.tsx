import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../common/Button';
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { authMode, setAuthMode, login, register, addToast } = useApp();
  const { theme, toggleTheme } = useTheme();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      addToast({
        title: 'Error',
        message: 'Please enter both email and password.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login({
        email: loginEmail.trim(),
        password: loginPassword,
        deviceName: 'Postman Desktop Client',
      });
      setIsLoading(false);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !regEmail.trim() || !regPassword.trim() || !confirmPassword.trim()) {
      addToast({
        title: 'Error',
        message: 'Please fill in all fields.',
        type: 'warning',
      });
      return;
    }

    if (regPassword !== confirmPassword) {
      addToast({
        title: 'Error',
        message: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword,
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 relative transition-colors">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
        </button>
      </div>

      {/* Main Centered Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-7 sm:p-8 animate-slide-fade">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 mx-auto flex items-center justify-center text-white shadow-md shadow-violet-500/20 mb-3">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {authMode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {authMode === 'login'
              ? 'Enter your email and password to continue'
              : 'Enter your details below to get started'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* ---------------- LOGIN FORM ---------------- */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="editor@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="SecurePass123!"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-violet-500/20 mt-2"
            >
              Sign In
            </Button>
          </form>
        ) : (
          /* ---------------- REGISTER FORM ---------------- */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="John Editor"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="editor@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="SecurePass123!"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="SecurePass123!"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-violet-500/20 mt-2"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* Bottom Switch Link */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
          {authMode === 'login' ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
