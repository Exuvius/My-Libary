"use client";

import { create } from "zustand";
import type { FontPreference } from "@/types/user";

export type ScriptPreference = "traditional" | "simplified";

interface ReadingToggles {
  hanViet: boolean;
  pinyin: boolean;
  translation: boolean;
  annotations: boolean;
  comments: boolean;
}

interface AppState {
  toggles: ReadingToggles;
  setToggle: (key: keyof ReadingToggles, value: boolean) => void;
  fontPreference: FontPreference;
  setFontPreference: (font: FontPreference) => void;
  scriptPreference: ScriptPreference;
  setScriptPreference: (script: ScriptPreference) => void;
  toggleScriptPreference: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  toggles: {
    hanViet: true,
    pinyin: false,
    translation: true,
    annotations: false,
    comments: false,
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
}));
