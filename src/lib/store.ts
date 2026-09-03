"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontPreference, TextAlign } from "@/types/user";

export type ScriptPreference = "traditional" | "simplified";

interface ReadingToggles {
  hanViet: boolean;
  pinyin: boolean;
  translation: boolean;
  annotations: boolean;
  comments: boolean;
  highlightUnknown: boolean;
}

export interface GameResult {
  game: "tone" | "chain" | "write";
  score: number;
  pointsEarned: number;
  bestStreak?: number;
  chainLength?: number;
  date: string;
}

interface AppState {
  toggles: ReadingToggles;
  setToggle: (key: keyof ReadingToggles, value: boolean) => void;
  fontPreference: FontPreference;
  setFontPreference: (font: FontPreference) => void;
  scriptPreference: ScriptPreference;
  setScriptPreference: (script: ScriptPreference) => void;
  toggleScriptPreference: () => void;
  textAlign: TextAlign;
  setTextAlign: (align: TextAlign) => void;
  rewardPoints: number;
  addRewardPoints: (n: number) => void;
  spendRewardPoints: (n: number) => boolean;
  gameHistory: GameResult[];
  addGameResult: (result: GameResult) => void;
  wordChainTurn: number;
  wordChainCooldowns: Record<string, number>;
  recordWordUsed: (word: string) => void;
  isWordOnCooldown: (word: string) => boolean;
  writeGameTurn: number;
  writeGameCooldowns: Record<string, number>;
  recordWriteGameUsed: (word: string) => void;
  isWriteGameOnCooldown: (word: string) => boolean;
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  toggles: {
    hanViet: true,
    pinyin: false,
    translation: true,
    annotations: false,
    comments: false,
    highlightUnknown: false,
  },
  setToggle: (key, value) =>
    set((state) => ({
      toggles: { ...state.toggles, [key]: value },
    })),
  fontPreference: "ming",
  setFontPreference: (font) => set({ fontPreference: font }),
  scriptPreference: "traditional",
  setScriptPreference: (script) => set({ scriptPreference: script }),
  toggleScriptPreference: () =>
    set((state) => ({
      scriptPreference: state.scriptPreference === "traditional" ? "simplified" : "traditional",
    })),
  textAlign: "left",
  setTextAlign: (align) => set({ textAlign: align }),
  rewardPoints: 0,
  addRewardPoints: (n) => set((state) => ({ rewardPoints: state.rewardPoints + n })),
  spendRewardPoints: (n) => {
    if (get().rewardPoints < n) return false;
    set((state) => ({ rewardPoints: state.rewardPoints - n }));
    return true;
  },
  gameHistory: [],
  addGameResult: (result) => set((state) => ({
    gameHistory: [...state.gameHistory.slice(-49), result],
  })),
  wordChainTurn: 0,
  wordChainCooldowns: {},
  recordWordUsed: (word) => set((state) => {
    const turn = state.wordChainTurn + 1;
    const cooldowns = { ...state.wordChainCooldowns };
    for (const w of Object.keys(cooldowns)) {
      if (turn - cooldowns[w] >= 50) delete cooldowns[w];
    }
    cooldowns[word] = turn;
    return { wordChainTurn: turn, wordChainCooldowns: cooldowns };
  }),
  isWordOnCooldown: (word) => {
    const { wordChainTurn, wordChainCooldowns } = get();
    const usedAt = wordChainCooldowns[word];
    if (usedAt === undefined) return false;
    return wordChainTurn - usedAt < 50;
  },
  writeGameTurn: 0,
  writeGameCooldowns: {},
  recordWriteGameUsed: (word) => set((state) => {
    const turn = state.writeGameTurn + 1;
    const cooldowns = { ...state.writeGameCooldowns };
    for (const w of Object.keys(cooldowns)) {
      if (turn - cooldowns[w] >= 500) delete cooldowns[w];
    }
    cooldowns[word] = turn;
    return { writeGameTurn: turn, writeGameCooldowns: cooldowns };
  }),
  isWriteGameOnCooldown: (word) => {
    const { writeGameTurn, writeGameCooldowns } = get();
    const usedAt = writeGameCooldowns[word];
    if (usedAt === undefined) return false;
    return writeGameTurn - usedAt < 500;
  },
}), { name: "handien-settings" }));
