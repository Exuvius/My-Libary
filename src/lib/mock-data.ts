import type { Radical, CharacterFull, Entry } from "@/types/dictionary";
import type { Author, Work, Tag, Chapter, Sentence, Annotation, Comment } from "@/types/library";

import { radicals as realRadicals } from "@/data/radicals";
import { characters as realCharacters, getChar } from "@/data/characters";
import { entries as realEntries } from "@/data/entries";
import { dataAuthors } from "@/data/library/authors";
import { dataWorks } from "@/data/library/works";
import {
  getChaptersByWorkId as getChaptersFromData,
  getSentencesByChapterId as getSentencesFromData,
  getOverrides,
} from "@/data";
import {
  ttkSentences, lnSentences, ttvSentences, bgtSentences, poetSentences,
  ttkChapters, lnChapters, ttvChapters, bgtChapters, poetChapters,
  ddkSentences, ddkChapters,
  dkSentences, dkChapters,
} from "@/data";
import { simpToTrad as dataSimpToTrad } from "@/data/simp-trad";
import { dataAnnotations } from "@/data/library/annotations";
import { dkAnnotations } from "@/data/library/dich-kinh";

// ===== TAGS =====
export const tags: Tag[] = [
  { id: "t1", name: "Kinh", category: "type", sortOrder: 1 },
  { id: "t2", name: "Điển", category: "type", sortOrder: 2 },
  { id: "t3", name: "Sử", category: "type", sortOrder: 3 },
  { id: "t4", name: "Luận", category: "type", sortOrder: 4 },
  { id: "t5", name: "Văn học", category: "type", sortOrder: 5 },
  { id: "t6", name: "Thơ", category: "genre", sortOrder: 1 },
  { id: "t7", name: "Luận", category: "genre", sortOrder: 2 },
  { id: "t8", name: "Ký", category: "genre", sortOrder: 3 },
  { id: "t9", name: "Truyện", category: "genre", sortOrder: 4 },
  { id: "t10", name: "Hịch", category: "genre", sortOrder: 5 },
  { id: "t11", name: "Xuân Thu", category: "era", sortOrder: 1 },
  { id: "t12", name: "Chiến Quốc", category: "era", sortOrder: 2 },
  { id: "t13", name: "Hán", category: "era", sortOrder: 3 },
  { id: "t14", name: "Đường", category: "era", sortOrder: 4 },
  { id: "t15", name: "Tống", category: "era", sortOrder: 5 },
  { id: "t16", name: "Trần", category: "era", sortOrder: 6 },
  { id: "t17", name: "Lê", category: "era", sortOrder: 7 },
  { id: "t18", name: "Nguyễn", category: "era", sortOrder: 8 },
  { id: "t19", name: "Hán văn", category: "language", sortOrder: 1 },
  { id: "t20", name: "Hán Nôm", category: "language", sortOrder: 2 },
];

const tagById = new Map(tags.map((t) => [t.id, t]));

// ===== RADICALS (real data: 214 Kangxi radicals) =====
export const radicals: Radical[] = realRadicals;

// ===== CHARACTERS (real data: ~3900 characters) =====
export const characters: CharacterFull[] = realCharacters;

// ===== ENTRIES (real data: ~2900 entries) =====
export const entries: Entry[] = realEntries;

// ===== AUTHORS (merged: real data + mock-only) =====
// Real authors come from data/library/authors.ts (converted from database).
// Mock-only authors fill in works that don't have real data yet (Kinh Thi, Đạo Đức Kinh, etc.)
const mockOnlyAuthors: Author[] = [
  { id: "a3", nameViet: "Khuyết danh", era: "~1000–600 TCN", dynasty: "Tây Chu – Xuân Thu", bio: "Kinh Thi được sưu tập và biên soạn qua nhiều thời kỳ." },
  { id: "a4", nameViet: "Tư Mã Thiên", nameHan: "司馬遷", era: "145–86 TCN", dynasty: "Tây Hán", bio: "Sử gia vĩ đại, tác giả Sử Ký." },
  { id: "a5", nameViet: "Nguyễn Du", nameHan: "阮攸", era: "1766–1820", dynasty: "Nguyễn", bio: "Đại thi hào dân tộc Việt Nam, tác giả Truyện Kiều." },
  { id: "a6", nameViet: "Nguyễn Trãi", nameHan: "阮廌", era: "1380–1442", dynasty: "Lê sơ", bio: "Anh hùng dân tộc, nhà chính trị, nhà thơ lớn thời Lê sơ." },
];

export const authors: Author[] = [...dataAuthors, ...mockOnlyAuthors];

// ===== WORKS (merged: real data resolved + mock-only) =====
const resolvedRealWorks: Work[] = dataWorks.map((w) => ({
  id: w.id,
  titleViet: w.titleViet,
  titleHan: w.titleHan,
  authorId: w.authorId,
  author: authors.find((a) => a.id === w.authorId),
  chapterCount: w.chapterCount,
  characterCount: w.characterCount,
  language: w.language as "han_van" | "han_nom",
  isPublished: w.isPublished,
  iconChar: w.iconChar,
  progressPercent: w.progressPercent,
  tags: w.tagIds.map((id) => tagById.get(id)!).filter(Boolean),
}));

const mockOnlyWorks: Work[] = [
  {
    id: "w1", titleViet: "Kinh Thi", titleHan: "詩經", authorId: "a3",
    author: mockOnlyAuthors[0], sourceInfo: "Bản Mao Thi 毛詩, đời Hán",
    chapterCount: 305, characterCount: 39234, language: "han_van",
    isPublished: true, iconChar: "詩",
    tags: [tags[0], tags[5], tags[10], tags[18]], progressPercent: 0.12,
  },
  {
    id: "w4", titleViet: "Sử Ký", titleHan: "史記", authorId: "a4",
    author: mockOnlyAuthors[1], chapterCount: 130, characterCount: 526500,
    language: "han_van", isPublished: true, iconChar: "史",
    tags: [tags[2], tags[7], tags[12], tags[18]], progressPercent: 0,
  },
  {
    id: "w5", titleViet: "Truyện Kiều", titleHan: "傳翹", authorId: "a5",
    author: mockOnlyAuthors[2], chapterCount: 1, characterCount: 22778,
    language: "han_nom", isPublished: true, iconChar: "翹",
    tags: [tags[4], tags[8], tags[17], tags[19]], progressPercent: 0.68,
  },
  {
    id: "w6", titleViet: "Bình Ngô Đại Cáo", titleHan: "平吳大誥", authorId: "a6",
    author: mockOnlyAuthors[3], chapterCount: 1, characterCount: 1680,
    language: "han_van", isPublished: true, iconChar: "平",
    tags: [tags[4], tags[9], tags[16], tags[18]], progressPercent: 1.0,
  },
];

export const works: Work[] = [...resolvedRealWorks, ...mockOnlyWorks];

// ===== MOCK CHAPTERS & SENTENCES (for mock-only works) =====
const kinhThiChapters: Chapter[] = [
  { id: "ch1", workId: "w1", titleViet: "Quan Thư", titleHan: "關雎", chapterNumber: 1, sectionLabel: "Quốc phong · Chu Nam", sortOrder: 1, isRead: true },
  { id: "ch2", workId: "w1", titleViet: "Cát Đàm", titleHan: "葛覃", chapterNumber: 2, sectionLabel: "Quốc phong · Chu Nam", sortOrder: 2, isRead: true },
  { id: "ch3", workId: "w1", titleViet: "Quyển Nhĩ", titleHan: "卷耳", chapterNumber: 3, sectionLabel: "Quốc phong · Chu Nam", sortOrder: 3, isRead: false },
  { id: "ch4", workId: "w1", titleViet: "Kiêm Gia", titleHan: "蒹葭", chapterNumber: 129, sectionLabel: "Quốc phong · Tần phong", sortOrder: 129, isCurrent: true },
  { id: "ch5", workId: "w1", titleViet: "Thất Nguyệt", titleHan: "七月", chapterNumber: 154, sectionLabel: "Quốc phong · Bân phong", sortOrder: 154 },
];

export const kiemGiaSentences: Sentence[] = [
  { id: "s1", chapterId: "ch4", textTraditional: "蒹葭蒼蒼，白露為霜。", textSimplified: "蒹葭苍苍，白露为霜。", hanVietReading: "Kiêm gia thương thương, bạch lộ vi sương.", pinyinReading: "Jiānjiā cāngcāng, báilù wéi shuāng.", translation: "Lau sậy xanh xanh, sương trắng đọng thành giá.", sentenceOrder: 1, paragraphGroup: 1 },
  { id: "s2", chapterId: "ch4", textTraditional: "所謂伊人，在水一方。", textSimplified: "所谓伊人，在水一方。", hanVietReading: "Sở vị y nhân, tại thủy nhất phương.", pinyinReading: "Suǒwèi yīrén, zài shuǐ yī fāng.", translation: "Người ấy là ai, ở bên kia dòng nước.", sentenceOrder: 2, paragraphGroup: 1 },
  { id: "s3", chapterId: "ch4", textTraditional: "溯洄從之，道阻且長。", textSimplified: "溯洄从之，道阻且长。", hanVietReading: "Tố hồi tòng chi, đạo trở thả trường.", pinyinReading: "Sùhuí cóng zhī, dào zǔ qiě cháng.", translation: "Ngược dòng tìm theo, đường gập ghềnh lại xa.", sentenceOrder: 3, paragraphGroup: 1 },
  { id: "s4", chapterId: "ch4", textTraditional: "溯游從之，宛在水中央。", textSimplified: "溯游从之，宛在水中央。", hanVietReading: "Tố du tòng chi, uyển tại thủy trung ương.", pinyinReading: "Sùyóu cóng zhī, wǎn zài shuǐ zhōngyāng.", translation: "Xuôi dòng tìm theo, dường như ở giữa dòng nước.", sentenceOrder: 4, paragraphGroup: 1 },
  { id: "s5", chapterId: "ch4", textTraditional: "蒹葭萋萋，白露未晞。", textSimplified: "蒹葭萋萋，白露未晞。", hanVietReading: "Kiêm gia thê thê, bạch lộ vị hi.", pinyinReading: "Jiānjiā qīqī, báilù wèi xī.", translation: "Lau sậy rậm rạp, sương trắng chưa khô.", sentenceOrder: 5, paragraphGroup: 2 },
  { id: "s6", chapterId: "ch4", textTraditional: "所謂伊人，在水之湄。", textSimplified: "所谓伊人，在水之湄。", hanVietReading: "Sở vị y nhân, tại thủy chi mi.", pinyinReading: "Suǒwèi yīrén, zài shuǐ zhī méi.", translation: "Người ấy là ai, ở bờ bên kia dòng nước.", sentenceOrder: 6, paragraphGroup: 2 },
];

// ===== ANNOTATIONS & COMMENTS =====
export const sampleAnnotations: Annotation[] = [
  ...dataAnnotations,
  ...dkAnnotations,
  { id: "an1", sentenceId: "s1", level: "sentence", content: "Hai câu đầu tả cảnh thu: lau sậy xanh rì, sương trắng đọng thành giá. Cảnh vật gợi không khí hoang vắng, mênh mang." },
  { id: "an2", sentenceId: "s2", level: "sentence", content: "'Y nhân' (伊人) — người ấy. Có nhiều thuyết: Mao Thi cho là ẩn dụ hiền tài không gặp thời; thuyết khác cho là người yêu." },
];

export const sampleComments: Comment[] = [
  { id: "cm1", sentenceId: "s1", userId: "u1", userName: "Minh Trí", content: "Câu này hay quá! Hình ảnh lau sậy và sương trắng tạo nên bức tranh thu rất đẹp và buồn.", createdAt: "2026-08-25T10:30:00Z" },
  { id: "cm2", sentenceId: "s2", userId: "u2", userName: "Thu Hà", content: "Y nhân ở đây theo Mao truyện là chỉ người hiền tài, nhưng đọc theo nghĩa tình yêu cũng rất hợp.", createdAt: "2026-08-26T14:15:00Z" },
];

// ===== HELPER FUNCTIONS =====

export function getWorkById(id: string): Work | undefined {
  return works.find((w) => w.id === id);
}

export function getCharacterById(id: string): CharacterFull | undefined {
  return characters.find((c) => c.id === id);
}

const entryById = new Map(entries.map((e) => [e.id, e]));

export function getEntryById(id: string): Entry | undefined {
  return entryById.get(id);
}

export function getRelatedEntries(entry: Entry): Entry[] {
  const chars = [...entry.textTraditional];
  return entries.filter((e) =>
    e.id !== entry.id && chars.some((ch) => e.textTraditional.includes(ch))
  ).slice(0, 20);
}

export function getCharacterByChar(ch: string): CharacterFull | undefined {
  return getChar(ch);
}

const tradToSimp = new Map(
  realCharacters
    .filter((c) => c.simplified && c.simplified !== c.traditional)
    .map((c) => [c.traditional, c.simplified!])
);

export function toSimplified(text: string): string {
  return [...text].map((ch) => tradToSimp.get(ch) || ch).join("");
}

export function toTraditional(text: string): string {
  return [...text].map((ch) => dataSimpToTrad[ch] || ch).join("");
}

export function toScript(text: string, script: "traditional" | "simplified"): string {
  return script === "simplified" ? toSimplified(text) : toTraditional(text);
}

export function getChaptersByWorkId(workId: string): Chapter[] {
  const fromData = getChaptersFromData(workId);
  if (fromData.length > 0) return fromData;
  if (workId === "w1") return kinhThiChapters;
  return [];
}

export function getSentencesByChapterId(chapterId: string): Sentence[] {
  const fromData = getSentencesFromData(chapterId);
  if (fromData.length > 0) return fromData;
  if (chapterId === "ch4") return kiemGiaSentences;
  return [];
}

export function getSentenceOverrides(sentenceId: string): Record<string, [string, string, string]> | undefined {
  return getOverrides(sentenceId);
}

// Find all compound/idiom/specialized entries that contain this character.
// Checks both simplified and traditional forms to catch all variants.
export function getEntriesByCharacterId(characterId: string): Entry[] {
  const char = characters.find((c) => c.id === characterId);
  if (!char) return [];
  const charText = char.simplified || char.traditional;
  return entries.filter((e) => {
    const text = e.textSimplified || e.textTraditional;
    return [...text].includes(charText) || [...e.textTraditional].includes(char.traditional);
  });
}

export function getTagsByCategory(category: string): Tag[] {
  return tags.filter((t) => t.category === category);
}

// Flatten all works' sentences/chapters into single arrays for corpus-wide search.
// Used by getCitationsForCharacter() to find example usages across the entire library.
const _allCorpusSentences = [...ttkSentences, ...lnSentences, ...ttvSentences, ...bgtSentences, ...poetSentences, ...ddkSentences, ...dkSentences, ...kiemGiaSentences];
const _allCorpusChapters = [...ttkChapters, ...lnChapters, ...ttvChapters, ...bgtChapters, ...poetChapters, ...ddkChapters, ...dkChapters, ...kinhThiChapters];
const _chapterMap = new Map(_allCorpusChapters.map(c => [c.id, c]));

export interface CitationResult {
  sentence: Sentence;
  chapterTitle: string;
  workTitle: string;
  workId: string;
}

export function getCitationsForCharacter(traditional: string, limit = 20): CitationResult[] {
  const results: CitationResult[] = [];
  for (const s of _allCorpusSentences) {
    if (results.length >= limit) break;
    if (!s.textTraditional.includes(traditional)) continue;
    const ch = _chapterMap.get(s.chapterId);
    if (!ch) continue;
    const work = works.find(w => w.id === ch.workId);
    results.push({
      sentence: s,
      chapterTitle: ch.titleViet,
      workTitle: work?.titleViet || ch.workId,
      workId: ch.workId,
    });
  }
  return results;
}
