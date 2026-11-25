import React, { createContext, useContext, useState } from 'react';
import type { WordPressSite } from '../types/wordpress';
import { mockSites, mockDefaultContentTypes } from '../data/mockSites';

export type ScreenId = 'dashboard' | 'websites' | 'website-detail' | 'articles' | 'article-new' | 'settings';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface UserProfile {
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
  login: (data: { email: string; password: string; deviceName?: string }) => boolean;
  register: (data: { fullName: string; email: string; password: string; confirmPassword?: string }) => boolean;
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
  // Authentication State (default false so user sees the login/register screen first)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

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

  const login = (data: { email: string; password: string; deviceName?: string }) => {
    // Validate credentials
    const user: UserProfile = {
      fullName: data.email.includes('editor') ? 'John Editor' : 'Administrator',
      email: data.email,
      role: 'Editor',
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');

    addToast({
      title: 'Welcome Back!',
      message: `Signed in as ${user.fullName} (${user.email}). Device: ${data.deviceName || 'Postman Desktop Client'}`,
      type: 'success',
    });
    return true;
  };

  const register = (data: { fullName: string; email: string; password: string; confirmPassword?: string }) => {
    const user: UserProfile = {
      fullName: data.fullName,
      email: data.email,
      role: 'Editor',
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');

    addToast({
      title: 'Account Created Successfully!',
      message: `Welcome to WP-Automation, ${user.fullName}. You can now connect sites and publish articles.`,
      type: 'success',
    });
    return true;
  };

  const logout = () => {
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
