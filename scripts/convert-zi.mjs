import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");
const REPO_BASE = "https://raw.githubusercontent.com/nursery42/ChineseliteratureDataset/main/";

// ── simp→trad mapping ──
const stRaw = fs.readFileSync(path.join(dataDir, "simp-trad.ts"), "utf8");
const simpTradMap = {};
const stMatch = stRaw.match(/simpToTrad[^{]*(\{[^;]+\})/s);
if (stMatch) {
  for (const [s, t] of Object.entries(JSON.parse(stMatch[1]))) simpTradMap[s] = t;
}
function toTrad(text) {
  return [...text].map(c => simpTradMap[c] || c).join("");
}

// ── Chinese numeral parser ──
const cnDigits = { 零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100,千:1000,廿:20,卅:30 };
function parseChineseNum(s) {
  if (!s) return 0;
  let result = 0, current = 0;
  for (const ch of s) {
    const val = cnDigits[ch];
    if (val === undefined) continue;
    if (val >= 10) { result += (current || 1) * val; current = 0; }
    else { current = current * 10 + val; }
  }
  return result + current;
}

const cnVietNum = ["","nhất","nhị","tam","tứ","ngũ","lục","thất","bát","cửu","thập",
  "thập nhất","thập nhị","thập tam","thập tứ","thập ngũ","thập lục","thập thất",
  "thập bát","thập cửu","nhị thập","nhị thập nhất","nhị thập nhị","nhị thập tam",
  "nhị thập tứ","nhị thập ngũ","nhị thập lục","nhị thập thất","nhị thập bát",
  "nhị thập cửu","tam thập","tam thập nhất","tam thập nhị","tam thập tam",
  "tam thập tứ","tam thập ngũ","tam thập lục","tam thập thất","tam thập bát",
  "tam thập cửu","tứ thập","tứ thập nhất","tứ thập nhị","tứ thập tam",
  "tứ thập tứ","tứ thập ngũ","tứ thập lục","tứ thập thất","tứ thập bát",
  "tứ thập cửu","ngũ thập","ngũ thập nhất","ngũ thập nhị","ngũ thập tam",
  "ngũ thập tứ","ngũ thập ngũ","ngũ thập lục","ngũ thập thất","ngũ thập bát",
  "ngũ thập cửu","lục thập","lục thập nhất","lục thập nhị","lục thập tam",
  "lục thập tứ","lục thập ngũ","lục thập lục","lục thập thất","lục thập bát",
  "lục thập cửu","thất thập","thất thập nhất","thất thập nhị","thất thập tam",
  "thất thập tứ","thất thập ngũ","thất thập lục","thất thập thất","thất thập bát",
  "thất thập cửu","bát thập","bát thập nhất","bát thập nhị","bát thập tam",
  "bát thập tứ","bát thập ngũ","bát thập lục","bát thập thất","bát thập bát",
  "bát thập cửu","cửu thập","cửu thập nhất","cửu thập nhị","cửu thập tam",
  "cửu thập tứ","cửu thập ngũ","cửu thập lục","cửu thập thất","cửu thập bát",
  "cửu thập cửu","nhất bách"];
function quyenLabel(n) {
  return `Quyển ${cnVietNum[n] || n}`;
}

function countCJK(text) {
  let n = 0;
  for (const c of text) {
    const code = c.codePointAt(0);
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0x20000 && code <= 0x2a6df) || (code >= 0xf900 && code <= 0xfaff)) n++;
  }
  return n;
}

function parseJSONL(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  // Some files are proper JSON arrays, others are JSONL
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  return trimmed.split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l));
}

function splitParagraphs(text) {
  return text.split("\\n").map(s => s.trim()).filter(s => s && s.length > 1);
}

async function downloadFile(githubPath, localPath) {
  if (fs.existsSync(localPath)) {
    console.log(`  Using cached ${path.basename(localPath)}`);
    return;
  }
  const decodedPath = decodeURIComponent(githubPath);
  const url = REPO_BASE + decodedPath;
  console.log(`  Downloading ${path.basename(localPath)}...`);
  const { execSync } = await import("child_process");
  const safeUrl = url.replace(/ /g, "%20");
  execSync(`curl -sL -o "${localPath}" "${safeUrl}"`, { timeout: 180000 });
  if (!fs.existsSync(localPath) || fs.statSync(localPath).size < 10) {
    throw new Error(`Download failed for ${url}`);
  }
  console.log(`  Downloaded ${(fs.statSync(localPath).size / 1024 / 1024).toFixed(1)}MB`);
}

function convertWork(workKey, workMeta, jsonPaths, sectionLabels) {
  const { id, filename, prefix } = workMeta;
  const chapters = [];
  const sentences = [];
  let totalChars = 0;
  let globalChIdx = 0;

  for (let fileIdx = 0; fileIdx < jsonPaths.length; fileIdx++) {
    const data = parseJSONL(jsonPaths[fileIdx]);
    const sectionLabel = sectionLabels?.[fileIdx] || "";

    for (let i = 0; i < data.length; i++) {
      globalChIdx++;
      const entry = data[i];
      const rawTitle = (entry["章节"] || entry["title"] || `${i + 1}`).replace(/^●/, "");

      // Parse volume number from title
      let volNum = globalChIdx;
      const volMatch = rawTitle.match(/卷([^\s·—]+)/);
      if (volMatch) {
        const parsed = parseChineseNum(volMatch[1].replace(/[上中下]/g, ""));
        if (parsed > 0) volNum = parsed;
      }

      const titleHan = toTrad(rawTitle);
      const suffix = rawTitle.includes("下") && rawTitle.match(/卷.+下/) ? " hạ" :
                     rawTitle.includes("中") && rawTitle.match(/卷.+中/) ? " trung" : "";
      let titleViet = volMatch ? `${quyenLabel(volNum)}${suffix}` : `Chương ${globalChIdx}`;
      if (sectionLabel && !titleViet.includes(sectionLabel)) {
        titleViet += ` — ${sectionLabel}`;
      }

      const chId = `ch_${id}_${globalChIdx}`;
      chapters.push({
        id: chId, workId: id,
        titleViet, titleHan,
        chapterNumber: globalChIdx,
        sectionLabel: sectionLabel || titleHan,
        sortOrder: globalChIdx,
      });

      const rawText = entry["正文"] || entry["content"] || "";
      const paras = splitParagraphs(rawText);
      for (let p = 0; p < paras.length; p++) {
        const text = toTrad(paras[p]);
        if (countCJK(text) < 2) continue;
        totalChars += countCJK(text);
        sentences.push({
          id: `s_${id}_${globalChIdx}_${p + 1}`,
          chapterId: chId, text, sortOrder: p + 1,
        });
      }
    }
  }

  // Write .ts file
  const outPath = path.join(dataDir, "library", "tu", filename);
  let ts = 'import type { Chapter, Sentence } from "@/types/library";\n\n';
  ts += `export const ${prefix}Chapters: Chapter[] = [\n`;
  for (const ch of chapters) ts += `  ${JSON.stringify(ch)},\n`;
  ts += "];\n\n";
  ts += `export const ${prefix}Sentences: Sentence[] = [\n`;
  for (const s of sentences) ts += `  ${JSON.stringify(s)},\n`;
  ts += "];\n\n";
  ts += `export const ${prefix}Overrides: Record<string, Record<string, [string, string, string]>> = {};\n`;
  fs.writeFileSync(outPath, ts, "utf8");

  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`  => ${filename}: ${chapters.length} chapters, ${sentences.length} sentences, ${totalChars.toLocaleString()} CJK, ${size}KB`);
  return { chapters: chapters.length, sentences: sentences.length, totalChars };
}

// ── Main ──
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node convert-zi.mjs <work-key> [work-key2 ...]");
  console.log("       node convert-zi.mjs --all");
  process.exit(1);
}

const worksMeta = JSON.parse(fs.readFileSync(path.join(__dirname, "zi-works.json"), "utf8"));
const keys = args[0] === "--all" ? Object.keys(worksMeta) : args;

for (const key of keys) {
  const meta = worksMeta[key];
  if (!meta) { console.error(`Unknown work: ${key}`); continue; }
  console.log(`\n=== ${meta.titleHan} (${meta.titleViet}) ===`);

  try {
    const jsonPaths = [];
    const paths = meta.multiFile || [meta.githubPath];
    for (let i = 0; i < paths.length; i++) {
      const fname = `${key}${paths.length > 1 ? `_${i + 1}` : ""}.json`;
      const localPath = path.join(__dirname, fname);
      await downloadFile(paths[i], localPath);
      jsonPaths.push(localPath);
    }
    convertWork(key, meta, jsonPaths, meta.sectionLabels);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  }
}

console.log("\nDone!");
