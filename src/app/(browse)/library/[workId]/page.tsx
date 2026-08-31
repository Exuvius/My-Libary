"use client";

import { use } from "react";
import Link from "next/link";
import { getWorkById, getChaptersByWorkId, toScript } from "@/lib/mock-data";
import { Tag } from "@/components/ui/Tag";
import { CornerOrnament } from "@/components/ui/CornerOrnament";
import { DividerBrush } from "@/components/ui/DividerBrush";
import { useAppStore } from "@/lib/store";

export default function WorkDetailPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = use(params);
  const work = getWorkById(workId);
  const chapters = getChaptersByWorkId(workId);
  const scriptPreference = useAppStore((s) => s.scriptPreference);

  if (!work) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 text-center text-text-muted">
        Không tìm thấy tác phẩm.
      </div>
    );
  }

  const currentChapter = chapters.find((c) => c.isCurrent);
  const progressPct = Math.round((work.progressPercent || 0) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-dark mb-4"
      >
        ‹ Kệ Sách
      </Link>

      {/* Hero */}
      <div className="relative bg-bg-primary rounded-2xl p-7 border border-border-subtle mb-6">
        <CornerOrnament />
        <div className="text-center">
          <span className="font-han-kai text-[56px] text-text-primary leading-none">
            {work.iconChar}
          </span>
          <h1 className="font-han-kai text-[22px] font-bold text-text-primary mt-3">
            {work.titleViet}
          </h1>
          <p className="text-sm text-text-muted mt-1">{toScript(work.titleHan, scriptPreference)}</p>
          <div className="text-[11px] text-text-faint mt-2">
            {work.chapterCount > 1 && <>{work.chapterCount} chương · </>}
            {work.characterCount > 10000
              ? `${Math.round(work.characterCount / 1000)}k`
              : work.characterCount}{" "}
            chữ
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {work.tags?.map((tag) => (
              <Tag
                key={tag.id}
                label={tag.name}
                variant={tag.category === "language" ? "language" : "default"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Author */}
      {work.author && (
        <div className="bg-bg-primary rounded-2xl p-4 border border-border-subtle mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center shrink-0">
              <span className="font-han-kai text-base text-text-muted">
                {work.author.nameHan?.[0] || work.author.nameViet[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{work.author.nameViet}</p>
              <p className="text-[11px] text-text-faint">
                {work.author.nameHan && <>{work.author.nameHan} · </>}
                {work.author.era}
                {work.author.dynasty && <> · {work.author.dynasty}</>}
              </p>
            </div>
          </div>
          {work.author.bio && (
            <p className="text-xs text-text-muted mt-2 leading-relaxed">{work.author.bio}</p>
          )}
        </div>
      )}

      {/* Source */}
      {work.variantName && (
        <div className="bg-bg-primary rounded-2xl p-4 border border-border-subtle mb-4">
          <p className="text-[11px] text-text-faint uppercase tracking-wider mb-1">
            Xuất xứ văn bản
          </p>
          <p className="text-sm text-text-body">
            {work.sourceInfo}
            {work.variantName && (
              <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-medium bg-bg-secondary text-text-faint rounded">
                {work.variantName}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Chapter list */}
      {chapters.length > 0 && (
        <div className="bg-bg-primary rounded-2xl border border-border-subtle mb-4">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] text-text-faint uppercase tracking-wider">Mục lục</p>
          </div>
          <div>
            {chapters.map((ch, i) => {
              // sectionLabel groups chapters (e.g. "Quốc phong · Chu Nam" in Kinh Thi).
              // Only show the section header when it changes from the previous chapter.
              const prevSection = i > 0 ? chapters[i - 1].sectionLabel : null;
              const showSection = ch.sectionLabel && ch.sectionLabel !== prevSection;
              return (
                <div key={ch.id}>
                  {showSection && (
                    <p className="px-4 pt-3 pb-1 text-[10px] text-text-ghost uppercase tracking-widest">
                      {ch.sectionLabel}
                    </p>
                  )}
                  <Link
                    href={`/read/${workId}?chapter=${ch.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0 transition-colors ${
                      ch.isCurrent
                        ? "bg-bg-subtle"
                        : "hover:bg-bg-subtle"
                    }`}
                  >
                    <span className="text-[11px] text-text-ghost w-6 text-right shrink-0">
                      {ch.chapterNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-han-ming text-sm text-text-primary">
                        {ch.titleHan ? toScript(ch.titleHan, scriptPreference) : ch.titleViet}
                      </span>
                    </div>
                    {ch.isRead && (
                      <span className="text-accent-gold text-sm">✓</span>
                    )}
                    {ch.isCurrent && (
                      <span className="text-[10px] text-accent-dark font-medium">
                        Đang đọc
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue reading button */}
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-2xl mx-auto">
        <Link
          href={`/read/${workId}${currentChapter ? `?chapter=${currentChapter.id}` : ""}`}
          className="block w-full py-3.5 rounded-xl bg-text-body text-bg-primary text-center text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {progressPct > 0 ? "Tiếp tục đọc" : "Bắt đầu đọc"}
        </Link>
        {progressPct > 0 && (
          <p className="text-center text-[11px] text-text-ghost mt-1.5">
            Đã đọc {progressPct}%
          </p>
        )}
      </div>
    </div>
  );
}
