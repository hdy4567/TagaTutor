/**
 * [CLEAN CORE] Text Formatting Utilities
 * Decoupled from network logic - works offline for manual pastes too.
 */

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

/**
 * Checks if the given text is a valid URL.
 */
export const isUrl = (text: string): boolean => {
  return URL_REGEX.test(text.trim());
};

/**
 * Cleans the article title by removing site suffixes and extra symbols.
 */
export const formatTitle = (title: string): string => {
  return title
    .replace(/ - Yahoo!ニュース$/, '')
    .replace(/｜.*$/, '')
    .replace(/ - .*$/, '')
    .trim();
};

/**
 * Cleans the article body content.
 * Normalizes newlines and could expand to filter ads or redundant patterns.
 */
export const formatContent = (content: string): string => {
  if (!content) return '';
  
  return content
    .trim()
    .replace(/[ \t]+/g, ' ')      // Normalize spaces and tabs
    .replace(/\s*[\n]\s*/g, '\n') // Clean up surrounding space of newlines
    .replace(/\n{3,}/g, '\n\n')   // Max 2 consecutive newlines
    .trim();
};
