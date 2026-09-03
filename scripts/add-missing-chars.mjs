#!/usr/bin/env node
import fs from "fs";

const CHARS_FILE   = "src/data/characters.ts";
const MISSING_FILE = "scripts/missing-chars.json";
const UNIHAN_FILE  = "scripts/Unihan_Readings.txt";
const CVDICT_FILE  = "scripts/CVDICT.u8";
const SIMPTRAD_FILE = "src/data/simp-trad.ts";

// ── Helper: extract JSON from TS file with escaped quotes ──
function extractJSON(src) {
  const start = src.indexOf('JSON.parse("');
  if (start === -1) return null;
  const jsonStart = start + 12; // after JSON.parse("
  // Find matching closing ")
  let i = jsonStart;
  while (i < src.length) {
    if (src[i] === '\\' && src[i + 1] === '"') { i += 2; continue; }
    if (src[i] === '"') break;
    i++;
  }
  const escaped = src.substring(jsonStart, i);
  // Unescape: \" → "
  const json = escaped.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return { json, jsonStart, jsonEnd: i };
}

// ── 1. Load existing dictionary ──
console.log("1. Loading existing dictionary...");
const charsSrc = fs.readFileSync(CHARS_FILE, "utf8");
const extracted = extractJSON(charsSrc);
if (!extracted) { console.error("Cannot find JSON in characters.ts"); process.exit(1); }

const existingChars = JSON.parse(extracted.json);
console.log(`   ${existingChars.length} existing entries`);

const existingSet = new Set();
for (const c of existingChars) {
  existingSet.add(c.traditional);
  if (c.simplified) existingSet.add(c.simplified);
}
console.log(`   ${existingSet.size} unique chars covered`);

// Build pinyin→HanViet inference map from existing data
const pyToHv = new Map();
for (const c of existingChars) {
  for (const r of c.readings) {
    const py = r.pinyin?.toLowerCase();
    if (!py || !r.hanViet) continue;
    if (!pyToHv.has(py)) pyToHv.set(py, new Map());
    const inner = pyToHv.get(py);
    inner.set(r.hanViet, (inner.get(r.hanViet) || 0) + 1);
  }
}
console.log(`   ${pyToHv.size} pinyin→HV mappings for inference`);

function inferHanViet(pinyin) {
  const py = pinyin.toLowerCase();
  const candidates = pyToHv.get(py);
  if (candidates) {
    let best = "", bestCount = 0;
    for (const [hv, count] of candidates) {
      if (count > bestCount) { best = hv; bestCount = count; }
    }
    if (best) return best;
  }
  // Try without tone diacritics - normalize pinyin to base
  // Remove tone numbers if present (like "rén" vs "ren2")
  const bases = [
    py.replace(/[āáǎà]/g, "a").replace(/[ēéěè]/g, "e").replace(/[īíǐì]/g, "i")
      .replace(/[ōóǒò]/g, "o").replace(/[ūúǔù]/g, "u").replace(/[ǖǘǚǜ]/g, "ü"),
  ];
  for (const base of bases) {
    for (const [key, candidates] of pyToHv) {
      const keyBase = key.replace(/[āáǎà]/g, "a").replace(/[ēéěè]/g, "e").replace(/[īíǐì]/g, "i")
        .replace(/[ōóǒò]/g, "o").replace(/[ūúǔù]/g, "u").replace(/[ǖǘǚǜ]/g, "ü");
      if (keyBase === base) {
        let best = "", bestCount = 0;
        for (const [hv, count] of candidates) {
          if (count > bestCount) { best = hv; bestCount = count; }
        }
        if (best) return best;
      }
    }
  }
  return null;
}

// ── 2. Load simp→trad mapping ──
console.log("2. Loading simp-trad mapping...");
const stSrc = fs.readFileSync(SIMPTRAD_FILE, "utf8");
const stEx = extractJSON(stSrc);
const simpTrad = stEx ? JSON.parse(stEx.json) : {};
const tradToSimp = new Map();
for (const [s, t] of Object.entries(simpTrad)) {
  tradToSimp.set(t, s);
}
console.log(`   ${tradToSimp.size} trad→simp pairs`);

// ── 3. Parse Unihan ──
console.log("3. Parsing Unihan readings...");
const unihanData = new Map();
for (const line of fs.readFileSync(UNIHAN_FILE, "utf8").split("\n")) {
  if (line.startsWith("#") || !line.trim()) continue;
  const parts = line.split("\t");
  if (parts.length < 3) continue;
  const [cp, field] = parts;
  const val = parts.slice(2).join("\t");
  const code = parseInt(cp.replace("U+", ""), 16);
  if (!unihanData.has(code)) unihanData.set(code, {});
  const entry = unihanData.get(code);
  if (field === "kVietnamese") entry.kVietnamese = val;
  if (field === "kMandarin") entry.kMandarin = val;
  if (field === "kDefinition") entry.kDefinition = val;
}
console.log(`   ${unihanData.size} Unihan entries`);

// ── 4. Parse CVDICT ──
console.log("4. Parsing CVDICT...");
const cvdictMap = new Map();
for (const line of fs.readFileSync(CVDICT_FILE, "utf8").split("\n")) {
  if (line.startsWith("#") || !line.trim()) continue;
  const cm = line.match(/^(.) (.) \[([^\]]+)\] \/(.+)\/$/);
  if (!cm) continue;
  const [, trad, simp, pinyin, defs] = cm;
  if (!cvdictMap.has(trad)) cvdictMap.set(trad, []);
  cvdictMap.get(trad).push({ simp, pinyin, defs });
}
console.log(`   ${cvdictMap.size} single-char entries`);

// ── 5. Process missing chars ──
console.log("5. Processing missing chars...");
const missing = JSON.parse(fs.readFileSync(MISSING_FILE, "utf8"));
console.log(`   ${missing.length} to add`);

const newEntries = [];
let sViet = 0, sInfer = 0, sRaw = 0, sCv = 0, sEn = 0, sNoDef = 0;

for (const { char, code, freq } of missing) {
  const uh = unihanData.get(code) || {};
  const cv = cvdictMap.get(char) || [];

  // HanViet
  let hanViet = null;
  if (uh.kVietnamese) { hanViet = uh.kVietnamese.split(" ")[0]; sViet++; }
  if (!hanViet) {
    const py = uh.kMandarin?.split(" ")[0];
    if (py) { hanViet = inferHanViet(py); if (hanViet) sInfer++; }
  }
  if (!hanViet) { hanViet = uh.kMandarin?.split(" ")[0] || "?"; sRaw++; }

  // Pinyin
  const pinyin = uh.kMandarin?.split(" ")[0] || "";

  // Definition
  let definition = "";
  if (cv.length > 0) {
    const allDefs = cv.flatMap(e => e.defs.split("/").filter(d => d.trim()));
    definition = allDefs[0] || "";
    if (definition) sCv++;
  }
  if (!definition && uh.kDefinition) { definition = uh.kDefinition; sEn++; }
  if (!definition) { definition = hanViet; sNoDef++; }

  // Simplified
  const simplified = tradToSimp.get(char);

  // Build entry
  const id = `c${code.toString(16)}`;
  const entry = {
    id,
    traditional: char,
    strokeCount: 0,
    readings: [{
      id: `rd_${id}_0`,
      characterId: id,
      hanViet,
      pinyin,
      sortOrder: 0,
      meanings: [{
        id: `mn_${id}_0_0`,
        readingId: `rd_${id}_0`,
        partOfSpeech: "Khác",
        definition,
        sortOrder: 0,
      }],
    }],
  };
  if (simplified && simplified !== char) entry.simplified = simplified;

  // Extra readings from CVDICT
  if (cv.length > 1) {
    for (let i = 1; i < cv.length && i < 4; i++) {
      const cvDef = cv[i].defs.split("/").filter(d => d.trim())[0] || "";
      if (!cvDef || cvDef === definition) continue;
      const altHv = inferHanViet(cv[i].pinyin) || cv[i].pinyin;
      if (altHv === hanViet) continue;
      entry.readings.push({
        id: `rd_${id}_${i}`,
        characterId: id,
        hanViet: altHv,
        pinyin: cv[i].pinyin,
        sortOrder: i,
        meanings: [{
          id: `mn_${id}_${i}_0`,
          readingId: `rd_${id}_${i}`,
          partOfSpeech: "Khác",
          definition: cvDef,
          sortOrder: 0,
        }],
      });
    }
  }

  newEntries.push(entry);
}

console.log(`\n   HV from kVietnamese: ${sViet}`);
console.log(`   HV inferred:        ${sInfer}`);
console.log(`   HV fallback (raw):  ${sRaw}`);
console.log(`   Def CVDICT (Việt):  ${sCv}`);
console.log(`   Def Unihan (EN):    ${sEn}`);
console.log(`   Def fallback:       ${sNoDef}`);

// ── 6. Merge ──
console.log("\n6. Merging...");
const merged = [...existingChars, ...newEntries];
console.log(`   ${existingChars.length} + ${newEntries.length} = ${merged.length}`);

// Rebuild file: keep the prefix and suffix, replace JSON
const mergedStr = JSON.stringify(merged).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const prefix = charsSrc.substring(0, extracted.jsonStart);
const suffix = charsSrc.substring(extracted.jsonEnd);
const newSrc = prefix + mergedStr + suffix;

fs.writeFileSync(CHARS_FILE + ".bak", charsSrc);
fs.writeFileSync(CHARS_FILE, newSrc, "utf8");

const sizeMB = (Buffer.byteLength(newSrc) / 1048576).toFixed(1);
console.log(`   Written ${sizeMB}MB → ${CHARS_FILE}`);
console.log(`\nDone! ${existingChars.length} → ${merged.length} characters.`);
