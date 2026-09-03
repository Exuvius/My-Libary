import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");

// ── simp→trad mapping ──
const stRaw = fs.readFileSync(path.join(dataDir, "simp-trad.ts"), "utf8");
const simpTradMap = {};
const stMatch = stRaw.match(/simpToTrad[^{]*(\{[^;]+\})/);
if (stMatch) {
  for (const [s, t] of Object.entries(JSON.parse(stMatch[1]))) {
    simpTradMap[s] = t;
  }
}
function toTrad(text) {
  return [...text].map(c => simpTradMap[c] || c).join("");
}

// ── Chinese numeral parser ──
const cnDigits = { 零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,
  百:100,千:1000,廿:20,卅:30 };
function parseChineseNum(s) {
  if (!s) return 0;
  let result = 0, current = 0;
  for (const ch of s) {
    const val = cnDigits[ch];
    if (val === undefined) continue;
    if (val >= 10) {
      result += (current || 1) * val;
      current = 0;
    } else {
      current = current * 10 + val;
    }
  }
  return result + current;
}

// ── Sino-Vietnamese volume labels ──
const cnVietNum = ["","nhất","nhị","tam","tứ","ngũ","lục","thất","bát","cửu","thập",
  "thập nhất","thập nhị","thập tam","thập tứ","thập ngũ","thập lục","thập thất",
  "thập bát","thập cửu","nhị thập","nhị thập nhất","nhị thập nhị","nhị thập tam",
  "nhị thập tứ","nhị thập ngũ","nhị thập lục","nhị thập thất","nhị thập bát",
  "nhị thập cửu","tam thập","tam thập nhất","tam thập nhị","tam thập tam",
  "tam thập tứ","tam thập ngũ","tam thập lục","tam thập thất","tam thập bát",
  "tam thập cửu","tứ thập","tứ thập nhất","tứ thập nhị","tứ thập tam",
  "tứ thập tứ","tứ thập ngũ","tứ thập lục","tứ thập thất","tứ thập bát",
  "tứ thập cửu","ngũ thập","ngũ thập nhất"];
function quyenLabel(n) {
  return `Quyển ${cnVietNum[n] || n}`;
}

function countCJK(text) {
  let n = 0;
  for (const c of text) {
    const code = c.charCodeAt(0);
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)) n++;
  }
  return n;
}

function parseJSONL(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l));
}

function splitParagraphs(text) {
  return text.split("\\n").map(s => s.trim()).filter(s => s && s.length > 1);
}

function writeBookFile({ filename, prefix, workId, chapters, sentences }) {
  const outPath = path.join(dataDir, "library", filename);
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
  console.log(`  ${filename}: ${chapters.length} ch, ${sentences.length} sentences, ${size}KB`);
}

// ── Nghi Lễ ritual name mapping ──
const nghiLeRituals = {
  "士冠禮": "Sĩ Quan Lễ",
  "士昏禮": "Sĩ Hôn Lễ",
  "士相見禮": "Sĩ Tương Kiến Lễ",
  "鄉飲酒禮": "Hương Ẩm Tửu Lễ",
  "鄉射禮": "Hương Xạ Lễ",
  "燕禮": "Yến Lễ",
  "大射": "Đại Xạ",
  "聘禮": "Sính Lễ",
  "公食大夫禮": "Công Thực Đại Phu Lễ",
  "覲禮": "Cận Lễ",
  "喪服": "Tang Phục",
  "士喪禮": "Sĩ Tang Lễ",
  "既夕禮": "Kí Tịch Lễ",
  "士虞禮": "Sĩ Ngu Lễ",
  "特牲饋食禮": "Đặc Sinh Quỹ Thực Lễ",
  "少牢饋食禮": "Thiểu Lao Quỹ Thực Lễ",
  "有司徹": "Hữu Tư Triệt",
};

// ============================================================
// Convert 儀禮注疏 (Nghi Lễ)
// ============================================================
console.log("Converting 儀禮注疏 (Nghi Lễ Chú Sớ)...");
const nlData = parseJSONL(path.join(__dirname, "nghi-le.json"));
const nlChapters = [];
const nlSentences = [];
let nlTotalChars = 0;

for (let i = 0; i < nlData.length; i++) {
  const entry = nlData[i];
  const rawTitle = entry["章节"];
  // Parse "卷一 士冠礼第一" → volume + ritual
  const volMatch = rawTitle.match(/卷([^\s]+)\s*(.+)/);
  let volNum = i + 1;
  let ritualHan = "";
  let ritualNameHan = "";
  if (volMatch) {
    const numStr = volMatch[1].replace(/[上下]/g, "");
    volNum = parseChineseNum(numStr) || (i + 1);
    ritualHan = volMatch[2];
    // Remove 第X number suffix to get ritual name
    ritualNameHan = ritualHan.replace(/第[一二三四五六七八九十百]+$/, "").trim();
  }
  const titleHan = toTrad(rawTitle.replace(/卷[^\s]+\s*/, ""));
  const ritualTrad = toTrad(ritualNameHan);
  const sectionLabel = nghiLeRituals[ritualTrad] || ritualTrad;
  const suffix = volMatch?.[1].includes("下") ? " hạ" : "";
  const titleViet = `Quyển ${volNum}${suffix} — ${sectionLabel}`;

  const chId = `ch_work_nl_${i + 1}`;
  nlChapters.push({
    id: chId, workId: "work_nl",
    titleViet, titleHan: toTrad(rawTitle),
    chapterNumber: i + 1, sectionLabel, sortOrder: i + 1,
  });

  const paras = splitParagraphs(entry["正文"]);
  for (let p = 0; p < paras.length; p++) {
    const text = toTrad(paras[p]);
    if (countCJK(text) < 2) continue;
    nlTotalChars += countCJK(text);
    nlSentences.push({
      id: `s_work_nl_${i + 1}_${p + 1}`,
      chapterId: chId, text, sortOrder: p + 1,
    });
  }
}

writeBookFile({
  filename: "nghi-le.ts", prefix: "nghiLe", workId: "work_nl",
  chapters: nlChapters, sentences: nlSentences,
});
console.log(`  Total CJK: ${nlTotalChars.toLocaleString()}`);

// ============================================================
// Convert 周禮注疏 (Chu Lễ)
// ============================================================
console.log("\nConverting 周禮注疏 (Chu Lễ Chú Sớ)...");
const clData = parseJSONL(path.join(__dirname, "chu-le.json"));
const clChapters = [];
const clSentences = [];
let clTotalChars = 0;

// Chu Lễ has 6 sections: 天官/地官/春官/夏官/秋官/冬官考工記
// We'll detect from content or just use volume-based sections
const chuLeSections = {
  1: "Thiên Quan", 2: "Thiên Quan", 3: "Thiên Quan", 4: "Thiên Quan",
  5: "Thiên Quan", 6: "Thiên Quan", 7: "Thiên Quan", 8: "Thiên Quan",
  9: "Địa Quan", 10: "Địa Quan", 11: "Địa Quan", 12: "Địa Quan",
  13: "Địa Quan", 14: "Địa Quan", 15: "Địa Quan",
  16: "Xuân Quan", 17: "Xuân Quan", 18: "Xuân Quan", 19: "Xuân Quan",
  20: "Xuân Quan", 21: "Xuân Quan", 22: "Xuân Quan",
  23: "Hạ Quan", 24: "Hạ Quan", 25: "Hạ Quan", 26: "Hạ Quan",
  27: "Hạ Quan", 28: "Hạ Quan",
  29: "Thu Quan", 30: "Thu Quan", 31: "Thu Quan", 32: "Thu Quan",
  33: "Thu Quan", 34: "Thu Quan",
  35: "Đông Quan – Khảo Công Ký", 36: "Đông Quan – Khảo Công Ký",
  37: "Đông Quan – Khảo Công Ký", 38: "Đông Quan – Khảo Công Ký",
  39: "Đông Quan – Khảo Công Ký", 40: "Đông Quan – Khảo Công Ký",
  41: "Đông Quan – Khảo Công Ký", 42: "Đông Quan – Khảo Công Ký",
};

for (let i = 0; i < clData.length; i++) {
  const entry = clData[i];
  const rawTitle = entry["章节"].replace(/^●/, "");
  let titleHan = toTrad(rawTitle);
  let volNum = 0;
  let titleViet = "";
  let sectionLabel = "";

  if (rawTitle === "周礼正义序") {
    titleHan = "周禮正義序";
    titleViet = "Chu Lễ Chính Nghĩa Tự";
    sectionLabel = "Tự";
    volNum = 0;
  } else {
    const volMatch = rawTitle.match(/卷(.+)/);
    if (volMatch) {
      volNum = parseChineseNum(volMatch[1]);
    }
    sectionLabel = chuLeSections[volNum] || `Quyển ${volNum}`;
    titleViet = quyenLabel(volNum || (i + 1));
  }

  const chId = `ch_work_cl_${i + 1}`;
  clChapters.push({
    id: chId, workId: "work_cl",
    titleViet, titleHan,
    chapterNumber: i + 1, sectionLabel, sortOrder: i + 1,
  });

  const paras = splitParagraphs(entry["正文"]);
  for (let p = 0; p < paras.length; p++) {
    const text = toTrad(paras[p]);
    if (countCJK(text) < 2) continue;
    clTotalChars += countCJK(text);
    clSentences.push({
      id: `s_work_cl_${i + 1}_${p + 1}`,
      chapterId: chId, text, sortOrder: p + 1,
    });
  }
}

writeBookFile({
  filename: "chu-le.ts", prefix: "chuLe", workId: "work_cl",
  chapters: clChapters, sentences: clSentences,
});
console.log(`  Total CJK: ${clTotalChars.toLocaleString()}`);

console.log("\nDone!");
