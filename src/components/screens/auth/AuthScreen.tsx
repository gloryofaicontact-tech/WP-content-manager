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
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Laptop,
  Sun,
  Moon,
  ShieldCheck,
  Globe,
  Code2,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { authMode, setAuthMode, login, register, addToast } = useApp();
  const { theme, toggleTheme } = useTheme();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [deviceName] = useState('Postman Desktop Client');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPayloadInspector, setShowPayloadInspector] = useState(false);

  // One-click demo credentials loader
  const handleFillDemo = (type: 'login' | 'register') => {
    if (type === 'login') {
      setLoginEmail('editor@example.com');
      setLoginPassword('SecurePass123!');
      addToast({
        title: 'Demo Login Credentials Filled',
        message: 'email: editor@example.com, device: Postman Desktop Client',
        type: 'info',
      });
    } else {
      setFullName('John Editor');
      setRegEmail('editor@example.com');
      setRegPassword('SecurePass123!');
      setConfirmPassword('SecurePass123!');
      addToast({
        title: 'Demo Register Credentials Filled',
        message: 'Full Name: John Editor, Email: editor@example.com',
        type: 'info',
      });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      addToast({
        title: 'Missing Information',
        message: 'Please provide both email and password.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login({
        email: loginEmail.trim(),
        password: loginPassword,
        deviceName,
      });
      setIsLoading(false);
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      addToast({
        title: 'Missing Information',
        message: 'Please fill in all registration fields.',
        type: 'warning',
      });
      return;
    }

    if (regPassword !== confirmPassword) {
      addToast({
        title: 'Password Mismatch',
        message: 'Passwords do not match. Please verify.',
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
    }, 900);
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', percent: 0 };
    if (pwd.length < 6) return { label: 'Weak', color: 'bg-rose-500', percent: 30 };
    if (pwd.length < 10) return { label: 'Good', color: 'bg-amber-500', percent: 65 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const pwdStrength = getPasswordStrength(regPassword);

  const loginPayloadJSON = {
    email: loginEmail || 'editor@example.com',
    password: loginPassword ? '••••••••••••' : 'SecurePass123!',
    deviceName: deviceName,
  };

  const registerPayloadJSON = {
    email: regEmail || 'editor@example.com',
    password: regPassword ? '••••••••••••' : 'SecurePass123!',
    confirmPassword: confirmPassword ? '••••••••••••' : 'SecurePass123!',
    fullName: fullName || 'John Editor',
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden transition-colors selection:bg-violet-600/20 selection:text-violet-600">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-violet-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-5xl rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 animate-slide-fade">
        
        {/* Left Column: Brand Hero & Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Top: Logo & Tag */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight block">WP-Automation</span>
                <span className="text-[11px] font-mono text-violet-200 uppercase tracking-widest font-semibold">
                  Publishing Engine
                </span>
              </div>
            </div>

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-violet-100 shadow-xs mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI-Powered CMS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Publish to WordPress sites with 1-click ease.
              </h2>
              <p className="text-xs sm:text-sm text-violet-100/90 mt-2.5 leading-relaxed">
                Connect your WordPress REST endpoints, auto-discover Custom Post Types, and enhance articles with headings & SEO meta.
              </p>
            </div>
          </div>

          {/* Middle: Feature highlights */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-violet-100 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Full Custom Post Type & ACF Schema Scanning</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-violet-100 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>AI Markdown / H2 / H3 Outline & SEO Structuring</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-violet-100 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Direct WP Application Password Authorization</span>
            </div>
          </div>

          {/* Bottom: Testimonial & Security Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-violet-200">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> End-to-End Encrypted
            </span>
            <span className="font-mono text-white/80">v2.4 LTS</span>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Tabs Switcher: Sign In vs Create Account */}
            <div className="flex items-center justify-between mb-8">
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 inline-flex shadow-inner">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Demo Credentials Quick Fill Button */}
              <button
                type="button"
                onClick={() => handleFillDemo(authMode)}
                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/30 transition-all cursor-pointer shadow-xs"
                title="Fill sample demo credentials from prompt"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo Data</span>
              </button>
            </div>

            {/* Header info */}
            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {authMode === 'login' ? 'Welcome back' : 'Start your free workspace'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {authMode === 'login'
                  ? 'Enter your email and password to access your WordPress publishing pipeline.'
                  : 'Join WP-Automation to manage custom post types and automate editorial publishing.'}
              </p>
            </div>

            {/* ---------------- LOGIN FORM ---------------- */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-slide-fade">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="editor@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-3.5 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={e => {
                        e.preventDefault();
                        addToast({
                          title: 'Reset Password',
                          message: 'Password reset link sent to registered email.',
                          type: 'info',
                        });
                      }}
                      className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="SecurePass123!"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-10 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 absolute right-2.5 cursor-pointer"
                      title={showLoginPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Device metadata indicator */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    Device: <strong className="text-slate-700 dark:text-zinc-300 font-mono">{deviceName}</strong>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    Auto-attached
                  </span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="glow"
                  size="md"
                  isLoading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full font-bold shadow-md shadow-violet-500/20 mt-2"
                >
                  Sign In to Dashboard
                </Button>
              </form>
            )}

            {/* ---------------- REGISTER FORM ---------------- */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-slide-fade">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="John Editor"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-3.5 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="editor@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-3.5 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="SecurePass123!"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-10 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 absolute right-2.5 cursor-pointer"
                      title={showRegPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {regPassword && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${pwdStrength.percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{pwdStrength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="SecurePass123!"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-zinc-950 border text-xs font-medium text-slate-900 dark:text-zinc-100 rounded-xl pl-10 pr-10 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-xs ${
                        confirmPassword && confirmPassword !== regPassword
                          ? 'border-rose-400 focus:border-rose-500'
                          : confirmPassword && confirmPassword === regPassword
                          ? 'border-emerald-400 focus:border-emerald-500'
                          : 'border-slate-200 dark:border-zinc-800 focus:border-violet-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 absolute right-2.5 cursor-pointer"
                      title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    required
                    id="terms"
                    className="rounded border-slate-300 dark:border-zinc-700 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="cursor-pointer">
                    I agree to the <span className="text-violet-600 dark:text-violet-400 font-medium">Terms of Service</span> and <span className="text-violet-600 dark:text-violet-400 font-medium">Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="glow"
                  size="md"
                  isLoading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full font-bold shadow-md shadow-violet-500/20 mt-1"
                >
                  Create WP-Automation Account
                </Button>
              </form>
            )}
          </div>

          {/* Bottom Footer: JSON Payload Inspector Toggle */}
          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                REST Payload Spec
              </span>
              <button
                type="button"
                onClick={() => setShowPayloadInspector(!showPayloadInspector)}
                className="text-[11px] font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                {showPayloadInspector ? 'Hide JSON' : 'Inspect JSON Payload'}
              </button>
            </div>

            {/* Collapsible JSON Preview Box */}
            {showPayloadInspector && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto shadow-inner animate-slide-fade">
                <div className="flex justify-between items-center text-slate-400 pb-1 mb-1 border-b border-slate-800 text-[10px]">
                  <span>{authMode.toUpperCase()} REQUEST BODY</span>
                  <span>application/json</span>
                </div>
                <pre className="text-violet-300">
                  {JSON.stringify(authMode === 'login' ? loginPayloadJSON : registerPayloadJSON, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
