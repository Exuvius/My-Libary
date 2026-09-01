"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CharacterFull } from "@/types/dictionary";
import { getDictEntryByText } from "@/lib/personal-db";
import type { PersonalDictEntry } from "@/types/personal";
import { AddDictEntryModal } from "./AddDictEntryModal";

interface PersonalCharTooltipProps {
  character: string;
  charData?: CharacterFull;
  personalEntry?: PersonalDictEntry;
  children: ReactNode;
}

export function PersonalCharTooltip({
  character,
  charData,
  personalEntry,
  children,
}: PersonalCharTooltipProps) {
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

  const totalReadings = charData?.readings.length || 0;
  const totalMeanings = charData?.readings.reduce(
    (sum, r) => sum + r.meanings.length,
    0
  ) || 0;

  const hasStatic = !!charData;
  const hasPersonal = !!localPersonal;

  const prefill = charData
    ? {
        hanViet: charData.readings.map((r) => r.hanViet).join(", "),
        pinyin: charData.readings.map((r) => r.pinyin).join(", "),
        definition: charData.readings
          .flatMap((r) => r.meanings.map((m) => m.definition))
          .join("; "),
        partOfSpeech: charData.readings[0]?.meanings[0]?.partOfSpeech,
        simplified: charData.simplified,
      }
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
            className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 rounded-xl shadow-lg border p-4 text-left ${
              hasStatic || hasPersonal
                ? "bg-bg-primary border-border-main"
                : "bg-bg-secondary border-border-subtle"
            }`}
          >
            {hasStatic ? (
              <>
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-han-ming text-[44px] text-text-primary leading-none">
                    {character}
                  </span>
                  <div className="flex-1 min-w-0 pt-1">
                    {charData!.readings.map((r) => (
                      <div key={r.id} className="mb-1">
                        <span className="text-sm font-bold text-hanviet">
                          {r.hanViet}
                        </span>
                        <span className="text-xs text-pinyin italic ml-1.5">
                          {r.pinyin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {charData!.readings[0]?.meanings[0] && (
                  <>
                    {charData!.readings[0].meanings[0].partOfSpeech && (
                      <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-tag-bg text-accent-tag-text mb-1">
                        {charData!.readings[0].meanings[0].partOfSpeech}
                      </span>
                    )}
                    <p className="text-sm text-text-body leading-relaxed">
                      {charData!.readings[0].meanings[0].definition}
                    </p>
                  </>
                )}

                <p className="text-[11px] text-text-faint mt-2">
                  {totalReadings} âm đọc · {totalMeanings} nghĩa
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/dictionary/${charData!.id}`}
                    className="text-[12px] text-accent-dark hover:underline"
                  >
                    Xem đầy đủ →
                  </Link>
                  {!hasPersonal && (
                    <>
                      <span className="text-text-ghost text-[10px]">·</span>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-[12px] text-accent-dark hover:underline"
                      >
                        ＋ Lưu
                      </button>
                    </>
                  )}
                </div>

                {hasPersonal && (
                  <div className="mt-2 pt-2 border-t border-border-subtle">
                    <p className="text-[10px] text-text-ghost mb-0.5">Ghi chú cá nhân</p>
                    {localPersonal!.notes && (
                      <p className="text-xs text-text-muted">{localPersonal!.notes}</p>
                    )}
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-[11px] text-accent-dark hover:underline mt-1"
                    >
                      Sửa
                    </button>
                  </div>
                )}
              </>
            ) : hasPersonal ? (
              <>
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-han-ming text-[44px] text-text-primary leading-none">
                    {character}
                  </span>
                  <div className="flex-1 min-w-0 pt-1">
                    <span className="text-sm font-bold text-hanviet">
                      {localPersonal!.hanViet}
                    </span>
                    {localPersonal!.pinyin && (
                      <span className="text-xs text-pinyin italic ml-1.5">
                        {localPersonal!.pinyin}
                      </span>
                    )}
                  </div>
                </div>

                {localPersonal!.partOfSpeech && (
                  <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-tag-bg text-accent-tag-text mb-1">
                    {localPersonal!.partOfSpeech}
                  </span>
                )}
                <p className="text-sm text-text-body leading-relaxed">
                  {localPersonal!.definition}
                </p>

                {localPersonal!.notes && (
                  <p className="text-xs text-text-muted mt-1 italic">
                    {localPersonal!.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-accent-gold/70 bg-accent-gold/10 px-1.5 py-0.5 rounded">
                    Từ điển cá nhân
                  </span>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-[12px] text-accent-dark hover:underline ml-auto"
                  >
                    Sửa
                  </button>
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
