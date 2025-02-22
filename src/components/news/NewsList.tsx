'use client';

import React from 'react';
import Image from 'next/image';
import { NewsArticle } from '@/types/news';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading?: boolean;
}

export const NewsList: React.FC<NewsListProps> = ({ articles, isLoading }) => {
  if (isLoading && articles.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-48 bg-gray-100">
            {article.urlToImage ? (
              <Image
                src={article.urlToImage}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {article.description}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="font-medium">{article.source.name}</span>
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}; 