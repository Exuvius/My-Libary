import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");

const simpTradRaw = fs.readFileSync(
  path.join(dataDir, "simp-trad.ts"),
  "utf8"
);
const simpTradMap = {};
const tradSimpMap = {};
const stMatch = simpTradRaw.match(/simpToTrad[^{]*(\{[^;]+\})/);
if (stMatch) {
  const obj = JSON.parse(stMatch[1]);
  for (const [s, t] of Object.entries(obj)) {
    simpTradMap[s] = t;
    tradSimpMap[t] = s;
  }
}

function toTrad(text) {
  return [...text].map((c) => simpTradMap[c] || c).join("");
}
function toSimp(text) {
  return [...text].map((c) => tradSimpMap[c] || c).join("");
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
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

function splitParagraphs(text) {
  return text
    .split("\x5Cn")
    .map((s) => s.trim())
    .filter((s) => s && s !== "\x00" && s.length > 1);
}

function escapeForTS(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function writeBookFile(config) {
  const { filename, prefix, workId, chapters, sentences, overrides } = config;
  const outPath = path.join(dataDir, "library", filename);

  let ts = 'import type { Chapter, Sentence } from "@/types/library";\n\n';

  ts += `export const ${prefix}Chapters: Chapter[] = [\n`;
  for (const ch of chapters) {
    ts += `  ${JSON.stringify(ch)},\n`;
  }
  ts += "];\n\n";

  ts += `export const ${prefix}Sentences: Sentence[] = [\n`;
  for (const s of sentences) {
    ts += `  ${JSON.stringify(s)},\n`;
  }
  ts += "];\n\n";

  ts += `export const ${prefix}Overrides: Record<string, Record<string, [string, string, string]>> = {};\n`;

  fs.writeFileSync(outPath, ts, "utf8");
  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(
    `  ${filename}: ${chapters.length} chapters, ${sentences.length} sentences, ${size}KB`
  );
}

// ============================================================
// Ruler mapping for Xuân Thu commentaries
// ============================================================
const rulerHanViet = {
  隱公: "Ẩn Công",
  桓公: "Hoàn Công",
  莊公: "Trang Công",
  閔公: "Mẫn Công",
  僖公: "Hi Công",
  文公: "Văn Công",
  宣公: "Tuyên Công",
  成公: "Thành Công",
  襄公: "Tương Công",
  昭公: "Chiêu Công",
  定公: "Định Công",
  哀公: "Ai Công",
};

const numHanViet = {
  元年: "Nguyên niên",
  二年: "Nhị niên",
  三年: "Tam niên",
  四年: "Tứ niên",
  五年: "Ngũ niên",
  六年: "Lục niên",
  七年: "Thất niên",
  八年: "Bát niên",
  九年: "Cửu niên",
  十年: "Thập niên",
  十一年: "Thập nhất niên",
  十二年: "Thập nhị niên",
  十三年: "Thập tam niên",
  十四年: "Thập tứ niên",
  十五年: "Thập ngũ niên",
  十六年: "Thập lục niên",
  十七年: "Thập thất niên",
  十八年: "Thập bát niên",
  十九年: "Thập cửu niên",
  二十年: "Nhị thập niên",
  二十一年: "Nhị thập nhất niên",
  二十二年: "Nhị thập nhị niên",
  二十三年: "Nhị thập tam niên",
  二十四年: "Nhị thập tứ niên",
  二十五年: "Nhị thập ngũ niên",
  二十六年: "Nhị thập lục niên",
  二十七年: "Nhị thập thất niên",
  二十八年: "Nhị thập bát niên",
  二十九年: "Nhị thập cửu niên",
  三十年: "Tam thập niên",
  三十一年: "Tam thập nhất niên",
  三十二年: "Tam thập nhị niên",
  三十三年: "Tam thập tam niên",
};

function convertXuanThuCommentary(config) {
  const { jsonFile, workId, prefix, bookName, filename } = config;
  console.log(`\nConverting ${bookName}...`);
  const data = parseJSONL(path.join(__dirname, jsonFile));

  const chapters = [];
  const sentences = [];
  let totalChars = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const rawTitle = entry["章节"];
    // Extract ruler and year from title like "公羊傳 隱公元年"
    const titleMatch = rawTitle.match(
      /\S+\s+(.{1,3}公)(.*年)/
    );
    const ruler = titleMatch ? titleMatch[1] : rawTitle;
    const year = titleMatch ? titleMatch[2] : "";
    const titleHan = ruler + year;
    const rulerViet = rulerHanViet[ruler] || ruler;
    const yearViet = numHanViet[year] || year;
    const titleViet = rulerViet + " " + yearViet;

    const chId = `ch_${workId}_${i + 1}`;
    chapters.push({
      id: chId,
      workId,
      titleViet: titleViet.trim(),
      titleHan,
      chapterNumber: i + 1,
      sectionLabel: rulerViet,
      sortOrder: i + 1,
    });

    const paras = splitParagraphs(entry["正文"]);
    // Filter out repeated title paragraph and empty content
    const filtered = paras.filter((p) => {
      const clean = p.replace(/\s+/g, "");
      if (clean === bookName + "　" + titleHan) return false;
      if (clean === bookName + titleHan) return false;
      if (clean.length < 2) return false;
      return true;
    });

    for (let j = 0; j < filtered.length; j++) {
      const text = filtered[j];
      totalChars += countCJK(text);
      const simpText = toSimp(text);
      sentences.push({
        id: `s_${workId}_${i + 1}_${j + 1}`,
        chapterId: chId,
        textTraditional: text,
        sentenceOrder: j + 1,
      });
    }
  }

  writeBookFile({
    filename,
    prefix,
    workId,
    chapters,
    sentences,
    overrides: {},
  });
  console.log(`  Total CJK chars: ${totalChars}`);
  return { chapterCount: chapters.length, charCount: totalChars };
}

// ============================================================
// Thượng Thư (尚書) conversion
// ============================================================
function convertThuongThu() {
  console.log("\nConverting Thượng Thư (尚書)...");
  const data = parseJSONL(path.join(__dirname, "thuong-thu.json"));
  const workId = "work_tt";

  // Hán Việt chapter name mapping
  const chapterHanViet = {
    尚书序: "Thượng Thư Tự",
    尧典: "Nghiêu Điển",
    舜典: "Thuấn Điển",
    大禹谟: "Đại Vũ Mô",
    皋陶谟: "Cao Dao Mô",
    益稷: "Ích Tắc",
    禹贡: "Vũ Cống",
    甘誓: "Cam Thệ",
    五子之歌: "Ngũ Tử Chi Ca",
    胤征: "Dận Chinh",
    汤誓: "Thang Thệ",
    仲虺之诰: "Trọng Hủy Chi Cáo",
    汤诰: "Thang Cáo",
    伊训: "Y Huấn",
    太甲上: "Thái Giáp Thượng",
    太甲中: "Thái Giáp Trung",
    太甲下: "Thái Giáp Hạ",
    咸有一德: "Hàm Hữu Nhất Đức",
    盘庚上: "Bàn Canh Thượng",
    盘庚中: "Bàn Canh Trung",
    盘庚下: "Bàn Canh Hạ",
    说命上: "Duyệt Mệnh Thượng",
    说命中: "Duyệt Mệnh Trung",
    说命下: "Duyệt Mệnh Hạ",
    高宗肜日: "Cao Tông Dung Nhật",
    西伯戡黎: "Tây Bá Kham Lê",
    微子: "Vi Tử",
    泰誓上: "Thái Thệ Thượng",
    泰誓中: "Thái Thệ Trung",
    泰誓下: "Thái Thệ Hạ",
    牧誓: "Mục Thệ",
    武成: "Vũ Thành",
    洪范: "Hồng Phạm",
    旅獒: "Lữ Ngao",
    金縢: "Kim Đằng",
    大诰: "Đại Cáo",
    微子之命: "Vi Tử Chi Mệnh",
    康诰: "Khang Cáo",
    酒诰: "Tửu Cáo",
    梓材: "Tử Tài",
    召诰: "Thiệu Cáo",
    洛诰: "Lạc Cáo",
    多士: "Đa Sĩ",
    无逸: "Vô Dật",
    君奭: "Quân Thích",
    蔡仲之命: "Thái Trọng Chi Mệnh",
    多方: "Đa Phương",
    立政: "Lập Chính",
    周官: "Chu Quan",
    君陈: "Quân Trần",
    顾命: "Cố Mệnh",
    康王之诰: "Khang Vương Chi Cáo",
    衰毕命: "Tất Mệnh",
    君牙: "Quân Nha",
    冏命: "Quýnh Mệnh",
    吕刑: "Lữ Hình",
    文侯之命: "Văn Hầu Chi Mệnh",
    费誓: "Phí Thệ",
    秦誓: "Tần Thệ",
  };

  // Volume to section mapping
  const volSection = {};
  const volNames = [
    "", "卷一", "卷二", "卷三", "卷四", "卷五",
    "卷六", "卷七", "卷八", "卷九", "卷十",
    "卷十一", "卷十二", "卷十三", "卷十四", "卷十五",
    "卷十六", "卷十七", "卷十八", "卷十九", "卷二十",
  ];
  const volHanViet = [
    "", "Quyển nhất", "Quyển nhị", "Quyển tam", "Quyển tứ", "Quyển ngũ",
    "Quyển lục", "Quyển thất", "Quyển bát", "Quyển cửu", "Quyển thập",
    "Quyển thập nhất", "Quyển thập nhị", "Quyển thập tam", "Quyển thập tứ", "Quyển thập ngũ",
    "Quyển thập lục", "Quyển thập thất", "Quyển thập bát", "Quyển thập cửu", "Quyển nhị thập",
  ];

  const chapters = [];
  const sentences = [];
  let totalChars = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const rawTitle = entry["章节"]; // e.g. "卷二 尧典第一"
    // Parse volume and chapter name
    const volMatch = rawTitle.match(/^(卷[一二三四五六七八九十]+)\s+(.+)$/);
    const vol = volMatch ? volMatch[1] : "";
    const chapName = volMatch ? volMatch[2] : rawTitle;
    // Remove 第X numbering from chapName (e.g. "尧典第一" -> "尧典")
    const cleanName = chapName.replace(/第.+$/, "");
    const titleHan = toTrad(cleanName);
    const titleViet = chapterHanViet[cleanName] || cleanName;
    const volIdx = volNames.indexOf(vol);
    const section = volIdx > 0 ? volHanViet[volIdx] : "";

    const chId = `ch_${workId}_${i + 1}`;
    chapters.push({
      id: chId,
      workId,
      titleViet,
      titleHan,
      chapterNumber: i + 1,
      sectionLabel: section,
      sortOrder: i + 1,
    });

    const paras = splitParagraphs(entry["正文"]);
    for (let j = 0; j < paras.length; j++) {
      let text = paras[j];
      const tradText = toTrad(text);
      totalChars += countCJK(tradText);

      sentences.push({
        id: `s_${workId}_${i + 1}_${j + 1}`,
        chapterId: chId,
        textTraditional: tradText,
        sentenceOrder: j + 1,
      });
    }
  }

  writeBookFile({
    filename: "thuong-thu.ts",
    prefix: "tt",
    workId,
    chapters,
    sentences,
    overrides: {},
  });
  console.log(`  Total CJK chars: ${totalChars}`);
  return { chapterCount: chapters.length, charCount: totalChars };
}

// ============================================================
// Main
// ============================================================
console.log("=== Converting Classical Chinese Texts ===");

const ttStats = convertThuongThu();

const cdtStats = convertXuanThuCommentary({
  jsonFile: "cong-duong-truyen.json",
  workId: "work_cdt",
  prefix: "cdt",
  bookName: "公羊傳",
  filename: "cong-duong-truyen.ts",
});

const ttrStats = convertXuanThuCommentary({
  jsonFile: "ta-truyen.json",
  workId: "work_ttr",
  prefix: "ttr",
  bookName: "左傳",
  filename: "ta-truyen.ts",
});

const cltStats = convertXuanThuCommentary({
  jsonFile: "coc-luong-truyen.json",
  workId: "work_clt",
  prefix: "clt",
  bookName: "穀梁傳",
  filename: "coc-luong-truyen.ts",
});

console.log("\n=== Summary ===");
console.log(`Thượng Thư:         ${ttStats.chapterCount} chapters, ${ttStats.charCount} chars`);
console.log(`Công Dương Truyện:  ${cdtStats.chapterCount} chapters, ${cdtStats.charCount} chars`);
console.log(`Tả Truyện:          ${ttrStats.chapterCount} chapters, ${ttrStats.charCount} chars`);
console.log(`Cốc Lương Truyện:   ${cltStats.chapterCount} chapters, ${cltStats.charCount} chars`);
