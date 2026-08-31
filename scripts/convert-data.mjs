#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC = String.raw`D:\Learn Chinese\data`;
const DEST = String.raw`D:\Tu Dien\src\data`;

mkdirSync(join(DEST, "library"), { recursive: true });

function load(file) {
  const code = readFileSync(join(SRC, file), "utf-8");
  const m = code.match(/(?:const|let|var)\s+(\w+)\s*=/);
  if (!m) throw new Error("No variable in " + file);
  return new Function(code + `;\nreturn ${m[1]};`)();
}

function loadCommentary() {
  const code = readFileSync(join(SRC, "ttk_commentary.js"), "utf-8");
  return new Function(code + ";\nreturn COMMENTARY_DATA;")();
}

function w(path, content) {
  writeFileSync(join(DEST, path), content, "utf-8");
}

const J = JSON.stringify;

function compact(arr) {
  return "[\n" + arr.map((v) => "  " + J(v)).join(",\n") + ",\n]";
}

const POS = {
  n: "Danh từ", v: "Động từ", adj: "Tính từ", adv: "Phó từ",
  prep: "Giới từ", conj: "Liên từ", pron: "Đại từ", part: "Trợ từ",
  interj: "Thán từ", num: "Số từ", meas: "Lượng từ", aux: "Trợ động từ",
};
const posVi = (a) => POS[a] || POS[a?.toLowerCase()] || "Khác";

// ── Load All ───────────────────────────────────────────────────
console.log("Loading data...");
const RAD = load("radical_dict.js");
const CHR = load("char_dict.js");
const CMP = load("compound_dict.js");
const IDM = load("idiom_dict.js");
const MUL = load("multi_readings.js");
const ST = load("simp_trad.js");
const REG = load("registry.js");
const TTK = load("tam_tu_kinh.js");
const LN = load("luan_ngu.js");
const TTV = load("thien_tu_van.js");
const BGT = load("bach_gia_tinh.js");
const COM = loadCommentary();

const poetFiles = readdirSync(join(SRC, "poets")).filter((f) => f.endsWith(".js"));
const POETS = poetFiles.map((f) => load("poets/" + f));

const specFiles = readdirSync(join(SRC, "specialized")).filter((f) => f.endsWith(".js"));
const SPECS = specFiles.map((f) => load("specialized/" + f));

console.log(`  ${Object.keys(CHR).length} chars, ${Object.keys(CMP).length} compounds, ${Object.keys(IDM).length} idioms`);
console.log(`  ${RAD.length} radicals, ${Object.keys(MUL).length} multi-reading`);
console.log(`  ${POETS.length} poets, ${SPECS.length} specialized dicts`);

// ── Lookups ────────────────────────────────────────────────────
const trad = (ch) => ST[ch] || ch;
const tradText = (text) => [...text].map(trad).join("");

const radLookup = new Map();
for (const r of RAD) {
  radLookup.set(r.radical, r.num);
  if (r.variant) radLookup.set(r.variant, r.num);
  for (const ex of r.examples || []) radLookup.set(ex, r.num);
}

const PUNCT = /[\s，。！？、；：「」『』（）《》·\-\n\r]/;
function genReading(text, overrides, field) {
  const parts = [];
  for (const ch of text) {
    if (PUNCT.test(ch)) { parts.push(ch); continue; }
    if (overrides?.[ch]) { parts.push(overrides[ch][field]); continue; }
    if (CHR[ch]) { parts.push(CHR[ch][field]); continue; }
    const m = MUL[ch];
    if (m?.length > 0) parts.push(field === 0 ? m[0].pinyin : m[0].hanviet);
    else parts.push(ch);
  }
  return parts.join(" ")
    .replace(/\s+([，。！？、；：」』）》])/g, "$1")
    .replace(/([「『（《])\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ── 1. radicals.ts ─────────────────────────────────────────────
console.log("\nGenerating files...");

const radArr = RAD.map((r) => ({
  id: `rad_${r.num}`, character: r.radical, hanViet: r.hanviet,
  strokeCount: r.strokes, sortOrder: r.num,
}));

w("radicals.ts", [
  `import type { Radical } from "@/types/dictionary";`,
  ``,
  `export const radicals: Radical[] = ${compact(radArr)};`,
  ``,
  `export const radicalMap = new Map(radicals.map(r => [r.character, r]));`,
  ``,
].join("\n"));
console.log("  radicals.ts (%d)", RAD.length);

// ── 2. simp-trad.ts ───────────────────────────────────────────
const TS = {};
for (const [s, t] of Object.entries(ST)) TS[t] = s;

w("simp-trad.ts", [
  `export const simpToTrad: Record<string, string> = ${J(ST)};`,
  ``,
  `export const tradToSimp: Record<string, string> = ${J(TS)};`,
  ``,
].join("\n"));
console.log("  simp-trad.ts");

// ── 3. characters.ts ──────────────────────────────────────────
const charArr = [];
for (const [simp, [py, hv, meaning, p]] of Object.entries(CHR)) {
  const t = trad(simp);
  const id = "c" + simp.codePointAt(0).toString(16);
  const rn = radLookup.get(simp) || radLookup.get(t);

  const multi = MUL[simp];
  let readings;
  if (multi?.length > 0) {
    readings = multi.map((m, i) => ({
      id: `rd_${id}_${i}`, characterId: id, hanViet: m.hanviet, pinyin: m.pinyin, sortOrder: i,
      meanings: [{ id: `mn_${id}_${i}_0`, readingId: `rd_${id}_${i}`, partOfSpeech: posVi(p), definition: m.meaning, sortOrder: 0 }],
    }));
  } else {
    readings = [{
      id: `rd_${id}_0`, characterId: id, hanViet: hv, pinyin: py, sortOrder: 0,
      meanings: [{ id: `mn_${id}_0_0`, readingId: `rd_${id}_0`, partOfSpeech: posVi(p), definition: meaning, sortOrder: 0 }],
    }];
  }

  const entry = { id, traditional: t, strokeCount: 0, readings };
  if (simp !== t) entry.simplified = simp;
  if (rn) entry.radicalId = `rad_${rn}`;
  charArr.push(entry);
}

w("characters.ts", [
  `import type { CharacterFull } from "@/types/dictionary";`,
  ``,
  `// Large dataset — use JSON.parse for performance and to avoid TS2590`,
  `export const characters: CharacterFull[] = JSON.parse(${J(J(charArr))});`,
  ``,
  `const _map = new Map<string, CharacterFull>();`,
  `for (const c of characters) {`,
  `  _map.set(c.simplified || c.traditional, c);`,
  `  _map.set(c.traditional, c);`,
  `}`,
  `export function getChar(ch: string): CharacterFull | undefined { return _map.get(ch); }`,
  ``,
].join("\n"));
console.log("  characters.ts (%d)", charArr.length);

// ── 4. entries.ts ──────────────────────────────────────────────
const ents = [];
let ei = 0;

for (const [text, [py, hv, def]] of Object.entries(CMP)) {
  const t = tradText(text);
  const e = { id: `cmpd_${ei++}`, textTraditional: t, hanViet: hv, pinyin: py, definition: def, entryType: "compound" };
  if (text !== t) e.textSimplified = text;
  ents.push(e);
}

for (const [text, data] of Object.entries(IDM)) {
  const t = tradText(text);
  const e = { id: `idm_${ei++}`, textTraditional: t, hanViet: data.hanviet, pinyin: data.pinyin, definition: data.meaning, entryType: "idiom" };
  if (text !== t) e.textSimplified = text;
  if (data.source) e.notes = `${data.source}${data.sourceVi ? " (" + data.sourceVi + ")" : ""}`;
  ents.push(e);
}

for (const spec of SPECS) {
  for (const [text, [py, hv, def]] of Object.entries(spec.entries || {})) {
    const t = tradText(text);
    const e = { id: `spec_${ei++}`, textTraditional: t, hanViet: hv, pinyin: py, definition: def, entryType: "specialized", specializedCategory: spec.nameVi || spec.name };
    if (text !== t) e.textSimplified = text;
    ents.push(e);
  }
}

w("entries.ts", [
  `import type { Entry } from "@/types/dictionary";`,
  ``,
  `// Large dataset — use JSON.parse for performance and to avoid TS2590`,
  `export const entries: Entry[] = JSON.parse(${J(J(ents))});`,
  ``,
  `export const compoundEntries = entries.filter(e => e.entryType === "compound");`,
  `export const idiomEntries = entries.filter(e => e.entryType === "idiom");`,
  `export const specializedEntries = entries.filter(e => e.entryType === "specialized");`,
  ``,
].join("\n"));
console.log("  entries.ts (%d: %d cmpd, %d idm, %d spec)", ents.length,
  ents.filter((e) => e.entryType === "compound").length,
  ents.filter((e) => e.entryType === "idiom").length,
  ents.filter((e) => e.entryType === "specialized").length);

// ── 5. library/authors.ts ─────────────────────────────────────
const auths = [];
const seenAuth = new Set();

function addAuth(a) { if (!seenAuth.has(a.id)) { seenAuth.add(a.id); auths.push(a); } }

for (const book of [TTK, TTV, BGT]) {
  if (book.author) addAuth({ id: `auth_${book.id}`, nameViet: book.authorVi, nameHan: book.author, dynasty: book.dynastyVi });
}
addAuth({ id: "auth_confucius", nameViet: "Khổng Tử", nameHan: "孔子", era: "551–479 TCN", dynasty: "Xuân Thu", bio: "Nhà tư tưởng, nhà giáo dục vĩ đại. Sáng lập Nho giáo." });

for (const poet of POETS) {
  addAuth({ id: `auth_${poet.id}`, nameViet: poet.nameVi, nameHan: poet.name, dynasty: poet.dynastyVi, bio: poet.bio });
}

w("library/authors.ts", [
  `import type { Author } from "@/types/library";`,
  ``,
  `export const dataAuthors: Author[] = ${compact(auths)};`,
  ``,
].join("\n"));
console.log("  library/authors.ts (%d)", auths.length);

// ── 6. Book content helper ────────────────────────────────────

function processVerses(verses, workId, chapterGrouping) {
  const chapters = [];
  const sentences = [];
  const overridesMap = {};

  function addVerse(v, chId, sIdx, pgGroup) {
    const text = v.lines.length === 1
      ? v.lines[0] + "。"
      : v.lines.slice(0, -1).join("，") + "，" + v.lines[v.lines.length - 1] + "。";
    const tradStr = tradText(text);
    const sId = `snt_${chId}_${sIdx}`;
    const pgNum = typeof pgGroup === "string" ? parseInt(pgGroup) || sIdx : pgGroup;
    const sent = {
      id: sId, chapterId: chId, textTraditional: tradStr, sentenceOrder: sIdx, paragraphGroup: pgNum,
      hanVietReading: genReading(text, v.overrides, 1),
      pinyinReading: genReading(text, v.overrides, 0),
      translation: v.meaning,
    };
    if (text !== tradStr) sent.textSimplified = text;
    sentences.push(sent);
    if (v.overrides) overridesMap[sId] = v.overrides;
  }

  if (chapterGrouping === "lun_ngu") {
    const chMap = new Map();
    for (const v of verses) {
      if (!chMap.has(v.chapter)) chMap.set(v.chapter, { title: v.chapter, titleVi: v.chapterVi, verses: [] });
      chMap.get(v.chapter).verses.push(v);
    }
    let chNum = 1;
    for (const [, chData] of chMap) {
      const chId = `ch_${workId}_${chNum}`;
      chapters.push({ id: chId, workId, titleViet: chData.titleVi, titleHan: chData.title, chapterNumber: chNum, sortOrder: chNum });
      let sIdx = 1;
      for (const v of chData.verses) { addVerse(v, chId, sIdx, v.number || sIdx); sIdx++; }
      chNum++;
    }
  } else if (chapterGrouping === "commentary") {
    const sections = COM?.tam_tu_kinh?.sections || [];
    for (const sec of sections) {
      const chId = `ch_${workId}_${sec.id}`;
      chapters.push({ id: chId, workId, titleViet: sec.titleVi, titleHan: sec.title, chapterNumber: sec.id, sortOrder: sec.id });
      let sIdx = 1;
      for (let i = sec.verseRange[0]; i <= sec.verseRange[1] && i < verses.length; i++) {
        addVerse(verses[i], chId, sIdx, sIdx);
        sIdx++;
      }
    }
    // Remaining verses not covered by commentary sections
    const maxCovered = Math.max(...(sections.map((s) => s.verseRange[1]) || [0])) + 1;
    if (maxCovered < verses.length) {
      const perPage = 4;
      let secId = sections.length + 1;
      for (let i = maxCovered; i < verses.length; i += perPage) {
        const chId = `ch_${workId}_${secId}`;
        chapters.push({ id: chId, workId, titleViet: `Phần ${secId}`, chapterNumber: secId, sortOrder: secId });
        let sIdx = 1;
        for (let j = i; j < Math.min(i + perPage, verses.length); j++) {
          addVerse(verses[j], chId, sIdx, sIdx);
          sIdx++;
        }
        secId++;
      }
    }
  } else {
    // Simple: group by versesPerPage or single chapter
    const perPage = chapterGrouping || verses.length;
    const numCh = Math.ceil(verses.length / perPage);
    for (let ch = 0; ch < numCh; ch++) {
      const chId = `ch_${workId}_${ch + 1}`;
      chapters.push({ id: chId, workId, titleViet: numCh > 1 ? `Phần ${ch + 1}` : undefined, chapterNumber: ch + 1, sortOrder: ch + 1 });
      let sIdx = 1;
      for (let i = ch * perPage; i < Math.min((ch + 1) * perPage, verses.length); i++) {
        addVerse(verses[i], chId, sIdx, sIdx);
        sIdx++;
      }
    }
  }

  return { chapters, sentences, overrides: overridesMap };
}

function writeBookFile(filename, prefix, data) {
  w(filename, [
    `import type { Chapter, Sentence } from "@/types/library";`,
    ``,
    `export const ${prefix}Chapters: Chapter[] = ${compact(data.chapters)};`,
    ``,
    `export const ${prefix}Sentences: Sentence[] = ${compact(data.sentences)};`,
    ``,
    `export const ${prefix}Overrides: Record<string, Record<string, [string, string, string]>> = ${J(data.overrides)};`,
    ``,
  ].join("\n"));
}

// Tam Tự Kinh
const ttkData = processVerses(TTK.verses, "work_ttk", "commentary");
writeBookFile("library/tam-tu-kinh.ts", "ttk", ttkData);
console.log("  library/tam-tu-kinh.ts (%d ch, %d snt)", ttkData.chapters.length, ttkData.sentences.length);

// Luận Ngữ
const lnData = processVerses(LN.verses, "work_ln", "lun_ngu");
writeBookFile("library/luan-ngu.ts", "ln", lnData);
console.log("  library/luan-ngu.ts (%d ch, %d snt)", lnData.chapters.length, lnData.sentences.length);

// Thiên Tự Văn
const ttvData = processVerses(TTV.verses, "work_ttv", TTV.versesPerPage || 4);
writeBookFile("library/thien-tu-van.ts", "ttv", ttvData);
console.log("  library/thien-tu-van.ts (%d ch, %d snt)", ttvData.chapters.length, ttvData.sentences.length);

// Bách Gia Tính
const bgtData = processVerses(BGT.verses, "work_bgt", BGT.versesPerPage || 4);
writeBookFile("library/bach-gia-tinh.ts", "bgt", bgtData);
console.log("  library/bach-gia-tinh.ts (%d ch, %d snt)", bgtData.chapters.length, bgtData.sentences.length);

// ── 7. Poets ──────────────────────────────────────────────────
const allPoetChapters = [];
const allPoetSentences = [];
const allPoetOverrides = {};

for (const poet of POETS) {
  const workId = `work_${poet.id}`;
  for (let pi = 0; pi < poet.poems.length; pi++) {
    const poem = poet.poems[pi];
    const chId = `ch_${workId}_${pi + 1}`;
    allPoetChapters.push({
      id: chId, workId, titleViet: poem.titleVi, titleHan: poem.title,
      chapterNumber: pi + 1, sectionLabel: poem.form, sortOrder: pi + 1,
    });

    let sIdx = 1;
    for (const v of poem.verses) {
      const text = v.lines.length === 1
        ? v.lines[0] + "。"
        : v.lines.slice(0, -1).join("，") + "，" + v.lines[v.lines.length - 1] + "。";
      const tradStr = tradText(text);
      const sId = `snt_${chId}_${sIdx}`;
      const sent = {
        id: sId, chapterId: chId, textTraditional: tradStr, sentenceOrder: sIdx, paragraphGroup: sIdx,
        hanVietReading: genReading(text, v.overrides, 1),
        pinyinReading: genReading(text, v.overrides, 0),
        translation: v.meaning,
      };
      if (text !== tradStr) sent.textSimplified = text;
      allPoetSentences.push(sent);
      if (v.overrides) allPoetOverrides[sId] = v.overrides;
      sIdx++;
    }
  }
}

w("library/poems.ts", [
  `import type { Chapter, Sentence } from "@/types/library";`,
  ``,
  `export const poetChapters: Chapter[] = ${compact(allPoetChapters)};`,
  ``,
  `export const poetSentences: Sentence[] = ${compact(allPoetSentences)};`,
  ``,
  `export const poetOverrides: Record<string, Record<string, [string, string, string]>> = ${J(allPoetOverrides)};`,
  ``,
].join("\n"));
console.log("  library/poems.ts (%d ch, %d snt)", allPoetChapters.length, allPoetSentences.length);

// ── 8. library/works.ts ───────────────────────────────────────

function countChars(sentences) {
  return sentences.reduce((sum, s) => sum + [...s.textTraditional].filter((c) => !PUNCT.test(c)).length, 0);
}

const dataWorks = [];

// Classical books
const bookDefs = [
  { src: TTK, id: "work_ttk", authId: `auth_${TTK.id}`, data: ttkData, icon: "三", tagIds: ["t1", "t7", "t15", "t19"] },
  { src: LN, id: "work_ln", authId: "auth_confucius", data: lnData, icon: "論", tagIds: ["t1", "t7", "t11", "t19"] },
  { src: TTV, id: "work_ttv", authId: `auth_${TTV.id}`, data: ttvData, icon: "千", tagIds: ["t2", "t7", "t19"] },
  { src: BGT, id: "work_bgt", authId: `auth_${BGT.id}`, data: bgtData, icon: "百", tagIds: ["t2", "t7", "t15", "t19"] },
];

for (const b of bookDefs) {
  dataWorks.push({
    id: b.id,
    titleViet: b.src.nameVi,
    titleHan: b.src.name,
    authorId: b.authId,
    chapterCount: b.data.chapters.length,
    characterCount: countChars(b.data.sentences),
    language: "han_van",
    isPublished: true,
    iconChar: b.icon,
    progressPercent: 0,
    tagIds: b.tagIds,
  });
}

// Poets as works
const DYNASTY_TAG = { "Đường": "t14", "Tống": "t15" };
for (const poet of POETS) {
  const poetSents = allPoetSentences.filter((s) => s.chapterId.startsWith(`ch_work_${poet.id}_`));
  const poetChs = allPoetChapters.filter((c) => c.workId === `work_${poet.id}`);
  dataWorks.push({
    id: `work_${poet.id}`,
    titleViet: `Thơ ${poet.nameVi}`,
    titleHan: `${poet.name}诗集`,
    authorId: `auth_${poet.id}`,
    chapterCount: poetChs.length,
    characterCount: countChars(poetSents),
    language: "han_van",
    isPublished: true,
    iconChar: poet.name[0],
    progressPercent: 0,
    tagIds: ["t5", "t6", DYNASTY_TAG[poet.dynastyVi] || "t14", "t19"].filter(Boolean),
  });
}

w("library/works.ts", [
  `import type { Work } from "@/types/library";`,
  ``,
  `export const dataWorks: (Omit<Work, "author" | "tags"> & { tagIds: string[] })[] = ${compact(dataWorks)};`,
  ``,
].join("\n"));
console.log("  library/works.ts (%d)", dataWorks.length);

// ── 9. Commentary / Annotations ───────────────────────────────

const annotations = [];
if (COM?.tam_tu_kinh) {
  const c = COM.tam_tu_kinh;
  if (c.intro) {
    const introContent = c.intro.textVi || c.intro.text;
    if (introContent) {
      annotations.push({
        id: "ann_ttk_intro",
        sentenceId: ttkData.sentences[0]?.id || "",
        level: "paragraph",
        content: introContent,
      });
    }
  }
  for (const sec of c.sections || []) {
    const firstSent = ttkData.sentences.find((s) => s.chapterId === `ch_work_ttk_${sec.id}`);
    if (firstSent) {
      const vnContent = sec.vernacularVi || sec.vernacular;
      if (vnContent) {
        annotations.push({
          id: `ann_ttk_${sec.id}_vn`,
          sentenceId: firstSent.id,
          level: "paragraph",
          content: vnContent,
        });
      }
      const interpContent = sec.interpretationVi || sec.interpretation;
      if (interpContent) {
        annotations.push({
          id: `ann_ttk_${sec.id}_interp`,
          sentenceId: firstSent.id,
          level: "paragraph",
          content: interpContent,
        });
      }
    }
  }
}

w("library/annotations.ts", [
  `import type { Annotation } from "@/types/library";`,
  ``,
  `export const dataAnnotations: Annotation[] = ${compact(annotations)};`,
  ``,
].join("\n"));
console.log("  library/annotations.ts (%d)", annotations.length);

// ── 10. index.ts ──────────────────────────────────────────────

w("index.ts", [
  `export { radicals, radicalMap } from "./radicals";`,
  `export { characters, getChar } from "./characters";`,
  `export { entries, compoundEntries, idiomEntries, specializedEntries } from "./entries";`,
  `export { simpToTrad, tradToSimp } from "./simp-trad";`,
  `export { dataAuthors } from "./library/authors";`,
  `export { dataWorks } from "./library/works";`,
  `export { ttkChapters, ttkSentences, ttkOverrides } from "./library/tam-tu-kinh";`,
  `export { lnChapters, lnSentences, lnOverrides } from "./library/luan-ngu";`,
  `export { ttvChapters, ttvSentences, ttvOverrides } from "./library/thien-tu-van";`,
  `export { bgtChapters, bgtSentences, bgtOverrides } from "./library/bach-gia-tinh";`,
  `export { poetChapters, poetSentences, poetOverrides } from "./library/poems";`,
  `export { dataAnnotations } from "./library/annotations";`,
  ``,
  `import { ttkChapters, ttkSentences } from "./library/tam-tu-kinh";`,
  `import { lnChapters, lnSentences } from "./library/luan-ngu";`,
  `import { ttvChapters, ttvSentences } from "./library/thien-tu-van";`,
  `import { bgtChapters, bgtSentences } from "./library/bach-gia-tinh";`,
  `import { poetChapters, poetSentences } from "./library/poems";`,
  `import type { Chapter, Sentence } from "@/types/library";`,
  ``,
  `const _allChapters = [...ttkChapters, ...lnChapters, ...ttvChapters, ...bgtChapters, ...poetChapters];`,
  `const _allSentences = [...ttkSentences, ...lnSentences, ...ttvSentences, ...bgtSentences, ...poetSentences];`,
  ``,
  `export function getChaptersByWorkId(workId: string): Chapter[] {`,
  `  return _allChapters.filter(c => c.workId === workId);`,
  `}`,
  ``,
  `export function getSentencesByChapterId(chapterId: string): Sentence[] {`,
  `  return _allSentences.filter(s => s.chapterId === chapterId);`,
  `}`,
  ``,
  `import { ttkOverrides } from "./library/tam-tu-kinh";`,
  `import { lnOverrides } from "./library/luan-ngu";`,
  `import { ttvOverrides } from "./library/thien-tu-van";`,
  `import { bgtOverrides } from "./library/bach-gia-tinh";`,
  `import { poetOverrides } from "./library/poems";`,
  ``,
  `export function getOverrides(sentenceId: string): Record<string, [string, string, string]> | undefined {`,
  `  return ttkOverrides[sentenceId] || lnOverrides[sentenceId] || ttvOverrides[sentenceId] || bgtOverrides[sentenceId] || poetOverrides[sentenceId];`,
  `}`,
  ``,
].join("\n"));
console.log("  index.ts");

console.log("\nDone! Generated %d files.", 10);
