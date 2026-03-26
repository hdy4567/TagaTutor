import { wrapKanji as baseWrapKanji } from './kanjiData';

/**
 * [TagaTutor] Custom Kanji & Multi-word Exception Layer
 * 
 * [질문에 대한 답변]
 * 실제 일본어 형태소 분석 라이브러리(MeCab, Kuromoji 등)도 내부적으로는 
 * '사용자 사전(User Dictionary)'이라는 시스템을 통해 하드코딩된 단어들을 우선 순위로 처리합니다.
 * 특히 '투자사기(投資詐欺)' 같은 복합 명사는 낱자가 아닌 단어 통째로 매칭하는 것이 정석입니다.
 */

// 1. 최우선 매칭 단어 (사기 관련 및 예외 단어)
export const customExceptions: Record<string, string> = {
  '型投資詐欺': 'がたとうしさぎ',
  '投資詐欺': 'とうしさぎ',
  '対策': 'たいさく',
  '手口': 'てぐち',
  // 추가적인 특수 결합 발음들을 여기에 계속 추가 가능
};

/**
 * [Smart Kanji Wrap Engine]
 * Custom 우선 -> Base 사전 순으로 매칭
 */
export const customWrapKanji = (text: string): string => {
  let result = text;

  // 1. Custom 예외 단어 우선 처리 (그리디 매칭)
  const exceptionKeys = Object.keys(customExceptions).sort((a, b) => b.length - a.length);
  for (const key of exceptionKeys) {
    if (result.includes(key)) {
      result = result.split(key).join(customExceptions[key]);
    }
  }

  // 2. 나머지 개별 한자들은 Base 사전에서 처리
  return baseWrapKanji(result);
};
