"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { works, getTagsByCategory, toScript } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { TagCategory } from "@/types/library";

const categoryTabs: { key: TagCategory; label: string }[] = [
  { key: "type", label: "Loại hình" },
  { key: "genre", label: "Thể loại" },
  { key: "era", label: "Thời kỳ" },
  { key: "language", label: "Ngôn ngữ" },
];

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState<TagCategory>("type");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const scriptPreference = useAppStore((s) => s.scriptPreference);

  const categoryTags = getTagsByCategory(activeCategory);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagName)) next.delete(tagName);
      else next.add(tagName);
      return next;
    });
  };

  // Filter is AND-based: selecting multiple tags requires a work to have ALL of them
  const filteredWorks = works.filter((w) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !w.titleViet.toLowerCase().includes(q) &&
        !w.titleHan.includes(q) &&
        !w.author?.nameViet.toLowerCase().includes(q)
      )
        return false;
    }
    if (selectedTags.size > 0) {
      const workTagNames = w.tags?.map((t) => t.name) || [];
      for (const st of selectedTags) {
        if (!workTagNames.includes(st)) return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <h1 className="font-han-kai text-[22px] font-bold text-text-primary mb-4">
        Kệ Sách
      </h1>

      <input
        type="text"
        placeholder="Tìm tác phẩm, tác giả..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-main text-text-body text-sm placeholder:text-text-ghost focus:outline-none focus:border-accent-gold transition-colors mb-4"
      />

      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {categoryTabs.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? "bg-text-body text-bg-primary"
                : "text-text-muted hover:bg-bg-subtle"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {categoryTags.map((tag) => (
          <Tag
            key={tag.id}
            label={tag.name}
            variant={tag.category === "language" ? "language" : "default"}
            active={selectedTags.has(tag.name)}
            onClick={() => toggleTag(tag.name)}
          />
        ))}
        {selectedTags.size > 0 && (
          <button
            onClick={() => setSelectedTags(new Set())}
            className="text-[11px] text-text-ghost hover:text-text-muted px-2"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredWorks.map((work) => (
          <Link
            key={work.id}
            href={`/library/${work.id}`}
            className="block p-4 rounded-2xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
          >
            <p className="font-han-ming text-[26px] text-text-primary leading-snug tracking-[2px]">
              {toScript(work.titleHan, scriptPreference)}
            </p>

            <div className="text-[11px] text-text-faint mt-1.5">
              {work.author?.nameViet}
              {work.chapterCount > 1 && <> · {work.chapterCount} chương</>}
              {" · "}
              {work.characterCount > 10000
                ? `${Math.round(work.characterCount / 1000)}k`
                : work.characterCount}{" "}
              chữ
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {work.tags?.map((tag) => (
                <Tag
                  key={tag.id}
                  label={tag.name}
                  variant={tag.category === "language" ? "language" : "default"}
                />
              ))}
            </div>

            {work.progressPercent !== undefined && work.progressPercent > 0 && (
              <div className="mt-2.5 h-[3px] bg-border-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-gold rounded-full transition-all"
                  style={{ width: `${Math.round(work.progressPercent * 100)}%` }}
                />
              </div>
            )}
          </Link>
        ))}

        {filteredWorks.length === 0 && (
          <p className="text-center text-text-ghost text-sm py-12">
            Không tìm thấy tác phẩm phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}
