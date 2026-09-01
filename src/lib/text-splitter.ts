export interface DetectedChapter {
  title: string;
  content: string;
  charCount: number;
}

const CHAPTER_PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [
    /^(第[一二三四五六七八九十百千零〇]{1,8}[章回節篇卷品])\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
  [
    /^(第\d{1,4}[章回節篇卷品])\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
  [
    /^(第[０１２３４５６７８９]{1,4}[章回節篇卷品])\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
  [
    /^((?:CHƯƠNG|[Cc]hương)\s+[\dIVXLCDM]+)\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
  [
    /^((?:CHAPTER|[Cc]hapter)\s+[\dIVXLCDM]+)\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
  [
    /^([卷篇品]\s*[一二三四五六七八九十百千零〇]{1,8})\s*(.*)/,
    (m) => (m[2] ? `${m[1]} ${m[2]}` : m[1]),
  ],
];

const MAX_HEADER_LINE = 80;
const MAX_SUBTITLE = 40;
const SEPARATOR_RE = /^[\s：:—\-–·「『（(【《.．、,，]/;

function countCJK(text: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x4e00 && c <= 0x9fff) n++;
  }
  return n;
}

function isChapterLine(
  trimmed: string,
  pattern: RegExp,
  titleFn: (m: RegExpMatchArray) => string
): { title: string } | null {
  if (trimmed.length > MAX_HEADER_LINE) return null;
  const m = trimmed.match(pattern);
  if (!m) return null;

  const rest = trimmed.slice(m[1].length);
  if (rest.length > 0 && !SEPARATOR_RE.test(rest)) return null;

  const subtitle = (m[2] || "").trim();
  if (subtitle.length > MAX_SUBTITLE) return null;

  let title = titleFn(m);
  title = title.replace(/\s+[：:—\-–·.．、,，]+\s*/, " ").replace(/\s+$/, "");
  return { title };
}

function buildChapters(
  lines: string[],
  markers: { idx: number; title: string }[]
): DetectedChapter[] {
  const chapters: DetectedChapter[] = [];

  const pre = lines.slice(0, markers[0].idx).join("\n").trim();
  if (countCJK(pre) > 30 || pre.length > 100) {
    chapters.push({
      title: "序文",
      content: pre,
      charCount: countCJK(pre) || pre.length,
    });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].idx + 1;
    const end =
      i + 1 < markers.length ? markers[i + 1].idx : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    if (!content) continue;
    const cjk = countCJK(content);
    chapters.push({
      title: markers[i].title,
      content,
      charCount: cjk || content.length,
    });
  }

  return chapters;
}

export function detectChapters(text: string): DetectedChapter[] | null {
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = cleaned.split("\n");

  let bestMarkers: { idx: number; title: string }[] = [];

  for (const [pattern, titleFn] of CHAPTER_PATTERNS) {
    const markers: { idx: number; title: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      const result = isChapterLine(trimmed, pattern, titleFn);
      if (result) markers.push({ idx: i, title: result.title });
    }

    if (markers.length > bestMarkers.length) {
      bestMarkers = markers;
    }
  }

  if (bestMarkers.length < 2) return null;

  const chapters = buildChapters(lines, bestMarkers);
  return chapters.length >= 2 ? chapters : null;
}
