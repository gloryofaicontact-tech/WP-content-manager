import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Article } from '../types/article';
import { mockArticles } from '../data/mockArticles';
import { useApp } from './AppContext';

interface ArticleFilters {
  websiteId: string;
  postType: string;
  status: string;
  searchQuery: string;
}

interface ArticleContextType {
  articles: Article[];
  filters: ArticleFilters;
  setFilters: React.Dispatch<React.SetStateAction<ArticleFilters>>;
  filteredArticles: Article[];
  addArticle: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  publishArticleToWP: (id: string) => void;
  stats: {
    totalWebsites: number;
    totalArticles: number;
    published: number;
    drafts: number;
  };
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast, sites } = useApp();
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [filters, setFilters] = useState<ArticleFilters>({
    websiteId: 'ALL',
    postType: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      if (filters.websiteId !== 'ALL' && art.websiteId !== filters.websiteId) return false;
      if (filters.postType !== 'ALL' && art.postType !== filters.postType) return false;
      if (filters.status !== 'ALL' && art.status !== filters.status) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        if (!art.title.toLowerCase().includes(q) && !art.content.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [articles, filters]);

  const stats = useMemo(() => {
    return {
      totalWebsites: sites.length,
      totalArticles: articles.length,
      published: articles.filter(a => a.status === 'Published').length,
      drafts: articles.filter(a => a.status !== 'Published').length,
    };
  }, [sites, articles]);

  const addArticle = (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticle: Article = {
      ...data,
      id: 'art-' + (articles.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setArticles(prev => [newArticle, ...prev]);
    addToast({
      title: 'Article Created',
      message: `"${newArticle.title}" saved as ${newArticle.status}.`,
      type: 'success',
    });
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
  };

  const publishArticleToWP = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    const site = sites.find(s => s.id === art.websiteId) || sites[0];
    const generatedId = Math.floor(140 + Math.random() * 80);
    const slug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const liveUrl = `${site.url}/${slug}/`;

    addToast({
      title: 'Publishing to WordPress...',
      message: `Creating live post on ${site.url} via REST API...`,
      type: 'info',
    });

    setTimeout(() => {
      setArticles(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                status: 'Published',
                wpPostId: generatedId,
                liveUrl,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : a
        )
      );

      addToast({
        title: 'Published to WordPress!',
        message: `Post #${generatedId} is now live on ${site.name}`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <ArticleContext.Provider
      value={{
        articles,
        filters,
        setFilters,
        filteredArticles,
        addArticle,
        updateArticle,
        publishArticleToWP,
        stats,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) throw new Error('useArticles must be used within ArticleProvider');
  return context;
};
