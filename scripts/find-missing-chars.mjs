import fs from "fs";
import path from "path";

const LIBRARY_DIR = "src/data/library";
const CHARS_FILE = "src/data/characters.ts";

const SCAN_FILES = [
  "su-ky.ts", "han-thu.ts", "hau-han-thu.ts", "tam-quoc-chi.ts",
  "tan-thu.ts", "tong-thu.ts", "nam-te-thu.ts", "luong-thu.ts",
  "tran-thu.ts", "nguy-thu.ts", "bac-te-thu.ts", "chu-thu.ts",
  "tuy-thu.ts", "nam-su.ts", "bac-su.ts", "cuu-duong-thu.ts",
  "tan-duong-thu.ts", "cuu-ngu-dai-su.ts", "tan-ngu-dai-su.ts",
  "tong-su.ts", "lieu-su.ts", "kim-su.ts", "nguyen-su.ts",
  "minh-su.ts", "thanh-su-cao.ts", "tan-nguyen-su.ts",
  "cong-duong-truyen.ts", "ta-truyen.ts", "coc-luong-truyen.ts",
  "thuong-thu.ts", "dich-kinh.ts",
];

function isCJK(code) {
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x20000 && code <= 0x2a6df) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

// 1. Extract existing dict chars via regex on the raw file
console.log("Loading existing dictionary...");
const charsSrc = fs.readFileSync(CHARS_FILE, "utf8");
const dictSet = new Set();
// Match "traditional":"X" patterns (X is 1 CJK char)
const tradRe = /\\?"traditional\\?":\\?"(.)\\?"/g;
let m;
while ((m = tradRe.exec(charsSrc)) !== null) {
  dictSet.add(m[1]);
}
// Also match "simplified":"X"
const simpRe = /\\?"simplified\\?":\\?"(.)\\?"/g;
while ((m = simpRe.exec(charsSrc)) !== null) {
  dictSet.add(m[1]);
}
console.log(`Dictionary covers ${dictSet.size} unique chars`);

// 2. Scan library files
console.log("\nScanning library files...");
const charFreq = new Map();

for (const file of SCAN_FILES) {
  const fpath = path.join(LIBRARY_DIR, file);
  if (!fs.existsSync(fpath)) {
    console.log(`  SKIP: ${file}`);
    continue;
  }
  const content = fs.readFileSync(fpath, "utf8");
  let count = 0;
  for (const ch of content) {
    const code = ch.codePointAt(0);
    if (isCJK(code)) {
      charFreq.set(ch, (charFreq.get(ch) || 0) + 1);
      count++;
    }
  }
  console.log(`  ${file}: ${count.toLocaleString()} CJK chars`);
}

const totalUnique = charFreq.size;
console.log(`\nTotal unique CJK chars in corpus: ${totalUnique}`);

// 3. Find missing
const missing = [];
for (const [ch, freq] of charFreq) {
  if (!dictSet.has(ch)) {
    missing.push({ char: ch, code: ch.codePointAt(0), freq });
  }
}
missing.sort((a, b) => b.freq - a.freq);

console.log(`Already in dictionary: ${totalUnique - missing.length}`);
console.log(`Missing from dictionary: ${missing.length}`);

console.log(`\nTop 100 missing by frequency:`);
for (const m of missing.slice(0, 100)) {
  console.log(`  ${m.char} (U+${m.code.toString(16).toUpperCase().padStart(4, "0")}) × ${m.freq.toLocaleString()}`);
}

// Frequency brackets
const f1000 = missing.filter(m => m.freq >= 1000).length;
const f500 = missing.filter(m => m.freq >= 500 && m.freq < 1000).length;
const f100 = missing.filter(m => m.freq >= 100 && m.freq < 500).length;
const f50 = missing.filter(m => m.freq >= 50 && m.freq < 100).length;
const f10 = missing.filter(m => m.freq >= 10 && m.freq < 50).length;
const f1 = missing.filter(m => m.freq < 10).length;
console.log(`\nFrequency distribution of missing chars:`);
console.log(`  ≥1000: ${f1000}`);
console.log(`  500-999: ${f500}`);
console.log(`  100-499: ${f100}`);
console.log(`  50-99: ${f50}`);
console.log(`  10-49: ${f10}`);
console.log(`  <10: ${f1}`);

// Save list
const outPath = "scripts/missing-chars.json";
fs.writeFileSync(outPath, JSON.stringify(missing.map(m => ({ char: m.char, code: m.code, freq: m.freq })), null, 2));
console.log(`\nSaved to ${outPath}`);
