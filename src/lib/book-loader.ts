import type { Chapter, Sentence, Annotation } from "@/types/library";

const BASE = "/data";

const chaptersCache = new Map<string, Chapter[]>();
const contentCache = new Map<string, ChapterContent>();

export interface ChapterContent {
  sentences: Sentence[];
  overrides: Record<string, Record<string, [string, string, string]>>;
  annotations?: Annotation[];
}

export async function loadChapters(workId: string): Promise<Chapter[]> {
  const cached = chaptersCache.get(workId);
  if (cached) return cached;

  const res = await fetch(`${BASE}/${workId}/chapters.json`);
  if (!res.ok) return [];
  const chapters: Chapter[] = await res.json();
  chaptersCache.set(workId, chapters);
  return chapters;
}

export async function loadChapterContent(
  workId: string,
  chapterId: string
): Promise<ChapterContent> {
  const key = `${workId}/${chapterId}`;
  const cached = contentCache.get(key);
  if (cached) return cached;

  const res = await fetch(`${BASE}/${workId}/${chapterId}.json`);
  if (!res.ok) return { sentences: [], overrides: {} };
  const raw = await res.json();
  const data: ChapterContent = {
    sentences: (raw.sentences || []).map((s: Record<string, unknown>) => ({
      ...s,
      textTraditional: s.textTraditional || s.text || "",
      sentenceOrder: s.sentenceOrder ?? s.sortOrder ?? 0,
    })),
    overrides: raw.overrides || {},
    annotations: raw.annotations,
  };
  contentCache.set(key, data);
  return data;
}
