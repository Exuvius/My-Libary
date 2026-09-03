import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");
const srcDir = process.argv[2] || path.join("C:\\Users\\Exuvius\\AppData\\Local\\Temp\\chilit-dataset\\2.史\\1.正史类");

// Load simp-trad map
const simpTradRaw = fs.readFileSync(path.join(dataDir, "simp-trad.ts"), "utf8");
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
  return [...text].map(c => simpTradMap[c] || c).join("");
}

// Chinese numeral parser
function parseChineseNum(s) {
  const d = { 零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,〇:0 };
  const m = { 十:10, 百:100, 千:1000 };
  let result = 0, current = 0;
  for (const c of s) {
    if (d[c] !== undefined) { current = d[c]; }
    else if (m[c]) {
      if (current === 0 && c === "十") current = 1;
      result += current * m[c]; current = 0;
    }
  }
  return result + current;
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
  return raw.split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l));
}

function splitParagraphs(text) {
  return text.split(/\s*\\n\s*/).map(s => s.trim()).filter(s => s && s !== "\x00" && s.length > 1);
}

function writeBookFile(config) {
  const { filename, prefix, workId, chapters, sentences } = config;
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
  console.log(`  ${filename}: ${chapters.length} ch, ${sentences.length} sent, ${size}KB`);
}

// ============================================================
// Configuration: all 26 official histories
// ============================================================
const HISTORIES = [
  {
    file: "史記（漢）司馬遷著.json",
    workId: "work_su_ky", prefix: "suKy", tsFile: "su-ky.ts",
    titleViet: "Sử Ký", titleHan: "史記", iconChar: "史",
    authorId: "auth_tu_ma_thien", authorViet: "Tư Mã Thiên", authorHan: "司馬遷",
    authorEra: "145–86 TCN", authorDynasty: "Tây Hán",
    authorBio: "Sử gia vĩ đại, tác giả bộ thông sử đầu tiên theo thể kỷ truyện",
    needsConvert: false, bookPrefix: "史記",
  },
  {
    file: "漢書（東漢）班固編撰（唐）顏師古注.json",
    workId: "work_han_thu", prefix: "hanThu", tsFile: "han-thu.ts",
    titleViet: "Hán Thư", titleHan: "漢書", iconChar: "漢",
    authorId: "auth_ban_co", authorViet: "Ban Cố", authorHan: "班固",
    authorEra: "32–92", authorDynasty: "Đông Hán",
    authorBio: "Sử gia, biên soạn bộ đoạn đại sử đầu tiên về nhà Tây Hán",
    needsConvert: false, bookPrefix: "漢書",
  },
  {
    file: "後漢書（南朝宋）範燁編繏（唐）李賢等注.json",
    workId: "work_hau_han", prefix: "hauHan", tsFile: "hau-han-thu.ts",
    titleViet: "Hậu Hán Thư", titleHan: "後漢書", iconChar: "後",
    authorId: "auth_pham_diep", authorViet: "Phạm Diệp", authorHan: "範燁",
    authorEra: "398–445", authorDynasty: "Nam Triều Tống",
    authorBio: "Sử gia, biên soạn lịch sử nhà Đông Hán",
    needsConvert: false, bookPrefix: "後漢書",
  },
  {
    file: "三國志（晉）陳壽編繏（南朝宋）裴松之注.json",
    workId: "work_tam_quoc", prefix: "tamQuoc", tsFile: "tam-quoc-chi.ts",
    titleViet: "Tam Quốc Chí", titleHan: "三國志", iconChar: "國",
    authorId: "auth_tran_tho", authorViet: "Trần Thọ", authorHan: "陳壽",
    authorEra: "233–297", authorDynasty: "Tây Tấn",
    authorBio: "Sử gia, biên soạn lịch sử thời Tam Quốc",
    needsConvert: false, bookPrefix: "三國志",
  },
  {
    file: "晉書（唐）房玄龄等撰.json",
    workId: "work_tan_thu", prefix: "tanThu", tsFile: "tan-thu.ts",
    titleViet: "Tấn Thư", titleHan: "晉書", iconChar: "晉",
    authorId: "auth_phong_huyen_linh", authorViet: "Phòng Huyền Linh", authorHan: "房玄齡",
    authorEra: "579–648", authorDynasty: "Đường",
    authorBio: "Tể tướng nhà Đường, chủ biên bộ sử về hai triều Tấn",
    needsConvert: false, bookPrefix: "晉書",
  },
  {
    file: "宋書（梁）沈約撰.json",
    workId: "work_tong_thu", prefix: "tongThu", tsFile: "tong-thu.ts",
    titleViet: "Tống Thư", titleHan: "宋書", iconChar: "宋",
    authorId: "auth_tham_uoc", authorViet: "Thẩm Ước", authorHan: "沈約",
    authorEra: "441–513", authorDynasty: "Lương",
    authorBio: "Văn học gia, sử gia triều Lương, biên soạn sử nhà Lưu Tống",
    needsConvert: false, bookPrefix: "宋書",
  },
  {
    file: "南齊書（梁）蕭子顯撰.json",
    workId: "work_nam_te", prefix: "namTe", tsFile: "nam-te-thu.ts",
    titleViet: "Nam Tề Thư", titleHan: "南齊書", iconChar: "齊",
    authorId: "auth_tieu_tu_hien", authorViet: "Tiêu Tử Hiển", authorHan: "蕭子顯",
    authorEra: "489–537", authorDynasty: "Lương",
    authorBio: "Hoàng thân nhà Lương, biên soạn sử nhà Nam Tề",
    needsConvert: false, bookPrefix: "南齊書",
  },
  {
    file: "梁書（唐）姚思廉撰.json",
    workId: "work_luong_thu", prefix: "luongThu", tsFile: "luong-thu.ts",
    titleViet: "Lương Thư", titleHan: "梁書", iconChar: "梁",
    authorId: "auth_dieu_tu_liem", authorViet: "Diêu Tư Liêm", authorHan: "姚思廉",
    authorEra: "557–637", authorDynasty: "Đường",
    authorBio: "Sử gia triều Đường, biên soạn sử hai nhà Lương và Trần",
    needsConvert: false, bookPrefix: "梁書",
  },
  {
    file: "陳書（唐）姚思廉撰.json",
    workId: "work_tran_thu", prefix: "tranThu", tsFile: "tran-thu.ts",
    titleViet: "Trần Thư", titleHan: "陳書", iconChar: "陳",
    authorId: "auth_dieu_tu_liem", authorViet: "Diêu Tư Liêm", authorHan: "姚思廉",
    authorEra: "557–637", authorDynasty: "Đường",
    authorBio: "Sử gia triều Đường, biên soạn sử hai nhà Lương và Trần",
    needsConvert: false, bookPrefix: "陳書",
  },
  {
    file: "魏書（北齊）魏收撰.json",
    workId: "work_nguy_thu", prefix: "nguyThu", tsFile: "nguy-thu.ts",
    titleViet: "Ngụy Thư", titleHan: "魏書", iconChar: "魏",
    authorId: "auth_nguy_thu", authorViet: "Ngụy Thu", authorHan: "魏收",
    authorEra: "507–572", authorDynasty: "Bắc Tề",
    authorBio: "Sử gia triều Bắc Tề, biên soạn sử nhà Bắc Ngụy",
    needsConvert: false, bookPrefix: "魏書",
  },
  {
    file: "北齊書（唐）李百藥撰.json",
    workId: "work_bac_te", prefix: "bacTe", tsFile: "bac-te-thu.ts",
    titleViet: "Bắc Tề Thư", titleHan: "北齊書", iconChar: "北",
    authorId: "auth_ly_bach_duoc", authorViet: "Lý Bách Dược", authorHan: "李百藥",
    authorEra: "565–648", authorDynasty: "Đường",
    authorBio: "Sử gia triều Đường, biên soạn sử nhà Bắc Tề",
    needsConvert: false, bookPrefix: "北齊書",
  },
  {
    file: "周書（唐）令狐德棻撰.json",
    workId: "work_chu_thu", prefix: "chuThu", tsFile: "chu-thu.ts",
    titleViet: "Chu Thư", titleHan: "周書", iconChar: "周",
    authorId: "auth_linh_ho_duc_phan", authorViet: "Linh Hồ Đức Phần", authorHan: "令狐德棻",
    authorEra: "583–666", authorDynasty: "Đường",
    authorBio: "Sử gia triều Đường, chủ biên sử nhà Bắc Chu",
    needsConvert: false, bookPrefix: "周書",
  },
  {
    file: "隋書（唐）魏徵等編.json",
    workId: "work_tuy_thu", prefix: "tuyThu", tsFile: "tuy-thu.ts",
    titleViet: "Tùy Thư", titleHan: "隋書", iconChar: "隋",
    authorId: "auth_nguy_trung", authorViet: "Ngụy Trưng", authorHan: "魏徵",
    authorEra: "580–643", authorDynasty: "Đường",
    authorBio: "Danh thần triều Đường, chủ biên sử nhà Tùy",
    needsConvert: false, bookPrefix: "隋書",
  },
  {
    file: "南史（唐）李延壽撰.json",
    workId: "work_nam_su", prefix: "namSu", tsFile: "nam-su.ts",
    titleViet: "Nam Sử", titleHan: "南史", iconChar: "南",
    authorId: "auth_ly_dien_tho", authorViet: "Lý Diên Thọ", authorHan: "李延壽",
    authorEra: "?–?", authorDynasty: "Đường",
    authorBio: "Sử gia triều Đường, biên soạn sử bốn triều đại phương Nam",
    needsConvert: false, bookPrefix: "南史",
  },
  {
    file: "北史（唐）李延壽撰.json",
    workId: "work_bac_su", prefix: "bacSu", tsFile: "bac-su.ts",
    titleViet: "Bắc Sử", titleHan: "北史", iconChar: "北",
    authorId: "auth_ly_dien_tho",
    needsConvert: false, bookPrefix: "北史",
  },
  {
    file: "舊唐書（後晉）劉昫等編.json",
    workId: "work_cuu_duong", prefix: "cuuDuong", tsFile: "cuu-duong-thu.ts",
    titleViet: "Cựu Đường Thư", titleHan: "舊唐書", iconChar: "唐",
    authorId: "auth_luu_hu", authorViet: "Lưu Hú", authorHan: "劉昫",
    authorEra: "888–947", authorDynasty: "Hậu Tấn",
    authorBio: "Tể tướng Hậu Tấn, chủ biên bộ sử đầu tiên về nhà Đường",
    needsConvert: false, bookPrefix: "舊唐書",
  },
  {
    file: "新唐書（北宋）歐陽修等合撰.json",
    workId: "work_tan_duong", prefix: "tanDuong", tsFile: "tan-duong-thu.ts",
    titleViet: "Tân Đường Thư", titleHan: "新唐書", iconChar: "新",
    authorId: "auth_au_duong_tu", authorViet: "Âu Dương Tu", authorHan: "歐陽修",
    authorEra: "1007–1072", authorDynasty: "Bắc Tống",
    authorBio: "Văn hào Bắc Tống, một trong Đường Tống Bát Đại Gia",
    needsConvert: false, bookPrefix: "新唐書",
  },
  {
    file: "舊五代史（北宋）薛居正等撰.json",
    workId: "work_cuu_ngu_dai", prefix: "cuuNguDai", tsFile: "cuu-ngu-dai-su.ts",
    titleViet: "Cựu Ngũ Đại Sử", titleHan: "舊五代史", iconChar: "五",
    authorId: "auth_tiet_cu_chinh", authorViet: "Tiết Cư Chính", authorHan: "薛居正",
    authorEra: "912–981", authorDynasty: "Bắc Tống",
    authorBio: "Tể tướng Bắc Tống, chủ biên sử Ngũ Đại",
    needsConvert: false, bookPrefix: "舊五代史",
  },
  {
    file: "新五代史（北宋）歐陽修撰.json",
    workId: "work_tan_ngu_dai", prefix: "tanNguDai", tsFile: "tan-ngu-dai-su.ts",
    titleViet: "Tân Ngũ Đại Sử", titleHan: "新五代史", iconChar: "代",
    authorId: "auth_au_duong_tu",
    needsConvert: false, bookPrefix: "新五代史",
  },
  {
    file: "宋史（元）脫脫等撰.json",
    workId: "work_tong_su", prefix: "tongSu", tsFile: "tong-su.ts",
    titleViet: "Tống Sử", titleHan: "宋史", iconChar: "宋",
    authorId: "auth_thoat_thoat", authorViet: "Thoát Thoát", authorHan: "脫脫",
    authorEra: "1314–1356", authorDynasty: "Nguyên",
    authorBio: "Tể tướng nhà Nguyên, chủ biên Tống Sử, Liêu Sử, Kim Sử",
    needsConvert: false, bookPrefix: "宋史",
  },
  {
    file: "遼史（元）脫脫等撰.json",
    workId: "work_lieu_su", prefix: "lieuSu", tsFile: "lieu-su.ts",
    titleViet: "Liêu Sử", titleHan: "遼史", iconChar: "遼",
    authorId: "auth_thoat_thoat",
    needsConvert: false, bookPrefix: "遼史",
  },
  {
    file: "金史（元）脫脫等撰.json",
    workId: "work_kim_su", prefix: "kimSu", tsFile: "kim-su.ts",
    titleViet: "Kim Sử", titleHan: "金史", iconChar: "金",
    authorId: "auth_thoat_thoat",
    needsConvert: false, bookPrefix: "金史",
  },
  {
    file: "元史（明）宋濂等撰.json",
    workId: "work_nguyen_su", prefix: "nguyenSu", tsFile: "nguyen-su.ts",
    titleViet: "Nguyên Sử", titleHan: "元史", iconChar: "元",
    authorId: "auth_tong_liem", authorViet: "Tống Liêm", authorHan: "宋濂",
    authorEra: "1310–1381", authorDynasty: "Minh",
    authorBio: "Khai quốc văn thần nhà Minh, chủ biên Nguyên Sử",
    needsConvert: true, bookPrefix: "元史",
  },
  {
    file: "明史（清）張廷玉等撰.json",
    workId: "work_minh_su", prefix: "minhSu", tsFile: "minh-su.ts",
    titleViet: "Minh Sử", titleHan: "明史", iconChar: "明",
    authorId: "auth_truong_dinh_ngoc", authorViet: "Trương Đình Ngọc", authorHan: "張廷玉",
    authorEra: "1672–1755", authorDynasty: "Thanh",
    authorBio: "Đại thần nhà Thanh, chủ biên Minh Sử trong gần 100 năm",
    needsConvert: false, bookPrefix: "明史",
  },
  {
    file: "清史稿.json",
    workId: "work_thanh_su", prefix: "thanhSu", tsFile: "thanh-su-cao.ts",
    titleViet: "Thanh Sử Cảo", titleHan: "清史稿", iconChar: "清",
    authorId: "auth_trieu_nhi_ton", authorViet: "Triệu Nhĩ Tốn", authorHan: "趙爾巽",
    authorEra: "1844–1927", authorDynasty: "Dân Quốc",
    authorBio: "Chính trị gia, chủ biên bản thảo sử nhà Thanh",
    needsConvert: true, bookPrefix: "清史稿",
  },
  {
    file: "新元史（民国）柯劭忞编撰.json",
    workId: "work_tan_nguyen", prefix: "tanNguyen", tsFile: "tan-nguyen-su.ts",
    titleViet: "Tân Nguyên Sử", titleHan: "新元史", iconChar: "新",
    authorId: "auth_kha_thieu_man", authorViet: "Kha Thiệu Mẫn", authorHan: "柯劭忞",
    authorEra: "1848–1933", authorDynasty: "Dân Quốc",
    authorBio: "Sử gia, biên soạn lại lịch sử nhà Nguyên",
    needsConvert: true, bookPrefix: "新元史",
  },
];

// ============================================================
// Generic history converter
// ============================================================
function convertHistory(cfg) {
  const filePath = path.join(srcDir, cfg.file);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: ${cfg.file} not found`);
    return null;
  }
  console.log(`\n[${cfg.titleViet}] ${cfg.titleHan} ...`);
  const data = parseJSONL(filePath);
  const chapters = [];
  const sentences = [];
  let totalChars = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const rawTitle = entry["章节"] || "";
    // Parse: "[BookName]卷NNN  SectionTitle" or just the raw title
    // Strip book prefix if present
    let stripped = rawTitle;
    if (cfg.bookPrefix && stripped.startsWith(cfg.bookPrefix)) {
      stripped = stripped.slice(cfg.bookPrefix.length);
    }
    stripped = stripped.trim();

    // Try to extract 卷 number and section title
    const volMatch = stripped.match(/^卷([一二三四五六七八九十百千零〇]+)\s*(.*)/);
    let titleHan, section;
    if (volMatch) {
      const volNum = parseChineseNum(volMatch[1]);
      const rest = volMatch[2].trim();
      titleHan = `卷${volMatch[1]}` + (rest ? `  ${rest}` : "");
      // Use the section part (e.g. "本紀第一", "志第一", "列傳第一") for grouping
      const secMatch = rest.match(/^(本紀|志|列傳|表|世家|書|載記|紀|傳)/);
      section = secMatch ? secMatch[1] : "";
    } else {
      titleHan = stripped || rawTitle;
      section = "";
    }

    if (cfg.needsConvert) titleHan = toTrad(titleHan);

    const chId = `ch_${cfg.workId}_${i + 1}`;
    chapters.push({
      id: chId,
      workId: cfg.workId,
      titleViet: "",
      titleHan,
      chapterNumber: i + 1,
      sectionLabel: section,
      sortOrder: i + 1,
    });

    const paras = splitParagraphs(entry["正文"] || "");
    // Filter: remove repeated title lines and very short lines
    const filtered = paras.filter(p => {
      const clean = p.replace(/\s+/g, "");
      if (clean.length < 2) return false;
      // Skip if it's just the book+volume title repeated
      if (clean === rawTitle.replace(/\s+/g, "")) return false;
      return true;
    });

    for (let j = 0; j < filtered.length; j++) {
      let text = filtered[j];
      if (cfg.needsConvert) text = toTrad(text);
      totalChars += countCJK(text);
      sentences.push({
        id: `s_${cfg.workId}_${i + 1}_${j + 1}`,
        chapterId: chId,
        textTraditional: text,
        sentenceOrder: j + 1,
      });
    }
  }

  writeBookFile({
    filename: cfg.tsFile,
    prefix: cfg.prefix,
    workId: cfg.workId,
    chapters,
    sentences,
  });
  console.log(`  CJK chars: ${totalChars.toLocaleString()}`);
  return { chapterCount: chapters.length, sentenceCount: sentences.length, charCount: totalChars };
}

// ============================================================
// Main
// ============================================================
console.log("=== Converting Official Histories (正史) ===");
console.log(`Source: ${srcDir}\n`);

const results = [];
for (const cfg of HISTORIES) {
  const r = convertHistory(cfg);
  if (r) results.push({ ...cfg, ...r });
}

// Print summary
console.log("\n=== Summary ===");
console.log(`${"Book".padEnd(22)} ${"Ch".padStart(5)} ${"Sent".padStart(7)} ${"Chars".padStart(10)}`);
console.log("-".repeat(50));
let totalCh = 0, totalSent = 0, totalChars = 0;
for (const r of results) {
  console.log(`${r.titleViet.padEnd(22)} ${String(r.chapterCount).padStart(5)} ${String(r.sentenceCount).padStart(7)} ${r.charCount.toLocaleString().padStart(10)}`);
  totalCh += r.chapterCount;
  totalSent += r.sentenceCount;
  totalChars += r.charCount;
}
console.log("-".repeat(50));
console.log(`${"TOTAL".padEnd(22)} ${String(totalCh).padStart(5)} ${String(totalSent).padStart(7)} ${totalChars.toLocaleString().padStart(10)}`);

// Generate additions for authors.ts
console.log("\n=== Author entries to add ===");
const seenAuthors = new Set();
for (const r of results) {
  if (!r.authorId || seenAuthors.has(r.authorId)) continue;
  if (!r.authorViet) continue;
  seenAuthors.add(r.authorId);
  console.log(`  { id: "${r.authorId}", nameViet: "${r.authorViet}", nameHan: "${r.authorHan || ""}", era: "${r.authorEra || ""}", dynasty: "${r.authorDynasty || ""}", bio: "${r.authorBio || ""}" },`);
}

// Generate additions for works.ts
console.log("\n=== Work entries to add ===");
for (const r of results) {
  console.log(`  // ${r.titleViet}`);
}

// Generate lazy-works.ts additions
console.log("\n=== lazy-works.ts imports ===");
for (const r of results) {
  console.log(`  ${r.workId}: () => import("./library/${r.tsFile.replace(".ts", "")}").then(m => ({ chapters: m.${r.prefix}Chapters, sentences: m.${r.prefix}Sentences, overrides: m.${r.prefix}Overrides })),`);
}

console.log("\nDone!");
