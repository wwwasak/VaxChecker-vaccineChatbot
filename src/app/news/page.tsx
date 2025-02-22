'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFilter } from '@/components/news/NewsFilter';
import type { NewsArticle } from '@/types/news';

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver>();
  const lastNewsElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchNews = async (pageNum: number, filterTerm: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/news?page=${pageNum}&filter=${filterTerm}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      if (pageNum === 1) {
        setNews(data.articles);
      } else {
        setNews(prev => [...prev, ...data.articles]);
      }
      
      setHasMore(data.articles.length > 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // when filter changes, reset page and get news again
  useEffect(() => {
    setPage(1);
    setNews([]);
    fetchNews(1, filter);
  }, [filter]);

  // when page changes, get more news
  useEffect(() => {
    if (page > 1) {
      fetchNews(page, filter);
    }
  }, [page]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <PublicNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Latest Vaccine News
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Stay informed with the most recent updates and developments in vaccine research and distribution.
            </p>
          </div>

          <NewsFilter onFilterChange={handleFilterChange} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article, index) => {
              if (news.length === index + 1) {
                return (
                  <div key={article.id} ref={lastNewsElementRef}>
                    <NewsCard article={article} />
                  </div>
                );
              } else {
                return <NewsCard key={article.id} article={article} />;
              }
            })}
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 