import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIBRARY_DIR = path.join(ROOT, "src", "data", "library");
const OUTPUT_DIR = path.join(ROOT, "public", "data");

const SKIP_FILES = new Set(["works.ts", "authors.ts", "annotations.ts"]);

function findMatchingBracket(content, start, openChar, closeChar) {
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = start; i < content.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (content[i] === "\\") { escaped = true; continue; }

    if (inString) {
      if (content[i] === stringChar) inString = false;
      continue;
    }

    if (content[i] === '"' || content[i] === "'") {
      inString = true;
      stringChar = content[i];
      continue;
    }

    if (content[i] === openChar) depth++;
    else if (content[i] === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractBracketedData(content, markerRegex, openChar = "[", closeChar = "]") {
  const match = content.match(markerRegex);
  if (!match) return openChar === "[" ? [] : {};

  const searchStart = match.index + match[0].length;
  const start = content.indexOf(openChar, searchStart);
  if (start === -1 || start > searchStart + 10) return openChar === "[" ? [] : {};

  const end = findMatchingBracket(content, start, openChar, closeChar);
  if (end === -1) return openChar === "[" ? [] : {};

  const text = content.substring(start, end + 1);
  try {
    return new Function(`return ${text}`)();
  } catch (e) {
    console.error(`  Error parsing data: ${e.message}`);
    return openChar === "[" ? [] : {};
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  const chapters = extractBracketedData(
    content,
    /export\s+const\s+\w+Chapters\s*:\s*Chapter\[\]\s*=\s*/
  );

  const sentences = extractBracketedData(
    content,
    /export\s+const\s+\w+Sentences\s*:\s*Sentence\[\]\s*=\s*/
  );

  const overrides = extractBracketedData(
    content,
    /export\s+const\s+\w+Overrides\s*:\s*Record<[^>]+>\s*=\s*/,
    "{", "}"
  );

  const annotations = extractBracketedData(
    content,
    /export\s+const\s+\w+Annotations\s*:\s*Annotation\[\]\s*=\s*/
  );

  return { chapters, sentences, overrides, annotations };
}

function groupBy(arr, key) {
  const map = new Map();
  for (const item of arr) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

const gbkDecoder = new TextDecoder("gbk");
function fixMojibake(str) {
  if (!str || !/[\xa0-\xff]{2,}/.test(str)) return str;
  try {
    return gbkDecoder.decode(Buffer.from(str, "latin1"));
  } catch { return str; }
}

function fixChapterFields(ch) {
  ch.titleHan = fixMojibake(ch.titleHan);
  ch.sectionLabel = fixMojibake(ch.sectionLabel);
  return ch;
}

function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data));
}

function collectAllFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      results.push(...collectAllFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith(".ts") && !SKIP_FILES.has(entry.name)) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

// Main
console.log("Generating book JSON data...\n");

const files = collectAllFiles(LIBRARY_DIR);
let totalWorks = 0;
let totalChapters = 0;
let totalFiles = 0;

const sentenceToChapter = new Map();

for (const filePath of files) {
  const relPath = path.relative(ROOT, filePath);
  console.log(`Processing: ${relPath}`);

  const { chapters, sentences, overrides, annotations } = processFile(filePath);

  if (chapters.length === 0) {
    console.log("  Skipped (no chapters found)");
    continue;
  }

  const chaptersByWork = groupBy(chapters, "workId");
  const sentencesByChapter = groupBy(sentences, "chapterId");

  for (const s of sentences) {
    sentenceToChapter.set(s.id, s.chapterId);
  }

  const overridesByChapter = new Map();
  for (const [sentenceId, overrideData] of Object.entries(overrides)) {
    const chapterId = sentenceToChapter.get(sentenceId);
    if (!chapterId) continue;
    if (!overridesByChapter.has(chapterId)) overridesByChapter.set(chapterId, {});
    overridesByChapter.get(chapterId)[sentenceId] = overrideData;
  }

  const annotationsByChapter = groupBy(
    annotations.filter(a => sentenceToChapter.has(a.sentenceId)),
    a => "chapterId" // annotations don't have chapterId — derive from sentenceId
  );
  const annotsBySentenceChapter = new Map();
  for (const ann of annotations) {
    const chapterId = sentenceToChapter.get(ann.sentenceId);
    if (!chapterId) continue;
    if (!annotsBySentenceChapter.has(chapterId)) annotsBySentenceChapter.set(chapterId, []);
    annotsBySentenceChapter.get(chapterId).push(ann);
  }

  for (const [workId, workChapters] of chaptersByWork) {
    const workDir = path.join(OUTPUT_DIR, workId);

    workChapters.sort((a, b) => a.sortOrder - b.sortOrder);
    workChapters.forEach(fixChapterFields);
    writeJsonFile(path.join(workDir, "chapters.json"), workChapters);

    let chapterFileCount = 0;
    for (const ch of workChapters) {
      const chSentences = sentencesByChapter.get(ch.id) || [];
      chSentences.sort((a, b) => a.sentenceOrder - b.sentenceOrder);

      const chOverrides = overridesByChapter.get(ch.id) || {};
      const chAnnotations = annotsBySentenceChapter.get(ch.id) || [];

      const chapterData = { sentences: chSentences, overrides: chOverrides };
      if (chAnnotations.length > 0) {
        chapterData.annotations = chAnnotations;
      }

      writeJsonFile(path.join(workDir, `${ch.id}.json`), chapterData);
      chapterFileCount++;
    }

    totalWorks++;
    totalChapters += workChapters.length;
    totalFiles += chapterFileCount + 1;
    console.log(`  → ${workId}: ${workChapters.length} chapters`);
  }
}

console.log(`\nDone! Generated ${totalFiles} files for ${totalWorks} works (${totalChapters} chapters).`);
console.log(`Output: ${OUTPUT_DIR}`);
