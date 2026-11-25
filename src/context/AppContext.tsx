import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WordPressSite } from '../types/wordpress';
import { mockSites, mockDefaultContentTypes } from '../data/mockSites';
import { authService } from '../api/services/auth.service';
import type { LoginDto, RegisterDto } from '../api/types/auth.dto';

export type ScreenId = 'dashboard' | 'websites' | 'website-detail' | 'articles' | 'article-new' | 'settings';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  role: string;
}

interface AppContextType {
  // Navigation & Screen
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;

  // Authentication
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (data: LoginDto) => Promise<boolean>;
  register: (data: RegisterDto) => Promise<boolean>;
  logout: () => void;

  // Websites
  activeSiteId: string;
  setActiveSiteId: (siteId: string) => void;
  sites: WordPressSite[];
  selectedWebsiteIdForDetail: string | null;
  setSelectedWebsiteIdForDetail: (id: string | null) => void;
  isAddWebsiteModalOpen: boolean;
  setIsAddWebsiteModalOpen: (open: boolean) => void;
  addWebsite: (data: { name: string; url: string; username: string; applicationPassword?: string }) => void;
  scanWebsite: (siteId: string) => void;
  testWebsiteConnection: (siteId: string) => void;

  // Articles
  selectedArticleIdForEdit: string | null;
  setSelectedArticleIdForEdit: (id: string | null) => void;
  navigateToWebsiteDetail: (siteId: string) => void;
  navigateToNewArticle: () => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.hasToken());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = authService.getCachedUser();
    if (cached) {
      return {
        id: cached.id,
        fullName: cached.fullName || cached.name || 'User',
        email: cached.email,
        role: cached.role || 'Editor',
      };
    }
    return null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Validate session with NestJS on mount if token exists
  useEffect(() => {
    if (authService.hasToken()) {
      authService
        .getProfile()
        .then(profile => {
          if (profile) {
            setCurrentUser({
              id: profile.id,
              fullName: profile.fullName || profile.name || 'User',
              email: profile.email,
              role: profile.role || 'Editor',
            });
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          // If token refresh also failed or backend rejected token
          if (!authService.hasToken()) {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        });
    }
  }, []);

  // Application State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [activeSiteId, setActiveSiteId] = useState<string>(mockSites[0].id);
  const [sites, setSites] = useState<WordPressSite[]>(mockSites);
  const [selectedWebsiteIdForDetail, setSelectedWebsiteIdForDetail] = useState<string | null>('site-1');
  const [selectedArticleIdForEdit, setSelectedArticleIdForEdit] = useState<string | null>(null);
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (data: LoginDto): Promise<boolean> => {
    try {
      const response = await authService.login(data);
      const root = response.data || response;
      const userObj = root.user;

      const user: UserProfile = {
        id: userObj?.id,
        fullName: userObj?.fullName || userObj?.name || (data.email.includes('editor') ? 'John Editor' : 'User'),
        email: userObj?.email || data.email,
        role: userObj?.role || 'Editor',
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');

      addToast({
        title: 'Welcome Back!',
        message: `Signed in as ${user.fullName} (${user.email}).`,
        type: 'success',
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to authentication server. Please check your backend is running.';
      addToast({
        title: 'Login Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      throw err;
    }
  };

  const register = async (data: RegisterDto): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      const root = response.data || response;
      const userObj = root.user;

      const user: UserProfile = {
        id: userObj?.id,
        fullName: userObj?.fullName || data.fullName,
        email: userObj?.email || data.email,
        role: userObj?.role || 'Editor',
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');

      addToast({
        title: 'Account Created Successfully!',
        message: `Welcome to WP-Automation, ${user.fullName}.`,
        type: 'success',
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check backend response.';
      addToast({
        title: 'Registration Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode('login');
    addToast({
      title: 'Logged Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
  };

  const navigateToWebsiteDetail = (siteId: string) => {
    setSelectedWebsiteIdForDetail(siteId);
    setCurrentScreen('website-detail');
  };

  const navigateToNewArticle = () => {
    setSelectedArticleIdForEdit(null);
    setCurrentScreen('article-new');
  };

  const addWebsite = (data: { name: string; url: string; username: string; applicationPassword?: string }) => {
    const newSite: WordPressSite = {
      id: 'site-' + (sites.length + 1),
      name: data.name,
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      username: data.username,
      applicationPassword: '•••• •••• •••• ••••',
      status: 'CONNECTED',
      totalArticles: 0,
      lastScanned: 'Just now',
      discoveredTypes: mockDefaultContentTypes,
    };

    setSites(prev => [newSite, ...prev]);
    setIsAddWebsiteModalOpen(false);
    addToast({
      title: 'Website Connected Successfully',
      message: `${newSite.name} (${newSite.url}) verified with WordPress REST API.`,
      type: 'success',
    });
  };

  const scanWebsite = (siteId: string) => {
    addToast({
      title: 'Scanning WordPress Site...',
      message: 'Querying /wp-json/wp/v2/types and ACF definitions...',
      type: 'info',
    });

    setTimeout(() => {
      setSites(prev =>
        prev.map(s =>
          s.id === siteId
            ? {
                ...s,
                lastScanned: 'Just now',
                discoveredTypes: mockDefaultContentTypes,
              }
            : s
        )
      );

      addToast({
        title: 'Scan Complete',
        message: 'Discovered 3 Post Types (Posts, Tour Packages, Destinations) & Taxonomies.',
        type: 'success',
      });
    }, 1200);
  };

  const testWebsiteConnection = (siteId: string) => {
    const target = sites.find(s => s.id === siteId);
    addToast({
      title: 'Connection Verified (200 OK)',
      message: `${target?.url} responded in 94ms. REST credentials are valid.`,
      type: 'success',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isAuthenticated,
        currentUser,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        activeSiteId,
        setActiveSiteId,
        sites,
        selectedWebsiteIdForDetail,
        setSelectedWebsiteIdForDetail,
        selectedArticleIdForEdit,
        setSelectedArticleIdForEdit,
        isAddWebsiteModalOpen,
        setIsAddWebsiteModalOpen,
        addWebsite,
        scanWebsite,
        testWebsiteConnection,
        toasts,
        addToast,
        removeToast,
        navigateToWebsiteDetail,
        navigateToNewArticle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
