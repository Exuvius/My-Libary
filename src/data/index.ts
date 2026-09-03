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
export { ddkChapters, ddkSentences, ddkOverrides } from "./library/dao-duc-kinh";
export { dkChapters, dkSentences, dkOverrides, dkAnnotations } from "./library/dich-kinh";
export { dataAnnotations } from "./library/annotations";

import { ttkChapters, ttkSentences } from "./library/tam-tu-kinh";
import { lnChapters, lnSentences } from "./library/luan-ngu";
import { ttvChapters, ttvSentences } from "./library/thien-tu-van";
import { bgtChapters, bgtSentences } from "./library/bach-gia-tinh";
import { poetChapters, poetSentences } from "./library/poems";
import { ddkChapters, ddkSentences } from "./library/dao-duc-kinh";
import { dkChapters, dkSentences } from "./library/dich-kinh";
import type { Chapter, Sentence } from "@/types/library";

const _allChapters = [...ttkChapters, ...lnChapters, ...ttvChapters, ...bgtChapters, ...poetChapters, ...ddkChapters, ...dkChapters];
const _allSentences = [...ttkSentences, ...lnSentences, ...ttvSentences, ...bgtSentences, ...poetSentences, ...ddkSentences, ...dkSentences];

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
import { ddkOverrides } from "./library/dao-duc-kinh";
import { dkOverrides } from "./library/dich-kinh";

export function getOverrides(sentenceId: string): Record<string, [string, string, string]> | undefined {
  return ttkOverrides[sentenceId] || lnOverrides[sentenceId] || ttvOverrides[sentenceId] || bgtOverrides[sentenceId] || poetOverrides[sentenceId] || ddkOverrides[sentenceId] || dkOverrides[sentenceId];
}

