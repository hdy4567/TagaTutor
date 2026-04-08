/**
 * [CLEAN CORE] News Content Fetcher Utility
 * Uses AllOrigins as a public CORS proxy to fetch and parse news content.
 */
import { formatTitle, formatContent } from './textFormatter';

export interface NewsContent {
  title: string;
  content: string;
}
export async function fetchNews(url: string): Promise<NewsContent> {
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url.trim())}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const html = await response.text(); // corsproxy.io returns text directly
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Title Extraction
    let title = '';
    // Priority: Specific Yahoo Pickup Title -> Any H1 inside main content -> H1 -> OG Title
    const pickupTitle = doc.querySelector('.pickupMainCont_title, .sc-gsDKAQ, [class*="Headline"]');
    const headerTitle = doc.querySelector('h1');
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    
    // If headerTitle is just "Yahoo!ニュース", fallback to pickupTitle or OG
    const rawHeader = headerTitle?.textContent?.trim() || '';
    if (rawHeader && !rawHeader.includes('Yahoo!ニュース')) {
      title = rawHeader;
    } else {
      title = pickupTitle?.textContent?.trim() || ogTitle || rawHeader || doc.title || 'Untitled Session';
    }
    
    // 2. Content Extraction
    let content = '';
    
    // Yahoo Japan Specific: article_body or summary area for pickup
    const yahooBody = doc.querySelector('.article_body, [class*="ArticleBody"], .pickupMainCont_summary');
    if (yahooBody) {
      // Remove scripts, styles, ads, and other junk before getting text
      yahooBody.querySelectorAll('script, style, .ad, [class*="Ad"], .sc-').forEach(el => el.remove());
      
      // Use textContent directly and let textFormatter handle the cleanup
      content = yahooBody.textContent || '';
    } else {
      // Generic extraction (Open Graph or common article selectors)
      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const articleText = doc.querySelector('article, .article-content, .post-content')?.textContent;
      content = articleText?.trim() || ogDesc || 'No content found. Please paste manually.';
    }

    // Final Formatting using decoupled utility
    return { 
      title: formatTitle(title), 
      content: formatContent(content) 
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch content. Check the URL or your connection.');
  }
}
