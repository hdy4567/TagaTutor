import { useState } from 'react';
import { useStore } from '../store';
import { useNewsFetch } from './useNewsFetch';
import { formatTitle, formatContent } from './textFormatter';

/**
 * [CLEAN CORE] NewsInput Component
 * UI and State for creating a new session from a news URL or manual text.
 */
const NewsInput = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { isFetching, fetchArticle, isUrl } = useNewsFetch();
  const { addMemo, setTab } = useStore();

  const handleFetch = async (url: string) => {
    const news = await fetchArticle(url);
    if (news) {
      setTitle(news.title);
      setContent(news.content);
    }
  };

  const handleManualFormat = () => {
    setTitle(formatTitle(title));
    setContent(formatContent(content));
  };

  const handleAdd = async () => {
    let finalTitle = title;
    let finalContent = content;

    // REQUIREMENT: Auto-fetch on Save if Title is a URL
    if (isUrl(title) && !content) {
      const news = await fetchArticle(title);
      if (news) {
        finalTitle = news.title;
        finalContent = news.content;
      }
    }

    if (!finalTitle || !finalContent) return;
    addMemo({ title: finalTitle, content: finalContent, tag: 'General', color: '#fff' });
    setTab('list');
  };

  return (
    <div className="content-wrapper">
      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '3rem' }}>New Sessions</h1>
      <div className="memo-card" style={{ padding: '2.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            placeholder="Session Title or News URL..."
            className="glass-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}
          />
          {isUrl(title) && !isFetching && (
            <button
              onClick={() => handleFetch(title)}
              style={btnStyle}
            >
              FETCH NEWS
            </button>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            placeholder="Paste Japanese text or News URL..."
            className="glass-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ marginBottom: '1.5rem', minHeight: '15rem', fontSize: '1.1rem', resize: 'none' }}
          />
          {isUrl(content) && !isFetching && (
            <button
              onClick={() => handleFetch(content)}
              style={btnStyle}
            >
              FETCH NEWS
            </button>
          )}
          {isFetching && (
            <div style={fetchingIndicatorStyle}>
              FETCHING...
            </div>
          )}
          {content.length > 0 && !isFetching && (
            <button
              onClick={handleManualFormat}
              style={{ ...btnStyle, top: 'auto', bottom: '10px', fontSize: '0.8rem', opacity: 0.8 }}
            >
              CLEAN UP
            </button>
          )}
        </div>
        <button
          disabled={isFetching}
          onClick={handleAdd}
          style={{
            ...submitBtnStyle,
            backgroundColor: isFetching ? '#ccc' : 'var(--accent-pink)',
            opacity: isFetching ? 0.6 : 1
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isFetching ? 'Processing...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  position: 'absolute', top: '10px', right: '10px',
  padding: '0.6rem 1rem', background: 'var(--accent-pink)',
  color: 'white', border: 'none', borderRadius: '12px',
  fontWeight: '900', cursor: 'pointer', zIndex: 10
};

const fetchingIndicatorStyle: React.CSSProperties = {
  position: 'absolute', top: '10px', right: '10px',
  padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.8)',
  color: 'var(--accent-pink)', border: 'none', borderRadius: '12px',
  fontWeight: '900', zIndex: 10
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%', padding: '1.4rem',
  color: 'white', border: 'none', borderRadius: '20px',
  fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer',
  transition: 'transform 0.2s',
};

export default NewsInput;
