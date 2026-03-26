import axios from 'axios';
import fs from 'fs';

/**
 * [TagaTutor] Kanji Dictionary Builder (V2)
 * kanjiapi.dev에서 2,136개의 상용한자 데이터를 긁어와서
 * 클라이언트용 경량 사전(kanjiData.ts)을 생성하여 파일로 직접 저장합니다.
 */

const JOY_KANJI_LIST_URL = 'https://kanjiapi.dev/v1/kanji/joyo';
const KANJI_DETAIL_URL = 'https://kanjiapi.dev/v1/kanji/';

async function buildKanjiData() {
    console.log('--- Start Building Kanji Dictionary ---');

    try {
        const listRes = await axios.get(JOY_KANJI_LIST_URL);
        const kanjiList: string[] = listRes.data;
        console.log(`Found ${kanjiList.length} Joyo Kanji.`);

        const dict: Record<string, string> = {};
        let count = 0;

        const batchSize = 30; // 안정성을 위해 배치 사이즈 축소
        for (let i = 0; i < kanjiList.length; i += batchSize) {
            const batch = kanjiList.slice(i, i + batchSize);
            await Promise.all(batch.map(async (kanji) => {
                try {
                    const detail = await axios.get(`${KANJI_DETAIL_URL}${encodeURIComponent(kanji)}`);
                    let reading = detail.data.kun_readings[0] || detail.data.on_readings[0] || '';
                    if (reading) {
                        // 가이드 텍스트 매칭을 위해 마침표(.) 이후의 오쿠리가나나 하이픈 제거
                        reading = reading.split('.')[0].replace('-', '');
                        dict[kanji] = reading;
                    }
                    count++;
                } catch (e) {
                    console.error(`Failed: ${kanji}`);
                }
            }));
            console.log(`Progress: ${count}/${kanjiList.length}...`);
            // API 서버 부하 방지를 위한 미세 지연
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // TS 파일 서술
        const fileContent = `/**
 * TagaTutor Auto-Generated Kanji Dictionary (Jōyō 2,136+)
 * Generated at: ${new Date().toISOString()}
 */

export const kanjiDict: Record<string, string> = ${JSON.stringify(dict, null, 2)};

export const wrapKanji = (text: string): string => {
  let result = text;
  const sortedKanjiKeys = Object.keys(kanjiDict).sort((a, b) => b.length - a.length);
  for (const key of sortedKanjiKeys) {
    if (result.includes(key)) {
      result = result.split(key).join(kanjiDict[key]);
    }
  }
  return result;
};
`;

        fs.writeFileSync('./src/kanjiData.ts', fileContent, 'utf8');
        console.log('--- KanjiData.ts Build Complete Successfully ---');
        console.log(`Total Mapped: ${Object.keys(dict).length} characters.`);

    } catch (err) {
        console.error('Build Error:', err);
    }
}

buildKanjiData();
