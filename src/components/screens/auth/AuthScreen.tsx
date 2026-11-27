import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../common/Button';
import { authService } from '../../../api/services/auth.service';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Key,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

type AuthScreenMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

interface RegisterValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const AuthScreen: React.FC = () => {
  const { authMode, setAuthMode, login, register, addToast } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<AuthScreenMode>(authMode);

  // Storage key for remember me
  const REMEMBER_ME_KEY = 'wp_remembered_credentials';

  // Login form state
  const [loginEmail, setLoginEmail] = useState(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_ME_KEY);
      if (saved) return JSON.parse(saved).email || '';
    } catch {
      // ignore
    }
    return '';
  });
  const [loginPassword, setLoginPassword] = useState(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_ME_KEY);
      if (saved) return JSON.parse(saved).password || '';
    } catch {
      // ignore
    }
    return '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return !!localStorage.getItem(REMEMBER_ME_KEY);
    } catch {
      return false;
    }
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<RegisterValidationErrors>({});

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password form state
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Email verification form state
  const [verifyToken, setVerifyToken] = useState('');
  const [resendEmail, setResendEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Please enter both email and password.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_ME_KEY,
          JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
        );
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }

      await login({
        email: loginEmail.trim(),
        password: loginPassword,
        deviceName: 'Postman Desktop Client',
      });
    } catch {
      // Error handled in AppContext
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit with comprehensive validation
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: RegisterValidationErrors = {};

    // 1. Full Name validation
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = 'Full Name is required.';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters long.';
    }

    // 2. Email validation
    const trimmedEmail = regEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g., user@example.com).';
    }

    // 3. Password validation
    if (!regPassword) {
      errors.password = 'Password is required.';
    } else if (regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(regPassword)) {
      errors.password = 'Password must contain at least one letter and one number.';
    }

    // 4. Confirm Password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (regPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      addToast({
        title: 'Validation Failed',
        message: 'Please resolve the highlighted errors below.',
        type: 'warning',
      });
      return;
    }

    setRegErrors({});
    setIsLoading(true);
    try {
      await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password: regPassword,
        confirmPassword,
      });
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.message;
      let generalError = '';

      if (Array.isArray(backendMessage)) {
        generalError = backendMessage.join(' • ');
      } else if (typeof backendMessage === 'string') {
        if (backendMessage.toLowerCase().includes('already exists') || err.response?.status === 409) {
          generalError = 'An account with this email address already exists. Please sign in or use forgot password.';
          setRegErrors(prev => ({ ...prev, email: 'Email is already registered.' }));
        } else {
          generalError = backendMessage;
        }
      } else {
        generalError = 'Registration failed. Please try again later.';
      }

      setRegErrors(prev => ({ ...prev, general: generalError }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit: POST /auth/forgot-password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast({
        title: 'Email Required',
        message: 'Please enter your registered email address.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email: forgotEmail.trim() });
      addToast({
        title: 'Reset Link Sent',
        message: res?.message || `Password reset instructions have been dispatched to ${forgotEmail}.`,
        type: 'success',
      });
      // Optionally transition to reset token entry
      setMode('reset-password');
    } catch (err: any) {
      addToast({
        title: 'Request Failed',
        message: err.response?.data?.message || err.message || 'Could not process password reset.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit: POST /auth/reset-password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !resetNewPassword || !resetConfirmPassword) {
      addToast({
        title: 'Missing Fields',
        message: 'Please provide the token and your new password.',
        type: 'warning',
      });
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      addToast({
        title: 'Password Mismatch',
        message: 'The new passwords do not match.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        token: resetToken.trim(),
        newPassword: resetNewPassword,
        confirmPassword: resetConfirmPassword,
      });
      addToast({
        title: 'Password Reset Successful',
        message: res?.message || 'Your password has been reset. You can now log in.',
        type: 'success',
      });
      setLoginPassword('');
      setMode('login');
      setAuthMode('login');
    } catch (err: any) {
      addToast({
        title: 'Reset Failed',
        message: err.response?.data?.message || err.message || 'Invalid or expired reset token.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify Email Submit: POST /auth/verify-email
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyToken.trim()) {
      addToast({
        title: 'Token Required',
        message: 'Please enter the verification token received in your email.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyEmail({ token: verifyToken.trim() });
      addToast({
        title: 'Email Verified',
        message: res?.message || 'Your email has been verified successfully.',
        type: 'success',
      });
      setMode('login');
    } catch (err: any) {
      addToast({
        title: 'Verification Failed',
        message: err.response?.data?.message || err.message || 'Invalid or expired verification token.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Verification Submit: POST /auth/resend-verification
  const handleResendVerification = async () => {
    const targetEmail = resendEmail.trim() || loginEmail.trim() || forgotEmail.trim();
    if (!targetEmail) {
      addToast({
        title: 'Email Required',
        message: 'Please enter the email address to resend verification to.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resendVerification({ email: targetEmail });
      addToast({
        title: 'Verification Resent',
        message: res?.message || `Verification link sent to ${targetEmail}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Resend Failed',
        message: err.response?.data?.message || err.message || 'Could not resend verification email.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 relative transition-colors">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-600" />
          )}
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-7 sm:p-8 animate-slide-fade">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="WP-Automation"
            className="h-14 sm:h-16 max-w-[280px] w-auto mx-auto mb-5 object-contain drop-shadow-xs"
          />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create an account'}
            {mode === 'forgot-password' && 'Reset your password'}
            {mode === 'reset-password' && 'Enter new password'}
            {mode === 'verify-email' && 'Verify your email'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {mode === 'login' && 'Enter your credentials to manage WordPress sites'}
            {mode === 'register' && 'Register your publisher profile to get started'}
            {mode === 'forgot-password' && 'Enter your registered email to receive a reset token'}
            {mode === 'reset-password' && 'Paste your reset token and set a secure password'}
            {mode === 'verify-email' && 'Enter the token sent to your email address'}
          </p>
        </div>

        {/* Tab Switcher for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthMode('login');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setAuthMode('register');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* ---------------- 1. LOGIN FORM ---------------- */}
        {mode === 'login' && (
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
                  placeholder="••••••••••••"
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

            {/* Remember Me Checkbox & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 focus:ring-violet-500 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                  Remember credentials
                </span>
              </label>

              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
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
        )}

        {/* ---------------- 2. REGISTER FORM ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
            {regErrors.general && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Unable to register: </span>
                  {regErrors.general}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Super Admin User"
                  value={fullName}
                  onChange={e => {
                    setFullName(e.target.value);
                    if (regErrors.fullName) setRegErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-zinc-950 border ${
                    regErrors.fullName
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
                  } text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all`}
                />
              </div>
              {regErrors.fullName && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {regErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={regEmail}
                  onChange={e => {
                    setRegEmail(e.target.value);
                    if (regErrors.email) setRegErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-zinc-950 border ${
                    regErrors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
                  } text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all`}
                />
              </div>
              {regErrors.email && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {regErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters (letters & numbers)"
                  value={regPassword}
                  onChange={e => {
                    setRegPassword(e.target.value);
                    if (regErrors.password) setRegErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-zinc-950 border ${
                    regErrors.password
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
                  } text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regErrors.password ? (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {regErrors.password}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  At least 8 characters with a mix of letters and numbers.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (regErrors.confirmPassword) setRegErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-zinc-950 border ${
                    regErrors.confirmPassword
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
                  } text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {regErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-blue-500/20 mt-2"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* ---------------- 3. FORGOT PASSWORD FORM ---------------- */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Registered Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="superadmin@gmail.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-violet-500/20"
            >
              Send Reset Token
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('reset-password')}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
              >
                Already have token?
              </button>
            </div>
          </form>
        )}

        {/* ---------------- 4. RESET PASSWORD FORM ---------------- */}
        {mode === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Reset Token
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="RAW_TOKEN_FROM_EMAIL"
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  placeholder="NewPassword123!"
                  value={resetNewPassword}
                  onChange={e => setResetNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 absolute right-2.5 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={resetConfirmPassword}
                  onChange={e => setResetConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-violet-500/20"
            >
              Reset Password
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ---------------- 5. VERIFY EMAIL FORM ---------------- */}
        {mode === 'verify-email' && (
          <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Verification Token
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="RAW_TOKEN_FROM_EMAIL"
                  value={verifyToken}
                  onChange={e => setVerifyToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-violet-500/20"
            >
              Verify Email Address
            </Button>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block">
                Did not receive email? Resend verification:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="editor@example.com"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs rounded-xl px-3 py-1.5 focus:border-violet-500 outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  Resend
                </Button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Bottom Switch Links (For Login / Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setAuthMode('register');
                  }}
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
                  onClick={() => {
                    setMode('login');
                    setAuthMode('login');
                  }}
                  className="text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            <button
              type="button"
              onClick={() => setMode('verify-email')}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-medium cursor-pointer block mx-auto"
            >
              Verify email with token →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
