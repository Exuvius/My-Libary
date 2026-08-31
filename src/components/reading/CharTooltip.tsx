"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

interface CharTooltipProps {
  character: string;
  hanViet?: string;
  pinyin?: string;
  partOfSpeech?: string;
  definition?: string;
  children: ReactNode;
  charId?: string;
}

export function CharTooltip({
  character,
  hanViet,
  pinyin,
  partOfSpeech,
  definition,
  children,
  charId,
}: CharTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on click-outside: listens on document to catch clicks anywhere,
  // paired with stopPropagation on the trigger to prevent immediate re-close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="cursor-pointer hover:text-accent-gold transition-colors"
      >
        {children}
      </span>

      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-bg-primary rounded-xl shadow-lg border border-border-main p-3 text-left">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="font-han-ming text-[36px] text-text-primary leading-none">
              {character}
            </span>
            <div>
              {hanViet && (
                <span className="text-sm font-bold text-hanviet block">{hanViet}</span>
              )}
              {pinyin && (
                <span className="text-xs text-pinyin italic">{pinyin}</span>
              )}
            </div>
          </div>
          {partOfSpeech && (
            <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-tag-bg text-accent-tag-text mb-1">
              {partOfSpeech}
            </span>
          )}
          {definition && (
            <p className="text-xs text-text-body leading-relaxed">{definition}</p>
          )}
          {charId && (
            <a
              href={`/dictionary/${charId}`}
              className="block text-[11px] text-accent-dark mt-2 hover:underline"
            >
              Xem đầy đủ trong Từ điển →
            </a>
          )}
          {/* Triangle arrow pointing down — rotated square with matching bg/border */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-bg-primary border-r border-b border-border-main rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
