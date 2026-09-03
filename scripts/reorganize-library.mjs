import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, "..", "src", "data", "library");
const dataDir = path.join(__dirname, "..", "src", "data");

// ── Classification map: filename → subdirectory ──

const kinh = [
  "dich-kinh.ts", "thuong-thu.ts", "luan-ngu.ts",
  "cong-duong-truyen.ts", "ta-truyen.ts", "coc-luong-truyen.ts",
  "nghi-le.ts", "chu-le.ts",
];

const su = [
  "su-ky.ts", "han-thu.ts", "hau-han-thu.ts", "tam-quoc-chi.ts",
  "tan-thu.ts", "tong-thu.ts", "nam-te-thu.ts", "luong-thu.ts",
  "tran-thu.ts", "nguy-thu.ts", "bac-te-thu.ts", "chu-thu.ts",
  "tuy-thu.ts", "nam-su.ts", "bac-su.ts", "cuu-duong-thu.ts",
  "tan-duong-thu.ts", "cuu-ngu-dai-su.ts", "tan-ngu-dai-su.ts",
  "tong-su.ts", "lieu-su.ts", "kim-su.ts", "nguyen-su.ts",
  "minh-su.ts", "thanh-su-cao.ts", "tan-nguyen-su.ts",
];

const tap = ["poems.ts"];

const rootFiles = ["annotations.ts", "authors.ts", "works.ts"];

// Everything else goes to tu/
const kinhSet = new Set(kinh);
const suSet = new Set(su);
const tapSet = new Set(tap);
const rootSet = new Set(rootFiles);

// Build the file→subdir map
const fileMap = {};
const allFiles = fs.readdirSync(libDir).filter(f => f.endsWith(".ts"));

for (const f of allFiles) {
  if (rootSet.has(f)) { fileMap[f] = null; continue; }
  if (kinhSet.has(f)) { fileMap[f] = "kinh"; continue; }
  if (suSet.has(f)) { fileMap[f] = "su"; continue; }
  if (tapSet.has(f)) { fileMap[f] = "tap"; continue; }
  fileMap[f] = "tu";
}

// ── Step 1: Create subdirectories ──
console.log("1. Creating subdirectories...");
for (const sub of ["kinh", "su", "tu", "tap"]) {
  const dir = path.join(libDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  console.log(`   ${sub}/`);
}

// ── Step 2: Move files ──
console.log("\n2. Moving files...");
const counts = { kinh: 0, su: 0, tu: 0, tap: 0, root: 0 };
for (const [file, subdir] of Object.entries(fileMap)) {
  if (subdir === null) { counts.root++; continue; }
  const src = path.join(libDir, file);
  const dst = path.join(libDir, subdir, file);
  fs.renameSync(src, dst);
  counts[subdir]++;
}
console.log(`   kinh: ${counts.kinh}, su: ${counts.su}, tu: ${counts.tu}, tap: ${counts.tap}, root: ${counts.root}`);

// ── Step 3: Update import paths ──
console.log("\n3. Updating import paths...");

// Build basename→subdir map (without .ts extension)
const nameToSubdir = {};
for (const [file, subdir] of Object.entries(fileMap)) {
  if (subdir === null) continue;
  const basename = file.replace(/\.ts$/, "");
  nameToSubdir[basename] = subdir;
}

// 3a. Update lazy-works.ts
const lazyPath = path.join(dataDir, "lazy-works.ts");
let lazySrc = fs.readFileSync(lazyPath, "utf8");
let lazyCount = 0;
lazySrc = lazySrc.replace(/import\("\.\/library\/([^"]+)"\)/g, (match, name) => {
  const sub = nameToSubdir[name];
  if (sub) { lazyCount++; return `import("./library/${sub}/${name}")`; }
  return match;
});
fs.writeFileSync(lazyPath, lazySrc, "utf8");
console.log(`   lazy-works.ts: ${lazyCount} imports updated`);

// 3b. Update index.ts
const indexPath = path.join(dataDir, "index.ts");
let indexSrc = fs.readFileSync(indexPath, "utf8");
let indexCount = 0;
indexSrc = indexSrc.replace(/["']\.\/library\/([^"']+)["']/g, (match, name) => {
  const sub = nameToSubdir[name];
  if (sub) { indexCount++; return `"./library/${sub}/${name}"`; }
  return match;
});
fs.writeFileSync(indexPath, indexSrc, "utf8");
console.log(`   index.ts: ${indexCount} imports updated`);

// 3c. Update mock-data.ts
const mockPath = path.join(__dirname, "..", "src", "lib", "mock-data.ts");
let mockSrc = fs.readFileSync(mockPath, "utf8");
let mockCount = 0;
mockSrc = mockSrc.replace(/@\/data\/library\/([^"']+)/g, (match, name) => {
  const sub = nameToSubdir[name];
  if (sub) { mockCount++; return `@/data/library/${sub}/${name}`; }
  return match;
});
fs.writeFileSync(mockPath, mockSrc, "utf8");
console.log(`   mock-data.ts: ${mockCount} imports updated`);

// 3d. Update convert-data.mjs (if it references library/)
const convertPath = path.join(__dirname, "convert-data.mjs");
if (fs.existsSync(convertPath)) {
  let cvSrc = fs.readFileSync(convertPath, "utf8");
  let cvCount = 0;
  cvSrc = cvSrc.replace(/["']\.\/library\/([^"']+)["']/g, (match, name) => {
    const sub = nameToSubdir[name];
    if (sub) { cvCount++; return `"./library/${sub}/${name}"`; }
    return match;
  });
  if (cvCount > 0) {
    fs.writeFileSync(convertPath, cvSrc, "utf8");
    console.log(`   convert-data.mjs: ${cvCount} imports updated`);
  }
}

// ── Step 4: Verify ──
console.log("\n4. Verification...");
const kinhFiles = fs.readdirSync(path.join(libDir, "kinh")).length;
const suFiles = fs.readdirSync(path.join(libDir, "su")).length;
const tuFiles = fs.readdirSync(path.join(libDir, "tu")).length;
const tapFiles = fs.readdirSync(path.join(libDir, "tap")).length;
const rootFilesCount = fs.readdirSync(libDir).filter(f => f.endsWith(".ts")).length;
console.log(`   kinh/: ${kinhFiles} files`);
console.log(`   su/: ${suFiles} files`);
console.log(`   tu/: ${tuFiles} files`);
console.log(`   tap/: ${tapFiles} files`);
console.log(`   root: ${rootFilesCount} files (metadata)`);
console.log(`   total: ${kinhFiles + suFiles + tuFiles + tapFiles + rootFilesCount}`);

console.log("\nDone!");
