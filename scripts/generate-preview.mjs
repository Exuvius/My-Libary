import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseJSONL(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l));
}

function splitParagraphs(text) {
  return text.split("\x5Cn").map(s => s.trim()).filter(s => s && s !== "\x00" && s.length > 1);
}

// Load simp-trad map
const dataDir = path.join(__dirname, "..", "src", "data");
const simpTradRaw = fs.readFileSync(path.join(dataDir, "simp-trad.ts"), "utf8");
const simpTradMap = {};
const stMatch = simpTradRaw.match(/simpToTrad[^{]*(\{[^;]+\})/);
if (stMatch) {
  const obj = JSON.parse(stMatch[1]);
  for (const [s, t] of Object.entries(obj)) simpTradMap[s] = t;
}
function toTrad(text) {
  return [...text].map(c => simpTradMap[c] || c).join("");
}

// Books config
const books = [
  {
    id: "work_tt", title: "Thượng Thư Chính Nghĩa", titleHan: "尚書正義",
    icon: "書", author: "Khổng Tử (biên tập)",
    file: "thuong-thu.json", convert: "thuongthu",
  },
  {
    id: "work_cdt", title: "Xuân Thu Công Dương Truyện", titleHan: "春秋公羊傳",
    icon: "公", author: "Công Dương Cao",
    file: "cong-duong-truyen.json", convert: "xuanthu", bookName: "公羊傳",
  },
  {
    id: "work_ttr", title: "Xuân Thu Tả Truyện", titleHan: "春秋左傳",
    icon: "左", author: "Tả Khâu Minh",
    file: "ta-truyen.json", convert: "xuanthu", bookName: "左傳",
  },
  {
    id: "work_clt", title: "Xuân Thu Cốc Lương Truyện", titleHan: "春秋穀梁傳",
    icon: "穀", author: "Cốc Lương Xích",
    file: "coc-luong-truyen.json", convert: "xuanthu", bookName: "穀梁傳",
  },
];

const rulerHanViet = {
  "隱公": "Ẩn Công", "桓公": "Hoàn Công", "莊公": "Trang Công",
  "閔公": "Mẫn Công", "僖公": "Hi Công", "文公": "Văn Công",
  "宣公": "Tuyên Công", "成公": "Thành Công", "襄公": "Tương Công",
  "昭公": "Chiêu Công", "定公": "Định Công", "哀公": "Ai Công",
};
const numHanViet = {
  "元年":"Nguyên niên","二年":"Nhị niên","三年":"Tam niên","四年":"Tứ niên",
  "五年":"Ngũ niên","六年":"Lục niên","七年":"Thất niên","八年":"Bát niên",
  "九年":"Cửu niên","十年":"Thập niên",
};

const allBooks = [];

for (const book of books) {
  const filePath = path.join(__dirname, book.file);
  if (!fs.existsSync(filePath)) { console.log(`Skip ${book.file} - not found`); continue; }
  const data = parseJSONL(filePath);
  const chapters = [];

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const rawTitle = entry["章节"];
    let titleHan, titleViet, section;

    if (book.convert === "xuanthu") {
      const m = rawTitle.match(/\S+\s+(.{1,3}公)(.*年)/);
      const ruler = m ? m[1] : rawTitle;
      const year = m ? m[2] : "";
      titleHan = ruler + year;
      titleViet = (rulerHanViet[ruler] || ruler) + " " + (numHanViet[year] || year);
      section = rulerHanViet[ruler] || ruler;
    } else {
      const vm = rawTitle.match(/^(卷[一二三四五六七八九十]+)\s+(.+)$/);
      const cleanName = vm ? vm[2].replace(/第.+$/, "") : rawTitle;
      titleHan = toTrad(cleanName);
      titleViet = cleanName;
      section = vm ? vm[1] : "";
    }

    const paras = splitParagraphs(entry["正文"]);
    const filtered = paras.filter(p => {
      const clean = p.replace(/\s+/g, "");
      if (book.bookName && (clean === book.bookName + "　" + titleHan || clean === book.bookName + titleHan)) return false;
      return clean.length >= 2;
    });

    const sentences = filtered.map(text => book.convert === "thuongthu" ? toTrad(text) : text);

    chapters.push({
      num: i + 1, titleHan, titleViet: titleViet.trim(), section,
      sentences: sentences.slice(0, 20), // first 20 paragraphs for preview
      totalSentences: sentences.length,
    });
  }

  allBooks.push({ ...book, chapters, totalChapters: chapters.length });
}

// Count stats
for (const b of allBooks) {
  let chars = 0;
  for (const ch of b.chapters) for (const s of ch.sentences) {
    for (const c of s) { const code = c.charCodeAt(0); if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)) chars++; }
  }
  b.totalChars = chars;
}

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hán Điển - Preview 4 sách mới</title>
<style>
  :root { --bg: #faf8f5; --bg2: #fff; --text: #2c2a27; --muted: #6b6560; --accent: #8b6914; --border: #e8e4df; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1a1918; --bg2: #242220; --text: #e8e4df; --muted: #9b9590; --accent: #d4a843; --border: #3a3835; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); max-width: 800px; margin: 0 auto; padding: 16px; }
  h1 { font-size: 24px; text-align: center; margin: 20px 0; }
  .subtitle { text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 30px; }
  .book-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px; cursor: pointer; transition: box-shadow .2s; }
  .book-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
  .book-icon { font-size: 48px; text-align: center; font-family: "KaiTi", "STKaiti", serif; }
  .book-title { font-size: 18px; font-weight: bold; text-align: center; margin-top: 8px; }
  .book-han { text-align: center; color: var(--muted); font-size: 14px; margin-top: 4px; }
  .book-stats { text-align: center; color: var(--muted); font-size: 12px; margin-top: 6px; }
  .book-author { text-align: center; font-size: 13px; color: var(--muted); margin-top: 4px; }
  .chapter-list { display: none; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px; }
  .chapter-list.open { display: block; }
  .section-label { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; margin-bottom: 4px; }
  .chapter-item { padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; gap: 8px; align-items: center; }
  .chapter-item:hover { background: var(--bg); }
  .ch-num { color: var(--muted); font-size: 12px; min-width: 28px; text-align: right; }
  .ch-title { font-family: "Noto Serif SC", "SimSun", serif; }
  .reading-view { display: none; }
  .reading-view.open { display: block; }
  .back-btn { color: var(--accent); cursor: pointer; font-size: 14px; margin-bottom: 16px; display: inline-block; }
  .back-btn:hover { text-decoration: underline; }
  .reading-header { text-align: center; margin-bottom: 24px; }
  .reading-header .label { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; }
  .reading-header h2 { font-size: 20px; margin-top: 8px; font-family: "Noto Serif SC", "SimSun", serif; }
  .sentence { font-family: "Noto Serif SC", "KaiTi", "SimSun", serif; font-size: 18px; line-height: 2; margin-bottom: 12px; letter-spacing: 1px; }
  .more-note { color: var(--muted); font-size: 13px; font-style: italic; text-align: center; margin-top: 20px; }
  .nav-row { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
  .nav-btn { color: var(--accent); cursor: pointer; font-size: 13px; }
  .nav-btn:hover { text-decoration: underline; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
</style>
</head>
<body>
<h1>漢 典</h1>
<p class="subtitle">Preview — 4 sách cổ điển mới thêm vào thư viện</p>
<div id="library" class="grid"></div>
<div id="reading" class="reading-view"></div>
<script>
const DATA = ${JSON.stringify(allBooks)};

const libraryEl = document.getElementById("library");
const readingEl = document.getElementById("reading");
let openBookIdx = -1;

function renderLibrary() {
  readingEl.classList.remove("open");
  readingEl.innerHTML = "";
  libraryEl.style.display = "";
  libraryEl.innerHTML = DATA.map((b, bi) => \`
    <div class="book-card" onclick="toggleBook(\${bi})">
      <div class="book-icon">\${b.icon}</div>
      <div class="book-title">\${b.title}</div>
      <div class="book-han">\${b.titleHan}</div>
      <div class="book-author">\${b.author}</div>
      <div class="book-stats">\${b.totalChapters} chương · \${b.totalChars > 10000 ? Math.round(b.totalChars/1000)+"k" : b.totalChars} chữ</div>
      <div class="chapter-list" id="cl-\${bi}">
        \${renderChapterList(b, bi)}
      </div>
    </div>
  \`).join("");
}

function renderChapterList(book, bi) {
  let html = "";
  let lastSection = "";
  for (let i = 0; i < book.chapters.length; i++) {
    const ch = book.chapters[i];
    if (ch.section && ch.section !== lastSection) {
      html += \`<div class="section-label">\${ch.section}</div>\`;
      lastSection = ch.section;
    }
    html += \`<div class="chapter-item" onclick="event.stopPropagation(); openChapter(\${bi}, \${i})">
      <span class="ch-num">\${ch.num}</span>
      <span class="ch-title">\${ch.titleHan}</span>
      <span style="color:var(--muted);font-size:12px">— \${ch.titleViet}</span>
    </div>\`;
  }
  return html;
}

function toggleBook(bi) {
  const el = document.getElementById("cl-" + bi);
  if (openBookIdx === bi) { el.classList.remove("open"); openBookIdx = -1; return; }
  document.querySelectorAll(".chapter-list").forEach(e => e.classList.remove("open"));
  el.classList.add("open");
  openBookIdx = bi;
}

function openChapter(bi, ci) {
  const book = DATA[bi];
  const ch = book.chapters[ci];
  libraryEl.style.display = "none";
  readingEl.classList.add("open");

  let nav = '<div class="nav-row">';
  if (ci > 0) nav += \`<span class="nav-btn" onclick="openChapter(\${bi},\${ci-1})">‹ Trước</span>\`;
  else nav += "<span></span>";
  nav += \`<span style="color:var(--muted);font-size:12px">Thiên \${ch.num} / \${book.totalChapters}</span>\`;
  if (ci < book.chapters.length - 1) nav += \`<span class="nav-btn" onclick="openChapter(\${bi},\${ci+1})">Sau ›</span>\`;
  else nav += "<span></span>";
  nav += "</div>";

  readingEl.innerHTML = \`
    <span class="back-btn" onclick="renderLibrary()">‹ Quay lại \${book.title}</span>
    <div class="reading-header">
      <div class="label">THIÊN \${ch.num}</div>
      <h2>\${ch.titleHan}</h2>
      <div style="color:var(--muted);font-size:13px;margin-top:4px">\${ch.titleViet}</div>
    </div>
    \${ch.sentences.map(s => \`<div class="sentence">\${s}</div>\`).join("")}
    \${ch.totalSentences > 20 ? \`<div class="more-note">… còn \${ch.totalSentences - 20} đoạn nữa (preview giới hạn 20 đoạn/chương)</div>\` : ""}
    \${nav}
  \`;
  window.scrollTo(0, 0);
}

renderLibrary();
</script>
</body>
</html>`;

const outPath = path.join(__dirname, "..", "preview.html");
fs.writeFileSync(outPath, html, "utf8");
const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
console.log(`Generated preview.html (${sizeKB}KB)`);
console.log(`Open in browser: ${outPath}`);
