import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, List, Languages, Sun, Moon, Search, Pin, Trash2,
  ChevronLeft, Award, Menu, X, Zap
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { useStore, segmentJapaneseWords } from './store';
import { customWrapKanji } from './customKanji';
import NewsInput from './link/NewsInput';

// [CLEAN CORE] Minimal Mapping
const kanaToKorean = (text: string) => {
  const map: Record<string, string> = {
    'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오',
    'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코',
    'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소',
    'た': '타', 'ち': '치', 'つ': '쯔', 'て': '테', '토': '토'
  };
  return text.split('').map(c => map[c] || c).join('');
};





const PracticeTab = () => {
  const { memos, selectedMemoId, currentSentenceIndex, userInput, setUserInput, setSentenceIndex, setTab, guideMode } = useStore();
  const memo = useMemo(() => memos.find(m => m.id === selectedMemoId), [memos, selectedMemoId]);
  const currentSentence = useMemo(() => memo?.sentences[currentSentenceIndex] || '', [memo, currentSentenceIndex]);
  const normalizedGuide = useMemo(() => wanakana.toHiragana(customWrapKanji(currentSentence)), [currentSentence]);
  const processedInput = useMemo(() => wanakana.toHiragana(userInput.replace(/\s+/g, '')), [userInput]);

  useEffect(() => {
    // 띄어쓰기를 무시하고 비교
    if (processedInput === normalizedGuide.replace(/\s+/g, '') && normalizedGuide.length > 0) {
      setTimeout(() => {
        if (currentSentenceIndex < (memo?.sentences.length || 0) - 1) {
          setSentenceIndex(currentSentenceIndex + 1);
          setUserInput('');
        } else {
          setTab('stats');
        }
      }, 200);
    }
  }, [processedInput]);

  const guideDisplay = useMemo(() => {
    if (guideMode === 'none') return null;
    if (guideMode === 'romaji') {
      // 단어별 띄어쓰기가 적용된 로마자 가이드 생성
      const words = segmentJapaneseWords(currentSentence);
      return words.map(w => wanakana.toRomaji(customWrapKanji(w))).join(' ');
    }
    if (guideMode === 'korean') return kanaToKorean(normalizedGuide);
    return null;
  }, [currentSentence, normalizedGuide, guideMode]);

  if (!memo) return null;

  return (
    <div className="practice-container">
      <button onClick={() => setTab('list')} style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ChevronLeft size={28} /> BACK
      </button>
      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-pink)', marginBottom: '2rem' }}>{currentSentenceIndex + 1} / {memo.sentences.length}</div>
      <div className="memo-card" style={{ padding: '4rem 2rem', textAlign: 'center', width: '90%', maxWidth: '800px' }}>
        {guideMode !== 'none' && <div style={{ fontSize: '1.2rem', color: 'var(--accent-pink)', marginBottom: '1.5rem', fontWeight: '900' }}>{guideDisplay}</div>}
        <div style={{ position: 'relative', fontSize: '3rem', fontWeight: '900', minHeight: '4.5rem' }}>
          <div style={{ opacity: 0.15, wordBreak: 'break-all' }}>{currentSentence}</div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', wordBreak: 'break-all' }}>
            {currentSentence.split('').map((c, i) => {
              const target = wanakana.toHiragana(customWrapKanji(currentSentence))[i];
              const input = processedInput[i];
              return <span key={i} style={{ color: input ? (input === target ? 'var(--accent-pink)' : '#ff5252') : 'transparent' }}>{c}</span>;
            })}
          </div>
        </div>
      </div>
      <input autoFocus className="glass-input" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type here..." style={{ width: '90%', maxWidth: '600px', marginTop: '3rem', textAlign: 'center', fontSize: '1.8rem', borderRadius: '40px', border: '5px solid var(--accent-pink)' }} />
    </div>
  );
};

const ListTab = () => {
  const { memos, togglePin, deleteMemo, searchQuery, setSearchQuery, selectMemo, setTab, setSentenceIndex, setUserInput } = useStore();
  const filteredMemos = useMemo(() => memos.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())), [memos, searchQuery]);
  return (
    <div className="content-wrapper">
      <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '2.5rem' }}>My Library</h1>
      <div style={{ position: 'relative', marginBottom: '3.5rem' }}>
        <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input className="glass-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sessions..." style={{ paddingLeft: '4rem', borderRadius: '40px', fontSize: '1.2rem' }} />
      </div>
      <div className="memo-grid">
        {filteredMemos.map(m => (
          <div key={m.id} className="memo-card" onClick={() => { selectMemo(m.id); setSentenceIndex(0); setUserInput(''); setTab('practice'); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>{m.title}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={e => { e.stopPropagation(); togglePin(m.id); }} style={{ background: 'none', border: 'none' }}><Pin size={20} fill={m.isPinned ? '#ff4081' : 'none'} /></button>
                <button onClick={e => { e.stopPropagation(); deleteMemo(m.id); }} style={{ background: 'none', border: 'none' }}><Trash2 size={20} /></button>
              </div>
            </div>
            <p style={{ fontSize: '1rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsTab = () => {
  const setTab = useStore(state => state.setTab);
  return (
    <div className="practice-container" style={{ textAlign: 'center' }}>
      <Award size={120} color="var(--accent-pink)" />
      <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '2rem' }}>Session Clear!</h1>
      <button onClick={() => setTab('list')} style={{ marginTop: '3rem', padding: '1.5rem 4rem', backgroundColor: 'var(--accent-pink)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '1.4rem', fontWeight: '900' }}>Back Home</button>
    </div>
  );
};

const App = () => {
  const { currentTab, setTab, isDarkMode, toggleTheme, guideMode, setGuideMode, isNavVisible, setNavVisible } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const cycleGuideMode = () => {
    const modes: ('none' | 'romaji' | 'korean')[] = ['none', 'romaji', 'korean'];
    setGuideMode(modes[(modes.indexOf(guideMode) + 1) % modes.length]);
  };

  return (
    <div className="app-container">
      {/* 1. PREMIUM FLOATING MASTER BUTTON */}
      <button
        id="master-hamburger"
        className="mobile-only"
        onClick={() => setNavVisible(!isNavVisible)}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 1000000,
          background: 'rgba(255, 64, 129, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '14px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(255, 64, 129, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isNavVisible ? <X size={28} strokeWidth={3} /> : <Menu size={28} strokeWidth={3} />}
      </button>

      {/* 2. RECYCLED SIDEBAR (Desktop & Mobile Unified) */}
      <aside className={`sidebar ${isNavVisible ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--accent-pink)', fontWeight: '900', fontSize: '2rem', margin: 0 }}>TagaTutor</h1>
          <button className="mobile-only" onClick={() => setNavVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}><X size={32} /></button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div className={`nav-item ${currentTab === 'list' ? 'active' : ''}`} onClick={() => { setTab('list'); setNavVisible(false); }}><List size={22} /> Library</div>
          <div className={`nav-item ${currentTab === 'input' ? 'active' : ''}`} onClick={() => { setTab('input'); setNavVisible(false); }}><Plus size={22} /> New Practice</div>
          <div className="nav-item" style={{ opacity: 0.3 }}><Zap size={22} /> Smart Scan</div>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--line-color)', paddingTop: '2rem' }}>
          <div
            onClick={cycleGuideMode}
            className="nav-item"
            style={{
              fontSize: '1rem',
              background: guideMode === 'romaji' ? 'rgba(52,152,219,0.15)' : 'transparent',
              color: guideMode === 'romaji' ? '#3498db' : 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: guideMode === 'romaji' ? '0 0 15px rgba(52,152,219,0.2)' : 'none'
            }}
          >
            <Languages size={20} color={guideMode === 'romaji' ? '#3498db' : 'currentColor'} />
            Guide: <span style={{ fontWeight: '900', marginLeft: '5px' }}>{guideMode.toUpperCase()}</span>
          </div>
          <div onClick={toggleTheme} className="nav-item" style={{ fontSize: '1rem' }}>{isDarkMode ? <Sun size={20} color="#ffeb3b" /> : <Moon size={20} />} {isDarkMode ? 'Light Mode' : 'Night Mode'}</div>
        </div>
      </aside>

      {/* 3. MOBILE BACKDROP */}
      <AnimatePresence>
        {isNavVisible && (
          <motion.div
            className="mobile-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNavVisible(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 99999 }}
          />
        )}
      </AnimatePresence>

      <main className="main-view">
        <AnimatePresence mode="wait">
          {currentTab === 'list' && <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><ListTab /></motion.div>}
          {currentTab === 'input' && <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><NewsInput /></motion.div>}
          {currentTab === 'practice' && <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PracticeTab /></motion.div>}
          {currentTab === 'stats' && <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><StatsTab /></motion.div>}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
