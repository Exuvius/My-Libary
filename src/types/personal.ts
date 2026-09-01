export type DocSource = "paste" | "import_txt";

export interface PersonalCollection {
  id: string;
  title: string;
  description?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalDocument {
  id: string;
  collectionId: string;
  title: string;
  sortOrder: number;
  sourceType: DocSource;
  originalFilename?: string;
  contentText: string;
  contentPreview: string;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DictEntryType = "character" | "compound" | "idiom";

export interface PersonalDictEntry {
  id: string;
  text: string;
  simplified?: string;
  hanViet: string;
  pinyin?: string;
  definition: string;
  partOfSpeech?: string;
  entryType: DictEntryType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
