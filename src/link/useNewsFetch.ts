import { useState } from 'react';
import { fetchNews } from './newsFetcher';
import { isUrl } from './textFormatter';
import type { NewsContent } from './newsFetcher';

/**
 * [CLEAN CORE] Custom Hook for News Fetching
 * Manages fetching state and execution logic.
 */
export const useNewsFetch = () => {
  const [isFetching, setIsFetching] = useState(false);

  const fetchArticle = async (url: string): Promise<NewsContent | null> => {
    if (!isUrl(url)) return null;
    setIsFetching(true);
    try {
      const news = await fetchNews(url);
      return news;
    } catch (err) {
      alert('Failed to fetch news content. Please check the URL.');
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  return {
    isFetching,
    fetchArticle,
    isUrl,
  };
};
