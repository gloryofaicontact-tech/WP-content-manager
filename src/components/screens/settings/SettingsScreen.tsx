import React, { useState, useEffect } from 'react';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { McpIntegrationsTab } from './McpIntegrationsTab';
import { useApp } from '../../../context/AppContext';
import { settingsService } from '../../../api/services/settings.service';
import type {
  AiSettingsDataDto,
  AiProviderName,
  UpdateAiSettingsDto,
} from '../../../api/types/settings.dto';
import {
  Sparkles,
  Cpu,
  Key,
  Image,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Trash2,
  AlertCircle,
  Zap,
  Camera,
  AlertTriangle,
  Plug,
  Shield,
  Lock,
  Laptop,
  Smartphone,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { authService } from '../../../api/services/auth.service';
import type { UserSessionDto } from '../../../api/types/auth.dto';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    deleteCurrentUserProfile,
    logout,
    addToast,
  } = useApp();

  // Active Settings Tab: 'ai' | 'mcp' | 'profile' | 'security'
  const [activeTab, setActiveTab] = useState<'ai' | 'mcp' | 'profile' | 'security'>('ai');

  // ==========================================
  // Security & Sessions State
  // ==========================================
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email verification state
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<UserSessionDto[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
      } else {
        setSessions([
          {
            id: 'current-session',
            deviceName: 'Current Web Client',
            ipAddress: '::1 (Localhost)',
            userAgent: navigator.userAgent,
            isCurrent: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setSessions([
        {
          id: 'current-session',
          deviceName: 'Current Web Client',
          ipAddress: '::1 (Localhost)',
          userAgent: navigator.userAgent,
          isCurrent: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
  }, [activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast({
        title: 'Validation Error',
        message: 'Please complete all password fields.',
        type: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: 'Password Mismatch',
        message: 'The new passwords do not match.',
        type: 'error',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({ oldPassword, newPassword, confirmPassword });
      addToast({
        title: 'Password Changed',
        message: 'Your password has been updated successfully.',
        type: 'success',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.response?.data?.message || err.message || 'Could not change password.',
        type: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) {
      addToast({
        title: 'Token Required',
        message: 'Please enter the email verification token.',
        type: 'warning',
      });
      return;
    }

    setIsVerifyingEmail(true);
    try {
      await authService.verifyEmail({ token: verifyTokenInput.trim() });
      addToast({
        title: 'Email Verified',
        message: 'Your email address has been successfully verified.',
        type: 'success',
      });
      setVerifyTokenInput('');
    } catch (err: any) {
      addToast({
        title: 'Verification Failed',
        message: err.response?.data?.message || err.message || 'Invalid or expired token.',
        type: 'error',
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser?.email) return;
    setIsResendingVerification(true);
    try {
      await authService.resendVerification({ email: currentUser.email });
      addToast({
        title: 'Verification Dispatched',
        message: `Verification instructions sent to ${currentUser.email}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Resend Failed',
        message: err.response?.data?.message || err.message || 'Could not resend email.',
        type: 'error',
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await authService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      addToast({
        title: 'Session Revoked',
        message: 'The session has been terminated.',
        type: 'info',
      });
    } catch (err: any) {
      addToast({
        title: 'Revoke Failed',
        message: err.response?.data?.message || err.message || 'Could not revoke session.',
        type: 'error',
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await authService.logoutAll();
      addToast({
        title: 'Signed Out Everywhere',
        message: 'All active sessions have been terminated. Redirecting to login...',
        type: 'info',
      });
      setShowLogoutAllModal(false);
      logout();
    } catch (err: any) {
      addToast({
        title: 'Logout Failed',
        message: err.response?.data?.message || err.message || 'Could not log out of all devices.',
        type: 'error',
      });
      setIsLoggingOutAll(false);
    }
  };

  // ==========================================
  // AI & Media Settings State
  // ==========================================
  const [aiSettings, setAiSettings] = useState<AiSettingsDataDto | null>(null);
  const [isLoadingAiSettings, setIsLoadingAiSettings] = useState<boolean>(true);
  const [isSavingAiSettings, setIsSavingAiSettings] = useState<boolean>(false);

  // Form inputs for updating AI settings
  const [activeProvider, setActiveProvider] = useState<string>('openai');
  const [openAiApiKey, setOpenAiApiKey] = useState<string>('');
  const [anthropicApiKey, setAnthropicApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [envatoApiToken, setEnvatoApiToken] = useState<string>('');

  // Password visibility toggles
  const [showOpenAiKey, setShowOpenAiKey] = useState<boolean>(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState<boolean>(false);
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [showEnvatoToken, setShowEnvatoToken] = useState<boolean>(false);

  // Per-provider testing states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // ==========================================
  // Profile & Account State
  // ==========================================
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [profileImage, setProfileImage] = useState<string>(currentUser?.profileImage || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState<boolean>(false);

  // Keep profile inputs synced when currentUser loads/changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setProfileImage(currentUser.profileImage || '');
    }
  }, [currentUser]);

  // Fetch AI Settings from backend: GET /settings/ai
  const fetchAiSettings = async () => {
    setIsLoadingAiSettings(true);
    try {
      const data = await settingsService.getAiSettings();
      setAiSettings(data);
      if (data?.activeProvider) {
        setActiveProvider(data.activeProvider);
      }
    } catch (err: any) {
      console.error('[fetchAiSettings] Failed:', err);
      addToast({
        title: 'Failed to load AI settings',
        message: err.message || 'Could not connect to settings server.',
        type: 'error',
      });
    } finally {
      setIsLoadingAiSettings(false);
    }
  };

  useEffect(() => {
    fetchAiSettings();
  }, []);

  // Save AI Settings: PUT /settings/ai
  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAiSettings(true);
    try {
      const payload: UpdateAiSettingsDto = {
        activeProvider: activeProvider as AiProviderName,
      };

      if (openAiApiKey.trim()) {
        payload.openAiApiKey = openAiApiKey.trim();
      }
      if (anthropicApiKey.trim()) {
        payload.anthropicApiKey = anthropicApiKey.trim();
      }
      if (geminiApiKey.trim()) {
        payload.geminiApiKey = geminiApiKey.trim();
      }
      if (envatoApiToken.trim()) {
        payload.envatoApiToken = envatoApiToken.trim();
      }

      await settingsService.updateAiSettings(payload);

      addToast({
        title: 'Settings Saved Successfully',
        message: `Active provider set to "${activeProvider}". API keys updated.`,
        type: 'success',
      });

      setOpenAiApiKey('');
      setAnthropicApiKey('');
      setGeminiApiKey('');
      setEnvatoApiToken('');
      await fetchAiSettings();
    } catch (err: any) {
      console.error('[handleSaveAiSettings] Failed:', err);
      addToast({
        title: 'Failed to Save Settings',
        message: err.message || 'An error occurred while updating AI configuration.',
        type: 'error',
      });
    } finally {
      setIsSavingAiSettings(false);
    }
  };

  // Test AI Provider: POST /settings/ai/test
  const handleTestProvider = async (provider: 'openai' | 'claude' | 'gemini') => {
    setTestingProvider(provider);
    try {
      const res = await settingsService.testAiProvider({ provider });
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: res.success ?? true,
          message: res.message || `${provider} connection test succeeded.`,
        },
      }));
      addToast({
        title: `${provider.toUpperCase()} Connection Valid`,
        message: res.message || 'API responded successfully.',
        type: 'success',
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Connection test failed';
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: false,
          message: errMsg,
        },
      }));
      addToast({
        title: `${provider.toUpperCase()} Test Failed`,
        message: errMsg,
        type: 'error',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  // Save Profile: PATCH/PUT/POST /users/profile-update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Full name cannot be empty.',
        type: 'warning',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateCurrentUserProfile({
        fullName: fullName.trim(),
        profileImage: profileImage.trim(),
      });
    } catch (err: any) {
      console.error('[handleSaveProfile] Error:', err);
      addToast({
        title: 'Failed to Update Profile',
        message: err.response?.data?.message || err.message || 'Error updating profile.',
        type: 'error',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Delete Profile: DELETE/POST /users/profile-delete
  const handleDeleteProfile = async () => {
    setIsDeletingProfile(true);
    try {
      await deleteCurrentUserProfile();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('[handleDeleteProfile] Error:', err);
      addToast({
        title: 'Failed to Delete Profile',
        message: err.response?.data?.message || err.message || 'Could not delete profile.',
        type: 'error',
      });
      setIsDeletingProfile(false);
    }
  };

  // Provider definition helper
  const providerMeta = [
    {
      id: 'openai' as const,
      name: 'OpenAI',
      modelDefault: 'gpt-4o-mini',
      desc: 'High speed and reliable structured content processing with GPT-4o.',
      apiKeyState: openAiApiKey,
      setApiKeyState: setOpenAiApiKey,
      showKey: showOpenAiKey,
      setShowKey: setShowOpenAiKey,
      placeholder: 'sk-svcacct-... or sk-proj-...',
    },
    {
      id: 'claude' as const,
      name: 'Anthropic Claude',
      modelDefault: 'claude-3-5-sonnet-latest',
      desc: 'Exceptional literary depth, creative nuance, and detailed analysis.',
      apiKeyState: anthropicApiKey,
      setApiKeyState: setAnthropicApiKey,
      showKey: showAnthropicKey,
      setShowKey: setShowAnthropicKey,
      placeholder: 'sk-ant-api03-...',
    },
    {
      id: 'gemini' as const,
      name: 'Google Gemini',
      modelDefault: 'gemini-2.5-flash',
      desc: 'Next-gen multimodal reasoning with rapid inference speed.',
      apiKeyState: geminiApiKey,
      setApiKeyState: setGeminiApiKey,
      showKey: showGeminiKey,
      setShowKey: setShowGeminiKey,
      placeholder: 'AIzaSy...',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Settings & Configurations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage your AI extraction providers, API credentials, media integrations, and administrator profile.
          </p>
        </div>

        {activeTab === 'ai' && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAiSettings}
            disabled={isLoadingAiSettings}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAiSettings ? 'animate-spin' : ''}`} />
            <span>Reload Status</span>
          </Button>
        )}
      </div>

      {/* Tabs Navigation: 2 Streamlined Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 w-fit max-w-full overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'ai'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI & Media Providers</span>
          {aiSettings?.activeProvider && (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-white/20">
              {aiSettings.activeProvider}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mcp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'mcp'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Plug className="w-4 h-4" />
          <span>MCP Connect</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Account</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'security'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: MCP INTEGRATIONS & CONNECTION KEYS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'mcp' && <McpIntegrationsTab />}

      {/* ========================================================================= */}
      {/* TAB 1: AI & MEDIA PROVIDERS SETTINGS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSaveAiSettings} className="space-y-6">
          {/* Active AI Provider Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Active AI Processing Engine
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Select which AI model powers the raw document structuring and metadata extraction pipeline.
                  </p>
                </div>
              </div>

              {aiSettings?.updatedAt && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Last updated: {new Date(aiSettings.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Provider Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {providerMeta.map(p => {
                const config = aiSettings?.providers?.[p.id];
                const isSelected = activeProvider === p.id;
                const isConfigured = config?.isConfigured ?? false;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProvider(p.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {p.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-slate-300 dark:border-zinc-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                        {config?.model || p.modelDefault}
                      </span>

                      {isConfigured ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Configured</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Unconfigured</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider API Keys Configuration Cards */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  AI Provider API Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Configure access keys for your AI providers. Leave inputs empty to preserve your currently active stored keys.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {providerMeta.map(p => {
                const config = aiSettings?.providers?.[p.id];
                const isTesting = testingProvider === p.id;
                const testResult = testResults[p.id];

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                          {p.name} API Key
                        </span>
                        {config?.source && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            Source: {config.source}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {config?.maskedKey ? (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                            Current: {config.maskedKey}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-500 italic">No key configured</span>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isTesting || (!config?.isConfigured && !p.apiKeyState.trim())}
                          onClick={() => handleTestProvider(p.id)}
                          className="text-xs flex items-center gap-1.5 h-7 px-2.5"
                        >
                          {isTesting ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-violet-600" />
                          ) : (
                            <Zap className="w-3 h-3 text-amber-500" />
                          )}
                          <span>Test</span>
                        </Button>
                      </div>
                    </div>

                    {/* Key Input with Password Toggle */}
                    <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-violet-500 transition-colors">
                      <Key className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                      <input
                        type={p.showKey ? 'text' : 'password'}
                        value={p.apiKeyState}
                        onChange={e => p.setApiKeyState(e.target.value)}
                        placeholder={config?.maskedKey ? `Enter new key to update (${p.placeholder})` : p.placeholder}
                        className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => p.setShowKey(!p.showKey)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 ml-2 cursor-pointer"
                      >
                        {p.showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Test result feedback banner */}
                    {testResult && (
                      <div
                        className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Envato Elements Stock Media Token */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Envato Elements Media Token
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Powers the automated Media Discovery engine to search and embed royalty-free stock imagery into your articles.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                    Envato API Bearer Token
                  </span>
                  {aiSettings?.envato?.source && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      Source: {aiSettings.envato.source}
                    </span>
                  )}
                </div>

                {aiSettings?.envato?.maskedToken ? (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                    Current: {aiSettings.envato.maskedToken}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-500 italic">No token configured</span>
                )}
              </div>

              {/* Token Input with Password Toggle */}
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-violet-500 transition-colors">
                <Key className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type={showEnvatoToken ? 'text' : 'password'}
                  value={envatoApiToken}
                  onChange={e => setEnvatoApiToken(e.target.value)}
                  placeholder={
                    aiSettings?.envato?.maskedToken
                      ? 'Enter new Envato token to update (leave blank to keep current)'
                      : 'Enter your Envato Elements Personal API Token'
                  }
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowEnvatoToken(!showEnvatoToken)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 ml-2 cursor-pointer"
                >
                  {showEnvatoToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchAiSettings}
              disabled={isSavingAiSettings}
            >
              Reset / Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingAiSettings}
              className="flex items-center gap-2"
            >
              {isSavingAiSettings ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save AI Configuration</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROFILE & ACCOUNT                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-3xl">
          {/* Profile Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Profile Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Update your display name, avatar photo URL, and view account credentials.
                </p>
              </div>
            </div>

            {/* Avatar Preview & Quick Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80">
              <div className="relative shrink-0">
                {profileImage.trim() ? (
                  <img
                    src={profileImage}
                    alt={fullName || 'Avatar'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/30 shadow-xs"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-xs">
                    {fullName
                      ? fullName
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-900 rounded-full shadow-xs border border-slate-200 dark:border-zinc-700 text-slate-500">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    {fullName || 'User Name'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50">
                    {currentUser?.role || 'Admin'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  {currentUser?.email || 'admin@example.com'}
                </p>
              </div>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
                  <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Super Admin User"
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Profile Image URL
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
                  <Image className="w-4 h-4 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                  <input
                    type="url"
                    value={profileImage}
                    onChange={e => setProfileImage(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Provide a direct HTTPS image URL for your profile picture.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Email Address (Primary Identity)
                </label>
                <div className="flex items-center bg-slate-100/70 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 cursor-not-allowed opacity-80">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full bg-transparent text-xs text-slate-500 dark:text-zinc-400 focus:outline-none cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                    Verified
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-200/60 dark:border-rose-900/40">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Danger Zone
                </h2>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  Irreversible actions regarding your account profile.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Delete Profile & Account
                </h3>
                <p className="text-xs text-rose-600/80 dark:text-rose-400 leading-relaxed max-w-xl">
                  Permanently erase your user profile and associated account credentials. This action is immediately irreversible.
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="shrink-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY & SESSIONS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Card 1: Change Password */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Update Account Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Ensure your account is protected with a robust, unique password.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full px-3 py-2 pr-10 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-hidden focus:border-violet-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-3 py-2 pr-10 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-hidden focus:border-violet-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-3 py-2 pr-10 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-hidden focus:border-violet-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isChangingPassword}
                  className="flex items-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Card 2: Email Verification */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Email Verification Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Verify your email address to unlock automated digests, reports, and security notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Registered Email</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{currentUser?.email}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="text-xs shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResendingVerification ? 'animate-spin' : ''}`} />
                  <span>Resend Verification Link</span>
                </Button>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Submit Verification Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyTokenInput}
                    onChange={(e) => setVerifyTokenInput(e.target.value)}
                    placeholder="Paste verification token received in email..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-hidden focus:border-violet-500 transition-colors"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isVerifyingEmail || !verifyTokenInput.trim()}
                    className="shrink-0 flex items-center gap-1.5"
                  >
                    {isVerifyingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Card 3: Active Sessions Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Active Devices & Login Sessions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Manage and revoke active sessions connected to your account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchSessions}
                  disabled={isLoadingSessions}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowLogoutAllModal(true)}
                  className="flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Everywhere</span>
                </Button>
              </div>
            </div>

            {isLoadingSessions ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <RefreshCw className="w-4 h-4 animate-spin text-violet-600" />
                <span>Loading active sessions...</span>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic">No active sessions reported.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 mt-0.5">
                        {session.userAgent?.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {session.deviceName || 'Web Browser'}
                          </span>
                          {session.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                          IP: {session.ipAddress || 'Unknown'} {session.createdAt ? `• Started ${new Date(session.createdAt).toLocaleDateString()}` : ''}
                        </div>
                        {session.userAgent && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-md">
                            {session.userAgent}
                          </div>
                        )}
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={revokingSessionId === session.id}
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 shrink-0 self-end sm:self-auto flex items-center gap-1"
                      >
                        {revokingSessionId === session.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Revoke</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Sign Out Everywhere */}
      <Modal
        isOpen={showLogoutAllModal}
        onClose={() => !isLoggingOutAll && setShowLogoutAllModal(false)}
        title="Sign Out of All Devices"
        maxWidth="md"
      >
        <div className="space-y-4 p-1">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <p className="font-bold">Terminate all active user sessions</p>
              <p>
                This will immediately invalidate your authentication tokens on all connected phones, computers, and browsers, including this one. You will be redirected to the sign-in screen.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoggingOutAll}
              onClick={() => setShowLogoutAllModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoggingOutAll}
              onClick={handleLogoutAll}
              className="flex items-center gap-1.5"
            >
              {isLoggingOutAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Everywhere</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Profile Deletion */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeletingProfile && setIsDeleteModalOpen(false)}
        title="Delete Profile & Account"
        maxWidth="md"
      >
        <div className="space-y-4 p-1">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-bold">This action cannot be undone.</p>
              <p>
                Your account, profile preferences, and session tokens will be permanently deleted from the database.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Are you sure you want to permanently delete profile{' '}
            <strong className="text-slate-900 dark:text-zinc-100 font-semibold">
              {currentUser?.email}
            </strong>
            ?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeletingProfile}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeletingProfile}
              onClick={handleDeleteProfile}
              className="flex items-center gap-1.5"
            >
              {isDeletingProfile ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete My Account</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
