export interface Author {
  id: string;
  nameViet: string;
  nameHan?: string;
  era?: string;
  dynasty?: string;
  bio?: string;
}

export type LanguageType = "han_van" | "han_nom";
export type TagCategory = "type" | "genre" | "era" | "language";

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  sortOrder: number;
}

export interface Work {
  id: string;
  titleViet: string;
  titleHan: string;
  authorId?: string;
  author?: Author;
  sourceInfo?: string;
  variantName?: string;
  chapterCount: number;
  characterCount: number;
  language: LanguageType;
  isPublished: boolean;
  tags?: Tag[];
  iconChar?: string;
  progressPercent?: number;
}

export interface Chapter {
  id: string;
  workId: string;
  titleViet: string;
  titleHan?: string;
  chapterNumber: number;
  sectionLabel?: string;
  sortOrder: number;
  isRead?: boolean;
  isCurrent?: boolean;
}

export interface Sentence {
  id: string;
  chapterId: string;
  textTraditional: string;
  textSimplified?: string;
  hanVietReading?: string;
  pinyinReading?: string;
  translation?: string;
  sentenceOrder: number;
  paragraphGroup?: number;
}

export interface SentenceCharacter {
  id: string;
  sentenceId: string;
  characterId: string;
  meaningId: string;
  position: number;
}

export interface Annotation {
  id: string;
  sentenceId: string;
  level: "character" | "sentence" | "paragraph";
  characterPosition?: number;
  content: string;
}

export interface Comment {
  id: string;
  sentenceId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  createdAt: string;
}
