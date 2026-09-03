"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import type { FontPreference, TextAlign } from "@/types/user";

const FAB_SIZE = 52;
const EDGE_MARGIN = 16;
const STORAGE_KEY = "handien-fab-pos";
const DRAG_THRESHOLD = 5;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

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
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    moved: false,
  });

  const toggles = useAppStore((s) => s.toggles);
  const setToggle = useAppStore((s) => s.setToggle);
  const fontPreference = useAppStore((s) => s.fontPreference);
  const setFontPreference = useAppStore((s) => s.setFontPreference);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const toggleScriptPreference = useAppStore((s) => s.toggleScriptPreference);
  const textAlign = useAppStore((s) => s.textAlign);
  const setTextAlign = useAppStore((s) => s.setTextAlign);

  useEffect(() => {
    let x: number, y: number;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        x = p.x;
        y = p.y;
      } else {
        x = window.innerWidth - FAB_SIZE - EDGE_MARGIN;
        y = window.innerHeight - FAB_SIZE - 80;
      }
    } catch {
      x = window.innerWidth - FAB_SIZE - EDGE_MARGIN;
      y = window.innerHeight - FAB_SIZE - 80;
    }
    setPos({
      x: clamp(x, EDGE_MARGIN, window.innerWidth - FAB_SIZE - EDGE_MARGIN),
      y: clamp(y, EDGE_MARGIN, window.innerHeight - FAB_SIZE - EDGE_MARGIN),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  const startDrag = useCallback(
    (cx: number, cy: number) => {
      if (!pos) return;
      dragRef.current = {
        active: true,
        startX: cx,
        startY: cy,
        startPosX: pos.x,
        startPosY: pos.y,
        moved: false,
      };
    },
    [pos]
  );

  const moveDrag = useCallback((cx: number, cy: number) => {
    const d = dragRef.current;
    if (!d.active || !containerRef.current) return;
    const dx = cx - d.startX;
    const dy = cy - d.startY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setOpen(false);
    }
    const el = containerRef.current;
    el.style.left = `${clamp(d.startPosX + dx, 0, window.innerWidth - FAB_SIZE)}px`;
    el.style.top = `${clamp(d.startPosY + dy, 0, window.innerHeight - FAB_SIZE)}px`;
    el.style.transition = "none";
  }, []);

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved || !containerRef.current) return;
    const el = containerRef.current;
    const cx = parseFloat(el.style.left);
    const cy = parseFloat(el.style.top);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const snapped = {
      x: cx < vw / 2 ? EDGE_MARGIN : vw - FAB_SIZE - EDGE_MARGIN,
      y: clamp(cy, EDGE_MARGIN, vh - FAB_SIZE - EDGE_MARGIN),
    };
    el.style.transition = "left 0.2s ease-out, top 0.2s ease-out";
    el.style.left = `${snapped.x}px`;
    el.style.top = `${snapped.y}px`;
    setTimeout(() => setPos(snapped), 220);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
    } catch {}
  }, []);

  useEffect(() => {
    const onMM = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMU = () => endDrag();
    const onTM = (e: TouchEvent) => {
      if (dragRef.current.active && dragRef.current.moved) e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTE = () => endDrag();
    document.addEventListener("mousemove", onMM);
    document.addEventListener("mouseup", onMU);
    document.addEventListener("touchmove", onTM, { passive: false });
    document.addEventListener("touchend", onTE);
    return () => {
      document.removeEventListener("mousemove", onMM);
      document.removeEventListener("mouseup", onMU);
      document.removeEventListener("touchmove", onTM);
      document.removeEventListener("touchend", onTE);
    };
  }, [moveDrag, endDrag]);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => {
        if (!p) return p;
        return {
          x: clamp(p.x, EDGE_MARGIN, window.innerWidth - FAB_SIZE - EDGE_MARGIN),
          y: clamp(p.y, EDGE_MARGIN, window.innerHeight - FAB_SIZE - EDGE_MARGIN),
        };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    setOpen((v) => !v);
  }, []);

  if (!pos) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const onRight = pos.x > vw / 2;
  const PANEL_GAP = 12;
  const VIEWPORT_PAD = 8;
  const MIN_VERT = 450;
  const spaceAbove = pos.y - PANEL_GAP;
  const spaceBelow = vh - pos.y - FAB_SIZE - PANEL_GAP;
  const bestVert = Math.max(spaceAbove, spaceBelow);
  const openSide = bestVert < MIN_VERT;

  let panelPos: string;
  let panelStyle: React.CSSProperties;
  if (openSide) {
    panelPos = "fixed";
    panelStyle = {
      ...(onRight
        ? { right: vw - pos.x + PANEL_GAP }
        : { left: pos.x + FAB_SIZE + PANEL_GAP }),
      top: "50%",
      transform: "translateY(-50%)",
      maxHeight: vh - 2 * VIEWPORT_PAD,
    };
  } else {
    const openAbove = spaceAbove >= spaceBelow;
    panelPos = "absolute";
    panelStyle = {
      ...(onRight ? { right: 0 } : { left: 0 }),
      ...(openAbove
        ? { bottom: FAB_SIZE + PANEL_GAP }
        : { top: FAB_SIZE + PANEL_GAP }),
      maxHeight: bestVert - VIEWPORT_PAD,
    };
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Panel */}
      {open && (
        <div
          className={`${panelPos} w-64 overflow-y-auto bg-bg-primary rounded-2xl shadow-lg border border-border-main p-4 space-y-4`}
          style={panelStyle}
        >
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
        onClick={handleClick}
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) =>
          startDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
        className="w-[52px] h-[52px] rounded-full bg-text-body text-bg-primary shadow-lg flex items-center justify-center hover:opacity-90 transition-all select-none touch-none"
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
