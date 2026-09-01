#!/usr/bin/env node

/**
 * Merge personal dictionary entries (exported JSON from the app)
 * into the static data files.
 *
 * Usage:
 *   node scripts/merge-personal-dict.mjs path/to/exported.json
 *
 * Characters (entryType "character") → src/data/characters.ts
 * Compounds / Idioms                → src/data/entries.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/merge-personal-dict.mjs <exported.json>");
  process.exit(1);
}

const ROOT = resolve(import.meta.dirname, "..");
const CHARS_FILE = resolve(ROOT, "src/data/characters.ts");
const ENTRIES_FILE = resolve(ROOT, "src/data/entries.ts");

// ─── Read exported JSON ───

const raw = readFileSync(resolve(inputPath), "utf-8");
const personalEntries = JSON.parse(raw);

if (!Array.isArray(personalEntries) || personalEntries.length === 0) {
  console.error("No entries found in the JSON file.");
  process.exit(1);
}

console.log(`Found ${personalEntries.length} personal entries.`);

// ─── Extract JSON from TS data files ───

function extractJson(filePath) {
  const src = readFileSync(filePath, "utf-8");
  const start = src.indexOf("JSON.parse('");
  if (start === -1) throw new Error(`Cannot find JSON.parse in ${filePath}`);
  const jsonStart = start + "JSON.parse('".length;
  const jsonEnd = src.indexOf("');", jsonStart);
  if (jsonEnd === -1) throw new Error(`Cannot find end of JSON string in ${filePath}`);
  const jsonStr = src.slice(jsonStart, jsonEnd).replace(/\\'/g, "'");
  return { src, jsonStart, jsonEnd, data: JSON.parse(jsonStr) };
}

function writeBack(filePath, original, jsonStart, jsonEnd, newData) {
  const jsonStr = JSON.stringify(newData).replace(/'/g, "\\'");
  const newSrc = original.slice(0, jsonStart) + jsonStr + original.slice(jsonEnd);
  writeFileSync(filePath, newSrc, "utf-8");
}

// ─── Process characters ───

const newChars = personalEntries.filter((e) => e.entryType === "character");
const newCompounds = personalEntries.filter((e) => e.entryType !== "character");

let charsAdded = 0;
let charsSkipped = 0;
let entriesAdded = 0;
let entriesSkipped = 0;

if (newChars.length > 0) {
  const { src, jsonStart, jsonEnd, data: existingChars } = extractJson(CHARS_FILE);
  const existingSet = new Set(existingChars.map((c) => c.traditional));

  for (const entry of newChars) {
    if (existingSet.has(entry.text)) {
      charsSkipped++;
      continue;
    }

    const charCode = entry.text.codePointAt(0).toString(16);
    const charObj = {
      id: `c${charCode}`,
      traditional: entry.text,
      ...(entry.simplified ? { simplified: entry.simplified } : {}),
      strokeCount: 0,
      readings: [
        {
          id: `rd_c${charCode}_0`,
          characterId: `c${charCode}`,
          hanViet: entry.hanViet,
          pinyin: entry.pinyin || "",
          sortOrder: 0,
          meanings: [
            {
              id: `mn_c${charCode}_0_0`,
              readingId: `rd_c${charCode}_0`,
              partOfSpeech: entry.partOfSpeech || "Khác",
              definition: entry.definition,
              sortOrder: 0,
            },
          ],
        },
      ],
    };

    existingChars.push(charObj);
    existingSet.add(entry.text);
    charsAdded++;
  }

  if (charsAdded > 0) {
    writeBack(CHARS_FILE, src, jsonStart, jsonEnd, existingChars);
  }
}

// ─── Process compounds / idioms ───

if (newCompounds.length > 0) {
  const { src, jsonStart, jsonEnd, data: existingEntries } = extractJson(ENTRIES_FILE);
  const existingSet = new Set(existingEntries.map((e) => e.textTraditional));

  let maxId = 0;
  for (const e of existingEntries) {
    const m = e.id.match(/_(\d+)$/);
    if (m) maxId = Math.max(maxId, parseInt(m[1]));
  }

  for (const entry of newCompounds) {
    if (existingSet.has(entry.text)) {
      entriesSkipped++;
      continue;
    }

    maxId++;
    const entryObj = {
      id: `cmpd_${maxId}`,
      textTraditional: entry.text,
      ...(entry.simplified ? { textSimplified: entry.simplified } : {}),
      hanViet: entry.hanViet,
      pinyin: entry.pinyin || "",
      definition: entry.definition,
      entryType: entry.entryType === "idiom" ? "idiom" : "compound",
    };

    existingEntries.push(entryObj);
    existingSet.add(entry.text);
    entriesAdded++;
  }

  if (entriesAdded > 0) {
    writeBack(ENTRIES_FILE, src, jsonStart, jsonEnd, existingEntries);
  }
}

// ─── Report ───

console.log("\nMerge complete:");
console.log(`  Characters: ${charsAdded} added, ${charsSkipped} skipped (duplicates)`);
console.log(`  Entries:    ${entriesAdded} added, ${entriesSkipped} skipped (duplicates)`);

if (charsAdded > 0 || entriesAdded > 0) {
  console.log("\nRebuild the app to see changes: npm run build");
}
