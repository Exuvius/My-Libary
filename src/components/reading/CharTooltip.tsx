"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { getDictEntryByText } from "@/lib/personal-db";
import type { PersonalDictEntry } from "@/types/personal";
import { AddDictEntryModal } from "@/components/personal/AddDictEntryModal";

interface CharTooltipProps {
  character: string;
  hanViet?: string;
  pinyin?: string;
  partOfSpeech?: string;
  definition?: string;
  children: ReactNode;
  charId?: string;
  personalEntry?: PersonalDictEntry;
}

export function CharTooltip({
  character,
  hanViet,
  pinyin,
  partOfSpeech,
  definition,
  children,
  charId,
  personalEntry,
}: CharTooltipProps) {
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localPersonal, setLocalPersonal] = useState(personalEntry);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => { setLocalPersonal(personalEntry); }, [personalEntry]);

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

  const hasStatic = !!(hanViet || definition);
  const hasPersonal = !!localPersonal;

  const displayHanViet = hanViet || localPersonal?.hanViet;
  const displayPinyin = pinyin || localPersonal?.pinyin;
  const displayPos = partOfSpeech || localPersonal?.partOfSpeech;
  const displayDef = definition || localPersonal?.definition;

  const prefill = hasStatic
    ? { hanViet, pinyin, definition, partOfSpeech }
    : localPersonal
    ? {
        hanViet: localPersonal.hanViet,
        pinyin: localPersonal.pinyin,
        definition: localPersonal.definition,
        partOfSpeech: localPersonal.partOfSpeech,
        simplified: localPersonal.simplified,
        entryType: localPersonal.entryType,
        notes: localPersonal.notes,
      }
    : undefined;

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

      {open && !showAddModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 rounded-xl shadow-lg border p-4 text-left ${
              hasStatic || hasPersonal
                ? "bg-bg-primary border-border-main"
                : "bg-bg-secondary border-border-subtle"
            }`}
          >
            {hasStatic || hasPersonal ? (
              <>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-han-ming text-[40px] text-text-primary leading-none">
                    {character}
                  </span>
                  <div>
                    {displayHanViet && (
                      <span className="text-sm font-bold text-hanviet block">
                        {displayHanViet}
                      </span>
                    )}
                    {displayPinyin && (
                      <span className="text-xs text-pinyin italic">
                        {displayPinyin}
                      </span>
                    )}
                  </div>
                </div>
                {displayPos && (
                  <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-tag-bg text-accent-tag-text mb-1">
                    {displayPos}
                  </span>
                )}
                {displayDef && (
                  <p className="text-sm text-text-body leading-relaxed">
                    {displayDef}
                  </p>
                )}

                {!hasStatic && hasPersonal && (
                  <span className="inline-block text-[10px] text-accent-gold/70 bg-accent-gold/10 px-1.5 py-0.5 rounded mt-1.5">
                    Từ điển cá nhân
                  </span>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {charId && (
                    <Link
                      href={`/dictionary/${charId}`}
                      className="text-[12px] text-accent-dark hover:underline"
                    >
                      Xem đầy đủ →
                    </Link>
                  )}
                  {!hasPersonal && (
                    <>
                      {charId && <span className="text-text-ghost text-[10px]">·</span>}
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-[12px] text-accent-dark hover:underline"
                      >
                        ＋ Lưu
                      </button>
                    </>
                  )}
                  {hasPersonal && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-[12px] text-accent-dark hover:underline ml-auto"
                    >
                      Sửa
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <span className="font-han-ming text-[40px] text-text-muted leading-none block mb-2">
                  {character}
                </span>
                <p className="text-sm text-text-ghost mb-3">
                  Chữ này chưa có trong từ điển
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-text-body text-bg-primary hover:opacity-90 transition-opacity"
                >
                  ＋ Thêm nghĩa
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showAddModal && (
        <AddDictEntryModal
          character={character}
          prefill={prefill}
          existingId={localPersonal?.id}
          onSave={() => {
            getDictEntryByText(character).then((e) => setLocalPersonal(e || undefined));
            setShowAddModal(false);
            setOpen(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </span>
  );
}
