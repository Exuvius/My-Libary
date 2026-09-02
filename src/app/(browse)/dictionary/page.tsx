"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { characters, entries, radicals, toTraditional } from "@/lib/mock-data";
import { Tag } from "@/components/ui/Tag";
import { useAppStore } from "@/lib/store";
import type { EntryType } from "@/types/dictionary";

type DictTab = "single" | "compound" | "idiom" | "specialized";

const dictTabs: { key: DictTab; label: string }[] = [
  { key: "single", label: "Đơn tự" },
  { key: "compound", label: "Từ ghép" },
  { key: "idiom", label: "Thành ngữ" },
  { key: "specialized", label: "Chuyên ngành" },
];

const entryTypeMap: Record<DictTab, EntryType | null> = {
  single: null,
  compound: "compound",
  idiom: "idiom",
  specialized: "specialized",
};

const strokeGroups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const BATCH_SIZE = 60;

const specializedCategories = Array.from(
  new Set(entries.filter(e => e.entryType === "specialized" && e.specializedCategory).map(e => e.specializedCategory!))
);

const tabCounts: Record<DictTab, number> = {
  single: characters.length,
  compound: entries.filter(e => e.entryType === "compound" || e.entryType === "specialized").length,
  idiom: entries.filter(e => e.entryType === "idiom").length,
  specialized: entries.filter(e => e.entryType === "specialized").length,
};

const sortedCharacters = [...characters].sort((a, b) => {
  const aHv = a.readings[0]?.hanViet?.toLowerCase() || "";
  const bHv = b.readings[0]?.hanViet?.toLowerCase() || "";
  return aHv.localeCompare(bHv, "vi");
});

export default function DictionaryPage() {
  const [activeTab, setActiveTab] = useState<DictTab>("single");
  const [search, setSearch] = useState("");
  const [showRadical, setShowRadical] = useState(false);
  const [selectedStroke, setSelectedStroke] = useState<number | null>(null);
  const [selectedRadical, setSelectedRadical] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const useSimplified = scriptPreference === "simplified";

  const resetVisible = useCallback(() => setVisibleCount(BATCH_SIZE), []);

  const filteredRadicals = selectedStroke
    ? radicals.filter((r) => r.strokeCount === selectedStroke)
    : radicals;

  const filteredCharacters = useMemo(() => {
    const isCJK = (ch: string) => ch.charCodeAt(0) >= 0x3400;
    return sortedCharacters.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const qTrad = toTraditional(search);
        const cjkChars = [...new Set([...search, ...qTrad])].filter(isCJK);
        const isMultiCJK = cjkChars.length >= 2;

        if (isMultiCJK) {
          if (
            !cjkChars.includes(c.traditional) &&
            !(c.simplified && cjkChars.includes(c.simplified))
          )
            return false;
        } else if (cjkChars.length === 1) {
          if (c.traditional !== cjkChars[0] && c.simplified !== cjkChars[0])
            return false;
        } else {
          if (
            !c.readings.some(
              (r) =>
                r.hanViet.toLowerCase().includes(q) ||
                r.pinyin.toLowerCase().includes(q)
            )
          )
            return false;
        }
      }
      if (selectedRadical) {
        if (c.radicalId !== selectedRadical) return false;
      }
      return true;
    });
  }, [search, selectedRadical]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (activeTab === "compound") {
        if (e.entryType !== "compound" && e.entryType !== "specialized") return false;
      } else {
        const entryType = entryTypeMap[activeTab];
        if (entryType && e.entryType !== entryType) return false;
      }
      if (selectedCategory && e.specializedCategory !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const qTrad = toTraditional(search);
        if (
          !e.textTraditional.includes(q) &&
          !e.textTraditional.includes(qTrad) &&
          !e.textSimplified?.includes(q) &&
          !e.hanViet.toLowerCase().includes(q) &&
          !e.definition.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [activeTab, selectedCategory, search]);

  const currentList = activeTab === "single" ? filteredCharacters : filteredEntries;
  const totalCount = currentList.length;
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    resetVisible();
  }, [search, selectedRadical, activeTab, selectedCategory, resetVisible]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, totalCount));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, totalCount]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <h1 className="font-han-kai text-[22px] font-bold text-text-primary mb-4">
        Từ Điển
      </h1>

      <input
        type="text"
        placeholder="Tìm chữ, âm Hán Việt, pinyin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-main text-text-body text-sm placeholder:text-text-ghost focus:outline-none focus:border-accent-gold transition-colors mb-4"
      />

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {dictTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setShowRadical(false);
              setSelectedCategory(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-text-body text-bg-primary"
                : "text-text-muted hover:bg-bg-subtle"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-60">
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Radical lookup for single characters */}
      {activeTab === "single" && (
        <div className="mb-4">
          <button
            onClick={() => setShowRadical(!showRadical)}
            className="text-xs text-accent-dark hover:underline mb-2"
          >
            {showRadical ? "Ẩn tra bộ thủ" : "Tra theo bộ thủ"}
          </button>

          {showRadical && (
            <div className="bg-bg-primary rounded-2xl border border-border-subtle p-3 mb-3">
              <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
                Số nét
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {strokeGroups.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedStroke(selectedStroke === n ? null : n)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      selectedStroke === n
                        ? "bg-accent-gold text-white"
                        : "bg-bg-secondary text-text-muted hover:bg-bg-subtle"
                    }`}
                  >
                    {n}{n === 10 ? "+" : ""}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-2">
                Bộ thủ
              </p>
              <div className="grid grid-cols-6 gap-1">
                {filteredRadicals.map((rad) => (
                  <button
                    key={rad.id}
                    onClick={() =>
                      setSelectedRadical(selectedRadical === rad.id ? null : rad.id)
                    }
                    className={`flex flex-col items-center py-1.5 rounded-lg transition-colors ${
                      selectedRadical === rad.id
                        ? "bg-accent-gold/10 border border-accent-gold"
                        : "hover:bg-bg-subtle"
                    }`}
                  >
                    <span className="font-han-ming text-[22px] text-text-primary leading-none">
                      {rad.character}
                    </span>
                    <span className="text-[9.5px] text-text-faint mt-0.5">{rad.hanViet}</span>
                  </button>
                ))}
              </div>

              {selectedRadical && (
                <button
                  onClick={() => setSelectedRadical(null)}
                  className="text-[11px] text-text-ghost hover:text-text-muted mt-2"
                >
                  Xóa lọc bộ thủ
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Character list */}
      {activeTab === "single" && (
        <div className="space-y-2">
          {filteredCharacters.slice(0, visibleCount).map((char) => (
            <Link
              key={char.id}
              href={`/dictionary/${char.id}`}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
            >
              <span className="font-han-ming text-[36px] text-text-primary leading-none w-12 text-center">
                {useSimplified && char.simplified ? char.simplified : char.traditional}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {char.readings.map((r) => (
                    <span key={r.id} className="text-sm">
                      <span className="font-bold text-hanviet">{r.hanViet}</span>
                      <span className="text-pinyin text-xs italic ml-1">{r.pinyin}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {char.readings[0]?.meanings[0]?.definition}
                </p>
                <div className="flex gap-1 mt-1">
                  {char.radical && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-faint">
                      {char.radical.character} {char.radical.hanViet}
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-faint">
                    {char.strokeCount} nét
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Category filter for specialized entries */}
      {activeTab === "specialized" && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specializedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-text-body text-bg-primary"
                  : "bg-bg-secondary text-text-muted hover:bg-bg-subtle"
              }`}
            >
              {cat}
              <span className="ml-1 text-[10px] opacity-60">
                {entries.filter(e => e.specializedCategory === cat).length}
              </span>
            </button>
          ))}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-text-ghost hover:text-text-muted px-2"
            >
              Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Entry list (compound, idiom, specialized) */}
      {activeTab !== "single" && (
        <div className="space-y-2">
          {filteredEntries.slice(0, visibleCount).map((entry) => (
            <Link
              key={entry.id}
              href={`/dictionary/entry/${entry.id}`}
              className="block p-3 rounded-2xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-han-ming text-lg text-text-primary">
                  {useSimplified && entry.textSimplified ? entry.textSimplified : entry.textTraditional}
                </span>
                <span className="text-sm font-bold text-hanviet">{entry.hanViet}</span>
                {entry.pinyin && (
                  <span className="text-xs text-pinyin italic">{entry.pinyin}</span>
                )}
              </div>
              <p className="text-xs text-text-body mt-1">{entry.definition}</p>
              <div className="flex gap-1 mt-1.5">
                <Tag
                  label={
                    entry.entryType === "compound"
                      ? "Từ ghép"
                      : entry.entryType === "idiom"
                      ? "Thành ngữ"
                      : "Chuyên ngành"
                  }
                />
                {entry.specializedCategory && (
                  <Tag label={entry.specializedCategory} />
                )}
              </div>
            </Link>
          ))}
          {filteredEntries.length === 0 && (
            <p className="text-center text-text-ghost text-sm py-12">
              Không tìm thấy mục từ phù hợp.
            </p>
          )}
        </div>
      )}

      {/* Load more sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="py-6 text-center text-xs text-text-ghost"
        >
          Đang tải thêm... ({totalCount - visibleCount} mục còn lại)
        </div>
      )}
    </div>
  );
}
