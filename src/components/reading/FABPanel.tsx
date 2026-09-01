"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { FontPreference, TextAlign } from "@/types/user";

interface ReadingToggles {
  hanViet: boolean;
  pinyin: boolean;
  translation: boolean;
  annotations: boolean;
  comments: boolean;
  highlightUnknown: boolean;
}

const toggleItems: { key: keyof ReadingToggles; label: string }[] = [
  { key: "hanViet", label: "Hán Việt" },
  { key: "pinyin", label: "Pinyin" },
  { key: "translation", label: "Dịch nghĩa" },
  { key: "annotations", label: "Chú giải" },
  { key: "comments", label: "Bình luận" },
];

const fontOptions: { key: FontPreference; label: string; char: string }[] = [
  { key: "ming", label: "Minh thể", char: "明" },
  { key: "kai", label: "Khải thể", char: "楷" },
  { key: "gothic", label: "Hắc thể", char: "黑" },
];

const alignOptions: { key: TextAlign; label: string }[] = [
  { key: "left", label: "Trái" },
  { key: "center", label: "Giữa" },
  { key: "right", label: "Phải" },
];

export function FABPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggles = useAppStore((s) => s.toggles);
  const setToggle = useAppStore((s) => s.setToggle);
  const fontPreference = useAppStore((s) => s.fontPreference);
  const setFontPreference = useAppStore((s) => s.setFontPreference);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const toggleScriptPreference = useAppStore((s) => s.toggleScriptPreference);
  const textAlign = useAppStore((s) => s.textAlign);
  const setTextAlign = useAppStore((s) => s.setTextAlign);

  // Close panel on click-outside. The FAB button uses stopPropagation
  // so this handler won't fire when toggling the panel itself.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-6 right-4 z-50">
      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-64 bg-bg-primary rounded-2xl shadow-lg border border-border-main p-4 space-y-4">
          {/* Section 1: Toggles */}
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
              Hiển thị
            </p>
            <div className="flex flex-wrap gap-1.5">
              {toggleItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setToggle(item.key, !toggles[item.key])}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    toggles[item.key]
                      ? "bg-text-body text-bg-primary"
                      : "bg-bg-secondary text-text-muted hover:bg-bg-subtle"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border-subtle" />

          {/* Section 2: Script */}
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
              Chữ thể
            </p>
            <button
              onClick={toggleScriptPreference}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              <span className={`font-han-ming text-base leading-none ${scriptPreference === "traditional" ? "text-accent-gold" : "text-text-muted"}`}>
                繁
              </span>
              <span className="text-[10px] text-text-ghost mx-2">⇄</span>
              <span className={`font-han-ming text-base leading-none ${scriptPreference === "simplified" ? "text-accent-gold" : "text-text-muted"}`}>
                简
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border-subtle" />

          {/* Section 3: Alignment */}
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
              Căn lề
            </p>
            <div className="flex gap-2">
              {alignOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTextAlign(opt.key)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs transition-colors ${
                    textAlign === opt.key
                      ? "bg-bg-subtle border border-accent-gold text-text-primary"
                      : "bg-bg-secondary border border-transparent text-text-muted hover:bg-bg-subtle"
                  }`}
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" className="mb-0.5" fill="currentColor">
                    {opt.key === "left" && (
                      <>
                        <rect x="0" y="0" width="14" height="2" rx="1" />
                        <rect x="0" y="5" width="10" height="2" rx="1" />
                        <rect x="0" y="10" width="12" height="2" rx="1" />
                      </>
                    )}
                    {opt.key === "center" && (
                      <>
                        <rect x="1" y="0" width="14" height="2" rx="1" />
                        <rect x="3" y="5" width="10" height="2" rx="1" />
                        <rect x="2" y="10" width="12" height="2" rx="1" />
                      </>
                    )}
                    {opt.key === "right" && (
                      <>
                        <rect x="2" y="0" width="14" height="2" rx="1" />
                        <rect x="6" y="5" width="10" height="2" rx="1" />
                        <rect x="4" y="10" width="12" height="2" rx="1" />
                      </>
                    )}
                  </svg>
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border-subtle" />

          {/* Section 4: Font */}
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
              Font đọc
            </p>
            <div className="flex gap-2">
              {fontOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFontPreference(opt.key)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs transition-colors ${
                    fontPreference === opt.key
                      ? "bg-bg-subtle border border-accent-gold text-text-primary"
                      : "bg-bg-secondary border border-transparent text-text-muted hover:bg-bg-subtle"
                  }`}
                >
                  <span
                    className={`text-lg leading-none mb-0.5 ${
                      opt.key === "ming"
                        ? "font-han-ming"
                        : opt.key === "kai"
                        ? "font-han-kai"
                        : "font-han-hei"
                    }`}
                  >
                    {opt.char}
                  </span>
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border-subtle" />

          {/* Section 5: Tools */}
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
              Công cụ
            </p>
            <button
              onClick={() => setToggle("highlightUnknown", !toggles.highlightUnknown)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                toggles.highlightUnknown
                  ? "bg-red-500/10 border border-red-400/40 text-red-600"
                  : "bg-bg-secondary border border-transparent text-text-muted hover:bg-bg-subtle"
              }`}
            >
              <span className="text-base leading-none">?</span>
              <span>Đánh dấu chữ chưa biết</span>
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-[52px] h-[52px] rounded-full bg-text-body text-bg-primary shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
      >
        <span
          className={`text-xl leading-none transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          ⚙
        </span>
      </button>
    </div>
  );
}
