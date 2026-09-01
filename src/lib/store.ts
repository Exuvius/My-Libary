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
}

export const useAppStore = create<AppState>()(persist((set) => ({
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
}), { name: "handien-settings" }));
