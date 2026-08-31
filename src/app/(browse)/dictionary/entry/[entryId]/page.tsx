"use client";

import { use } from "react";
import Link from "next/link";
import { getEntryById, getRelatedEntries, getCharacterByChar } from "@/lib/mock-data";
import { Tag } from "@/components/ui/Tag";
import { CornerOrnament } from "@/components/ui/CornerOrnament";
import { DividerBrush } from "@/components/ui/DividerBrush";
import { useAppStore } from "@/lib/store";

const entryTypeLabel: Record<string, string> = {
  compound: "Từ ghép",
  idiom: "Thành ngữ",
  specialized: "Chuyên ngành",
};

export default function EntryDetailPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = use(params);
  const entry = getEntryById(entryId);

  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 text-center text-text-muted">
        Không tìm thấy mục từ.
      </div>
    );
  }

  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const useSimplified = scriptPreference === "simplified";
  const related = getRelatedEntries(entry);
  const displayText = useSimplified && entry.textSimplified ? entry.textSimplified : entry.textTraditional;
  const chars = [...displayText];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
      <Link
        href="/dictionary"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-dark mb-4"
      >
        ‹ Từ Điển
      </Link>

      {/* Hero */}
      <div className="relative bg-bg-primary rounded-2xl p-7 border border-border-subtle mb-5">
        <CornerOrnament />
        <div className="text-center">
          <span className="font-han-ming text-[56px] text-text-primary leading-none tracking-[0.1em]">
            {displayText}
          </span>
          {entry.textSimplified && entry.textSimplified !== entry.textTraditional && (
            <span className="block font-han-ming text-[24px] text-text-ghost mt-1">
              {useSimplified ? entry.textTraditional : entry.textSimplified}
            </span>
          )}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-lg font-bold text-hanviet">{entry.hanViet}</span>
            {entry.pinyin && (
              <span className="text-sm text-pinyin italic">{entry.pinyin}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Tag label={entryTypeLabel[entry.entryType] || entry.entryType} />
            {entry.specializedCategory && (
              <Tag label={entry.specializedCategory} />
            )}
          </div>
        </div>
      </div>

      {/* Definition */}
      <div className="bg-bg-primary rounded-2xl border border-border-subtle p-4 mb-5">
        <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
          Nghĩa
        </p>
        <p className="text-sm text-text-body leading-relaxed">{entry.definition}</p>
        {entry.notes && (
          <p className="text-xs text-text-muted mt-2 italic">{entry.notes}</p>
        )}
      </div>

      {/* Character breakdown */}
      <div className="bg-bg-primary rounded-2xl border border-border-subtle p-4 mb-5">
        <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-3">
          Thành phần chữ
        </p>
        <div className="flex flex-wrap gap-2">
          {[...entry.textTraditional].map((tradCh, i) => {
            const charData = getCharacterByChar(tradCh);
            const displayCh = useSimplified && charData?.simplified ? charData.simplified : tradCh;
            const hanViet = charData?.readings[0]?.hanViet;
            const meaning = charData?.readings[0]?.meanings[0]?.definition;

            const inner = (
              <div
                key={i}
                className="flex flex-col items-center py-3 px-4 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-subtle transition-colors min-w-[72px]"
              >
                <span className="font-han-ming text-[36px] text-text-primary leading-none">
                  {displayCh}
                </span>
                {hanViet && (
                  <span className="text-[11px] text-hanviet font-bold mt-1.5">
                    {hanViet}
                  </span>
                )}
                {meaning && (
                  <span className="text-[10px] text-text-muted mt-0.5 text-center max-w-[80px] line-clamp-2">
                    {meaning}
                  </span>
                )}
              </div>
            );

            if (charData) {
              return (
                <Link key={i} href={`/dictionary/${charData.id}`}>
                  {inner}
                </Link>
              );
            }
            return inner;
          })}
        </div>
      </div>

      {/* Related entries */}
      {related.length > 0 && (
        <>
          <DividerBrush className="my-5" />
          <div>
            <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-3">
              Từ liên quan
            </p>
            <div className="space-y-2">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/dictionary/entry/${rel.id}`}
                  className="block p-3 rounded-xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-han-ming text-lg text-text-primary">
                      {useSimplified && rel.textSimplified ? rel.textSimplified : rel.textTraditional}
                    </span>
                    <span className="text-sm font-bold text-hanviet">
                      {rel.hanViet}
                    </span>
                    {rel.pinyin && (
                      <span className="text-xs text-pinyin italic">{rel.pinyin}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-body mt-1 line-clamp-2">
                    {rel.definition}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    <Tag label={entryTypeLabel[rel.entryType] || rel.entryType} />
                    {rel.specializedCategory && (
                      <Tag label={rel.specializedCategory} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
