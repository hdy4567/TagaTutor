import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface Memo {
  id: string;
  title: string;
  content: string;
  sentences: string[]; // 분리된 문장 리스트
  tag: string;
  color: string;
  date: number;
  isPinned: boolean;
}

interface AppState {
  currentTab: string;
  isDarkMode: boolean;
  isLandscape: boolean;
  isNavVisible: boolean; // 네비게이션 가시성 (토글용)
  memos: Memo[];
  searchQuery: string;
  selectedTag: string | null;
  selectedMemoId: string | null;
  currentSentenceIndex: number; // 연습 중인 문장 번호
  userInput: string; // 현재 입력 중인 텍스트
  guideMode: 'none' | 'korean' | 'romaji'; // 가이드 노출 모드
  
  // Actions
  setTab: (tab: string) => void;
  toggleTheme: () => void;
  setIsLandscape: (isLandscape: boolean) => void;
  setNavVisible: (visible: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSelectedTag: (selectedTag: string | null) => void;
  setUserInput: (input: string) => void;
  setSentenceIndex: (index: number) => void;
  setGuideMode: (mode: 'none' | 'korean' | 'romaji') => void;
  
  addMemo: (memo: Omit<Memo, 'id' | 'date' | 'isPinned' | 'sentences'>) => void;
  deleteMemo: (id: string) => void;
  togglePin: (id: string) => void;
  selectMemo: (id: string | null) => void;
}

// 일본어 문장 분리 로직 (Intl.Segmenter 활용)
export const segmentJapanese = (text: string): string[] => {
  try {
    const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'sentence' });
    const segments = segmenter.segment(text);
    return Array.from(segments).map(s => s.segment.trim()).filter(s => s.length > 0);
  } catch (e) {
    return text.split(/[。！？\n]/).map(s => s.trim()).filter(s => s.length > 0);
  }
};

// 일본어 단어/어절 단위 분리 (Romaji 띄어쓰기용)
export const segmentJapaneseWords = (text: string): string[] => {
  try {
    const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'word' });
    const segments = segmenter.segment(text);
    return Array.from(segments).map(s => s.segment).filter(s => s.trim().length > 0 || s === ' ');
  } catch (e) {
    return [text]; // 폴백: 분리 실패 시 전체 반환
  }
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentTab: 'list',
      isDarkMode: false,
      isLandscape: true,
      isNavVisible: true,
      memos: [],
      searchQuery: '',
      selectedTag: null,
      selectedMemoId: null,
      currentSentenceIndex: 0,
      userInput: '',
      guideMode: 'none',

      setTab: (tab) => set({ currentTab: tab }),
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setIsLandscape: (isLandscape) => set({ isLandscape }),
      setNavVisible: (isNavVisible) => set({ isNavVisible }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTag: (selectedTag) => set({ selectedTag }),
      setUserInput: (userInput) => set({ userInput }),
      setSentenceIndex: (currentSentenceIndex) => set({ currentSentenceIndex }),
      setGuideMode: (guideMode) => set({ guideMode }),
      
      addMemo: (memo) => set((state) => ({
        memos: [
          {
            ...memo,
            id: nanoid(),
            date: Date.now(),
            isPinned: false,
            sentences: segmentJapanese(memo.content)
          },
          ...state.memos
        ]
      })),

      deleteMemo: (id) => set((state) => ({
        memos: state.memos.filter(m => m.id !== id)
      })),

      togglePin: (id) => set((state) => ({
        memos: state.memos.map(m => 
          m.id === id ? { ...m, isPinned: !m.isPinned } : m
        ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      })),

      selectMemo: (id) => set({ selectedMemoId: id }),
    }),
    {
      name: 'tagatutor-storagev3',
    }
  )
);
