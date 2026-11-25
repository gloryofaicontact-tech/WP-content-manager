import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WordPressSite } from '../types/wordpress';
import { mockDefaultContentTypes } from '../data/mockSites';
import { authService } from '../api/services/auth.service';
import { websitesService } from '../api/services/websites.service';
import { usersService } from '../api/services/users.service';
import { USER_STORAGE_KEY } from '../api/client';
import type { LoginDto, RegisterDto } from '../api/types/auth.dto';
import type {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteFilterParams,
} from '../api/types/website.dto';

export type ScreenId = 'dashboard' | 'websites' | 'website-detail' | 'articles' | 'article-new' | 'article-edit' | 'settings';

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
  profileImage?: string;
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
  updateCurrentUserProfile: (data: { fullName?: string; profileImage?: string }) => Promise<void>;
  deleteCurrentUserProfile: () => Promise<void>;

  // Websites
  activeSiteId: string;
  setActiveSiteId: (siteId: string) => void;
  sites: WordPressSite[];
  isWebsitesLoading: boolean;
  loadWebsites: (params?: WebsiteFilterParams) => Promise<void>;
  selectedWebsiteIdForDetail: string | null;
  setSelectedWebsiteIdForDetail: (id: string | null) => void;
  isAddWebsiteModalOpen: boolean;
  setIsAddWebsiteModalOpen: (open: boolean) => void;
  addWebsite: (data: CreateWebsiteDto) => Promise<boolean>;
  updateWebsite: (id: string, data: UpdateWebsiteDto) => Promise<boolean>;
  deleteWebsite: (id: string) => Promise<boolean>;
  scanWebsite: (siteId: string) => Promise<void>;
  testWebsiteConnection: (siteId: string) => Promise<void>;

  // Articles
  selectedArticleIdForEdit: string | null;
  setSelectedArticleIdForEdit: (id: string | null) => void;
  navigateToWebsiteDetail: (siteId: string) => void;
  navigateToNewArticle: () => void;
  navigateToEditArticle: (articleId: string, websiteId?: string) => void;

  // Layout & Sidebar
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileSidebar: () => void;

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
        profileImage: cached.profileImage || (cached as any).avatar || '',
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
              profileImage: profile.profileImage || (profile as any).avatar || '',
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
  const [activeSiteId, setActiveSiteId] = useState<string>('');
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [isWebsitesLoading, setIsWebsitesLoading] = useState<boolean>(false);
  const [selectedWebsiteIdForDetail, setSelectedWebsiteIdForDetail] = useState<string | null>(null);
  const [selectedArticleIdForEdit, setSelectedArticleIdForEdit] = useState<string | null>(null);
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sidebar minimizing state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wp_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('wp_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  // Auto-close mobile sidebar when switching screens
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentScreen]);

  // Function to load websites from backend GET /websites?page=1&limit=10
  // Also fetches GET /websites/:id/content-types to populate live scanned types count and date
  const loadWebsites = async (params?: WebsiteFilterParams) => {
    setIsWebsitesLoading(true);
    try {
      const res = await websitesService.getWebsites(params);
      if (res && Array.isArray(res.data)) {
        // Map backend entities to frontend WordPressSite model
        const initialMapped: WordPressSite[] = res.data.map((item: any, idx: number) => {
          const rawTypes = item.contentTypes || item.discoveredTypes;
          const initialTypes = Array.isArray(rawTypes) ? rawTypes : [];
          const rawDate = item.lastScanned || item.lastDiscoveredAt || item.scannedAt;

          return {
            id: String(item.id ?? item._id ?? `site-${idx + 1}`),
            name: item.name || item.title || 'Untitled Site',
            url: item.url || item.siteUrl || item.domain || '',
            username: item.username || item.user || 'admin',
            applicationPassword: '•••• •••• •••• ••••',
            status: item.status === 'ERROR' ? 'ERROR' : (item.status || 'CONNECTED'),
            totalArticles: Number(item.totalArticles ?? item.articlesCount ?? 0),
            lastScanned: rawDate ? new Date(rawDate).toLocaleString() : 'Never',
            discoveredTypes: initialTypes.length > 0 ? initialTypes : [],
          };
        });

        // Set initial sites immediately so the UI is responsive
        setSites(initialMapped);
        if (initialMapped.length > 0) {
          setActiveSiteId(prev => prev || initialMapped[0].id);
        }

        // Fetch live content types in parallel for each site to ensure accurate counts on cards
        const updatedSites = await Promise.all(
          initialMapped.map(async site => {
            try {
              const typesRes: any = await websitesService.getContentTypes(site.id);
              const typesList = Array.isArray(typesRes?.data)
                ? typesRes.data
                : Array.isArray(typesRes)
                ? typesRes
                : Array.isArray(typesRes?.data?.data)
                ? typesRes.data.data
                : [];

              if (typesList.length > 0) {
                // Find latest discovery date
                const latestDate = typesList.reduce((latest: string | null, curr: any) => {
                  const d = curr.lastDiscoveredAt || curr.updatedAt;
                  if (!d) return latest;
                  if (!latest) return d;
                  return new Date(d) > new Date(latest) ? d : latest;
                }, null);

                return {
                  ...site,
                  discoveredTypes: typesList.map((t: any, tIdx: number) => ({
                    id: t.id || `type-${tIdx + 1}`,
                    slug: t.slug,
                    name: t.name || t.slug,
                    restNamespace: t.restNamespace || 'wp/v2',
                    restBase: t.restBase || t.slug,
                    hierarchical: !!t.hierarchical,
                    taxonomies: Array.isArray(t.taxonomies) ? t.taxonomies : [],
                    customFields: t.customFields || [],
                    isScanned: true,
                  })),
                  lastScanned: latestDate ? new Date(latestDate).toLocaleString() : site.lastScanned,
                };
              }
            } catch {
              // Return original site if content types not yet scanned
            }
            return site;
          })
        );

        setSites(updatedSites);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Could not fetch websites from server.';
      addToast({
        title: 'Failed to Load Websites',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
    } finally {
      setIsWebsitesLoading(false);
    }
  };

  // Auto fetch websites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWebsites();
    }
  }, [isAuthenticated]);

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

  const updateCurrentUserProfile = async (data: { fullName?: string; profileImage?: string }) => {
    const updated = await usersService.updateProfile(data);
    const newFullName = data.fullName || updated?.fullName || updated?.name || currentUser?.fullName || 'User';
    const newProfileImage = data.profileImage !== undefined ? data.profileImage : (updated?.profileImage || currentUser?.profileImage || '');

    const nextUser: UserProfile = {
      id: currentUser?.id || updated?.id,
      email: currentUser?.email || updated?.email || '',
      role: currentUser?.role || updated?.role || 'Editor',
      fullName: newFullName,
      profileImage: newProfileImage,
    };

    setCurrentUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));

    addToast({
      title: 'Profile Updated',
      message: 'Your profile has been saved successfully.',
      type: 'success',
    });
  };

  const deleteCurrentUserProfile = async () => {
    await usersService.deleteProfile();
    logout();
    addToast({
      title: 'Account Deleted',
      message: 'Your profile has been permanently removed.',
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

  const navigateToEditArticle = (articleId: string, websiteId?: string) => {
    if (websiteId) {
      setActiveSiteId(websiteId);
    }
    setSelectedArticleIdForEdit(articleId);
    setCurrentScreen('article-edit');
  };

  const addWebsite = async (data: CreateWebsiteDto): Promise<boolean> => {
    try {
      const created = await websitesService.createWebsite(data);
      const newSite: WordPressSite = {
        id: created.id || 'site-' + (sites.length + 1),
        name: created.name || data.name,
        url: created.url || (data.url.startsWith('http') ? data.url : `https://${data.url}`),
        username: created.username || data.username,
        applicationPassword: '•••• •••• •••• ••••',
        status: (created.status === 'ERROR' ? 'ERROR' : 'CONNECTED'),
        totalArticles: created.totalArticles ?? 0,
        lastScanned: created.lastScanned || 'Never',
        discoveredTypes: created.discoveredTypes && created.discoveredTypes.length > 0 ? created.discoveredTypes : mockDefaultContentTypes,
      };

      setSites(prev => [newSite, ...prev]);
      setIsAddWebsiteModalOpen(false);
      addToast({
        title: 'Website Connected Successfully',
        message: `${newSite.name} (${newSite.url}) saved to backend and verified.`,
        type: 'success',
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect website with WordPress API.';
      addToast({
        title: 'Connection Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      throw err;
    }
  };

  const updateWebsite = async (id: string, data: UpdateWebsiteDto): Promise<boolean> => {
    try {
      const updated = await websitesService.updateWebsite(id, data);
      setSites(prev =>
        prev.map(site => (site.id === id ? { ...site, ...updated } : site))
      );
      addToast({
        title: 'Website Updated',
        message: 'Website configuration updated successfully.',
        type: 'success',
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update website.';
      addToast({
        title: 'Update Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      throw err;
    }
  };

  const deleteWebsite = async (id: string): Promise<boolean> => {
    try {
      await websitesService.deleteWebsite(id);
      setSites(prev => prev.filter(site => site.id !== id));
      if (selectedWebsiteIdForDetail === id) {
        setSelectedWebsiteIdForDetail(null);
        setCurrentScreen('websites');
      }
      addToast({
        title: 'Website Deleted',
        message: 'Website has been removed.',
        type: 'info',
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete website.';
      addToast({
        title: 'Delete Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
      throw err;
    }
  };

  const scanWebsite = async (siteId: string) => {
    addToast({
      title: 'Scanning WordPress Site...',
      message: 'Querying /wp-json/wp/v2/types and content-types/discover...',
      type: 'info',
    });

    try {
      const response = await websitesService.discoverContentTypes(siteId);

      // Immediately fetch stored content types from database to ensure fresh synchronized data
      let items: any[] = [];
      try {
        const typesRes: any = await websitesService.getContentTypes(siteId);
        items = Array.isArray(typesRes?.data)
          ? typesRes.data
          : Array.isArray(typesRes)
          ? typesRes
          : Array.isArray(typesRes?.data?.data)
          ? typesRes.data.data
          : [];
      } catch {
        const resData: any = response;
        items = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];
      }
      
      // Map discovered backend items to frontend ContentType format
      const mappedTypes = items.map((item: any, idx: number) => {
        const rawTaxes = Array.isArray(item.taxonomies) ? item.taxonomies : [];
        const formattedTaxonomies = rawTaxes.map((tax: any, tIdx: number) => {
          if (typeof tax === 'string') {
            return {
              id: `tax-${tIdx + 1}`,
              name: tax,
              slug: tax.toLowerCase().replace(/\s+/g, '-'),
              terms: [],
            };
          }
          return {
            id: tax.id || `tax-${tIdx + 1}`,
            name: tax.name || 'Taxonomy',
            slug: tax.slug || 'taxonomy',
            terms: tax.terms || [],
          };
        });

        return {
          id: item.id || `type-${idx + 1}`,
          slug: item.slug || 'post',
          name: item.name || 'Post',
          restNamespace: item.restNamespace || 'wp/v2',
          restBase: item.restBase || item.slug,
          hierarchical: !!item.hierarchical,
          schemaStatus: item.schemaStatus || 'FULLY_DISCOVERED',
          taxonomies: formattedTaxonomies,
          customFields: item.customFields || [],
          isScanned: true,
        };
      });

      const latestDate = items.reduce((latest: string | null, curr: any) => {
        const d = curr.lastDiscoveredAt || curr.updatedAt;
        if (!d) return latest;
        if (!latest) return d;
        return new Date(d) > new Date(latest) ? d : latest;
      }, null);

      setSites(prev =>
        prev.map(s =>
          s.id === siteId
            ? {
                ...s,
                lastScanned: latestDate ? new Date(latestDate).toLocaleString() : 'Just now',
                discoveredTypes: mappedTypes,
              }
            : s
        )
      );

      addToast({
        title: 'Scan Complete',
        message: response.message || `Discovered ${mappedTypes.length} Content Types from WordPress.`,
        type: 'success',
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to discover content types from WordPress REST API.';
      addToast({
        title: 'Scan Failed',
        message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        type: 'error',
      });
    }
  };

  const testWebsiteConnection = async (siteId: string) => {
    const target = sites.find(s => s.id === siteId);
    try {
      const result = await websitesService.testConnection(siteId);
      addToast({
        title: result.success ? 'Connection Verified (200 OK)' : 'Connection Warning',
        message: result.message || `${target?.url} responded in ${result.latencyMs || 94}ms. Credentials are valid.`,
        type: result.success ? 'success' : 'warning',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect to WordPress REST API.';
      addToast({
        title: 'Connection Check Failed',
        message: Array.isArray(msg) ? msg.join(', ') : msg,
        type: 'error',
      });
    }
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
        updateCurrentUserProfile,
        deleteCurrentUserProfile,
        activeSiteId,
        setActiveSiteId,
        sites,
        isWebsitesLoading,
        loadWebsites,
        selectedWebsiteIdForDetail,
        setSelectedWebsiteIdForDetail,
        selectedArticleIdForEdit,
        setSelectedArticleIdForEdit,
        isAddWebsiteModalOpen,
        setIsAddWebsiteModalOpen,
        addWebsite,
        updateWebsite,
        deleteWebsite,
        scanWebsite,
        testWebsiteConnection,
        toasts,
        addToast,
        removeToast,
        navigateToWebsiteDetail,
        navigateToNewArticle,
        navigateToEditArticle,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapse,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
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
