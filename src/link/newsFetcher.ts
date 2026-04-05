/**
 * [CLEAN CORE] News Content Fetcher Utility
 * Uses AllOrigins as a public CORS proxy to fetch and parse news content.
 */

export interface NewsContent {
  title: string;
  content: string;
}

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const isUrl = (text: string): boolean => {
  return URL_REGEX.test(text.trim());
};

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
      // Collect all paragraphs or text blocks to avoid junk
      const paragraphs = yahooBody.querySelectorAll('p');
      if (paragraphs.length > 0) {
        content = Array.from(paragraphs)
          .map(p => p.textContent?.trim())
          .filter(txt => txt && txt.length > 0)
          .join('\n\n');
      } else {
        // Fallback to textContent without scripts/ads
        yahooBody.querySelectorAll('script, style, .ad, [class*="Ad"]').forEach(el => el.remove());
        content = yahooBody.textContent?.trim() || '';
      }
    } else {
      // Generic extraction (Open Graph or common article selectors)
      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const articleText = doc.querySelector('article, .article-content, .post-content')?.textContent;
      content = articleText?.trim() || ogDesc || 'No content found. Please paste manually.';
    }

    // Clean up title (remove site names or extra suffixes)
    title = title.replace(/ - Yahoo!ニュース$/, '').replace(/｜.*$/, '').replace(/ - .*$/, '').trim();

    return { title, content };
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch content. Check the URL or your connection.');
  }
}
