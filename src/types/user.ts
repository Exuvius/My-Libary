export type FontPreference = "ming" | "kai" | "gothic";
export type ThemePreference = "light" | "dark" | "system";
export type TextAlign = "left" | "center" | "right";

export interface Profile {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  preferredFont: FontPreference;
  preferredTheme: ThemePreference;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  workId: string;
  currentChapterId?: string;
  currentSentenceId?: string;
  progressPercent: number;
  chaptersCompleted: string[];
}

export interface Bookmark {
  id: string;
  userId: string;
  sentenceId: string;
  note?: string;
  createdAt: string;
}
