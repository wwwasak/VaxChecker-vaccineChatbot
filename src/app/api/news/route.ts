import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import type { NewsArticle } from '@/types/news';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

// base RSS URL
const BASE_RSS_URL = 'https://news.google.com/rss/search?q=';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const filter = searchParams.get('filter') || '';
    const pageSize = 9; // 每页显示9条新闻

    // build search query
    const searchQuery = filter 
      ? `${filter}+vaccine&hl=en-US&gl=US&ceid=US:en`
      : 'vaccine+health&hl=en-US&gl=US&ceid=US:en';

    const url = `${BASE_RSS_URL}${searchQuery}`;
    
    try {
      const feed = await parser.parseURL(url);
      const articles = feed.items
        .map(item => ({
          id: item.guid || item.link || '',
          title: item.title || '',
          description: item.contentSnippet || item.content || '',
          url: item.link || '',
          urlToImage: extractImageUrl(item.content) || 
                     `https://picsum.photos/seed/${item.guid}/400/300`,
          publishedAt: item.pubDate || new Date().toISOString(),
          source: {
            name: item.source?.name || feed.title || 'Google News'
          }
        }));

      // sort by date
      const sortedNews = articles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      // pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedNews = sortedNews.slice(start, end);

      return NextResponse.json({
        articles: paginatedNews,
        status: 'ok'
      });
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

function extractImageUrl(content?: string): string | null {
  if (!content) return null;
  
  const patterns = [
    /<img[^>]+src="([^">]+)"/,
    /<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/,
    /<meta[^>]+property="og:image"[^>]+content="([^">]+)"/
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
} 