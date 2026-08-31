export { radicals, radicalMap } from "./radicals";
export { characters, getChar } from "./characters";
export { entries, compoundEntries, idiomEntries, specializedEntries } from "./entries";
export { simpToTrad, tradToSimp } from "./simp-trad";
export { dataAuthors } from "./library/authors";
export { dataWorks } from "./library/works";
export { ttkChapters, ttkSentences, ttkOverrides } from "./library/tam-tu-kinh";
export { lnChapters, lnSentences, lnOverrides } from "./library/luan-ngu";
export { ttvChapters, ttvSentences, ttvOverrides } from "./library/thien-tu-van";
export { bgtChapters, bgtSentences, bgtOverrides } from "./library/bach-gia-tinh";
export { poetChapters, poetSentences, poetOverrides } from "./library/poems";
export { dataAnnotations } from "./library/annotations";

import { ttkChapters, ttkSentences } from "./library/tam-tu-kinh";
import { lnChapters, lnSentences } from "./library/luan-ngu";
import { ttvChapters, ttvSentences } from "./library/thien-tu-van";
import { bgtChapters, bgtSentences } from "./library/bach-gia-tinh";
import { poetChapters, poetSentences } from "./library/poems";
import type { Chapter, Sentence } from "@/types/library";

// Merged arrays from all works — built once at module load for fast lookup.
// Each work's data is kept in its own file for maintainability; these
// flattened arrays power the getChaptersByWorkId/getSentencesByChapterId helpers.
const _allChapters = [...ttkChapters, ...lnChapters, ...ttvChapters, ...bgtChapters, ...poetChapters];
const _allSentences = [...ttkSentences, ...lnSentences, ...ttvSentences, ...bgtSentences, ...poetSentences];

export function getChaptersByWorkId(workId: string): Chapter[] {
  return _allChapters.filter(c => c.workId === workId);
}

export function getSentencesByChapterId(chapterId: string): Sentence[] {
  return _allSentences.filter(s => s.chapterId === chapterId);
}

import { ttkOverrides } from "./library/tam-tu-kinh";
import { lnOverrides } from "./library/luan-ngu";
import { ttvOverrides } from "./library/thien-tu-van";
import { bgtOverrides } from "./library/bach-gia-tinh";
import { poetOverrides } from "./library/poems";

// Per-character overrides for specific sentences — when a character has multiple
// readings, the override specifies which [hanViet, pinyin, definition] to use
// in that sentence context instead of the default first reading.
export function getOverrides(sentenceId: string): Record<string, [string, string, string]> | undefined {
  return ttkOverrides[sentenceId] || lnOverrides[sentenceId] || ttvOverrides[sentenceId] || bgtOverrides[sentenceId] || poetOverrides[sentenceId];
}
