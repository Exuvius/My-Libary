export interface Radical {
  id: string;
  character: string;
  hanViet: string;
  strokeCount: number;
  sortOrder: number;
}

export interface Character {
  id: string;
  traditional: string;
  simplified?: string;
  radicalId?: string;
  strokeCount: number;
  hskLevel?: number;
}

export interface Reading {
  id: string;
  characterId: string;
  hanViet: string;
  pinyin: string;
  nomReading?: string;
  sortOrder: number;
}

export interface Meaning {
  id: string;
  readingId: string;
  partOfSpeech: string;
  definition: string;
  notes?: string;
  sortOrder: number;
}

export type RelationType = "antonym" | "same_root" | "same_radical" | "similar_meaning";

export interface CharacterRelation {
  id: string;
  characterId: string;
  relatedCharacterId: string;
  relation: RelationType;
}

export type EntryType = "compound" | "idiom" | "specialized";

export interface Entry {
  id: string;
  textTraditional: string;
  textSimplified?: string;
  hanViet: string;
  pinyin?: string;
  definition: string;
  entryType: EntryType;
  hskLevel?: number;
  specializedCategory?: string;
  notes?: string;
}

export interface EntryCharacter {
  id: string;
  entryId: string;
  characterId: string;
  readingId?: string;
  position: number;
}

export interface CharacterFull extends Character {
  readings: (Reading & { meanings: Meaning[] })[];
  radical?: Radical;
  relations?: (CharacterRelation & { relatedCharacter: Character })[];
  entries?: (EntryCharacter & { entry: Entry })[];
}
