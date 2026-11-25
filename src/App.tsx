import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { ArticleProvider } from './context/ArticleContext';
import { Shell } from './components/layout/Shell';

// Auth Screen
import { AuthScreen } from './components/screens/auth/AuthScreen';
import { ToastContainer } from './components/common/ToastContainer';

// Dashboard & Management Pages
import { DashboardScreen } from './components/screens/dashboard/DashboardScreen';
import { WebsitesListScreen } from './components/screens/websites/WebsitesListScreen';
import { WebsiteDetailScreen } from './components/screens/websites/WebsiteDetailScreen';
import { ArticlesListScreen } from './components/screens/articles/ArticlesListScreen';
import { ArticleEditorScreen } from './components/screens/articles/ArticleEditorScreen';
import { SettingsScreen } from './components/screens/settings/SettingsScreen';
import { AddWebsiteModal } from './components/screens/websites/AddWebsiteModal';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'dashboard':
      return <DashboardScreen />;
    case 'websites':
      return <WebsitesListScreen />;
    case 'website-detail':
      return <WebsiteDetailScreen />;
    case 'articles':
      return <ArticlesListScreen />;
    case 'article-new':
      return <ArticleEditorScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <DashboardScreen />;
  }
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <ArticleProvider>
      <Shell>
        <ScreenRouter />
        <AddWebsiteModal />
      </Shell>
    </ArticleProvider>
  );
};

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <MainAppContent />
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
