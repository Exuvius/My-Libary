"use client";

import { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { getWorkById, getChaptersByWorkId, getSentencesByChapterId, sampleAnnotations, sampleComments, characters, toScript, toTraditional } from "@/lib/mock-data";
import { LAZY_WORK_IDS, loadLazyWorkData } from "@/data/lazy-works";
import { getAllDictEntries } from "@/lib/personal-db";
import type { Chapter, Sentence } from "@/types/library";
import { FABPanel } from "@/components/reading/FABPanel";
import { CharTooltip } from "@/components/reading/CharTooltip";
import { DividerBrush } from "@/components/ui/DividerBrush";
import { useAppStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import type { PersonalDictEntry } from "@/types/personal";

function ReadingContent({ workId }: { workId: string }) {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapter");
  const toggles = useAppStore((s) => s.toggles);
  const fontPreference = useAppStore((s) => s.fontPreference);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const textAlign = useAppStore((s) => s.textAlign);
  const fontClass = fontPreference === "kai" ? "font-han-kai" : fontPreference === "gothic" ? "font-han-hei" : "font-han-ming";
  const rubyActive = toggles.hanViet || toggles.pinyin;
  const alignClass = textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start";

  const [personalDict, setPersonalDict] = useState<Map<string, PersonalDictEntry>>(new Map());
  const [lazyChapters, setLazyChapters] = useState<Chapter[] | null>(null);
  const [lazySentences, setLazySentences] = useState<Sentence[] | null>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
  const isLazy = LAZY_WORK_IDS.has(workId);

  useEffect(() => {
    getAllDictEntries().then((entries) => {
      setPersonalDict(new Map(entries.map((e) => [e.text, e])));
    });
  }, []);

  useEffect(() => {
    if (!isLazy) return;
    setLazyLoading(true);
    loadLazyWorkData(workId).then((data) => {
      if (data) {
        setLazyChapters(data.chapters);
        setLazySentences(data.sentences);
      }
      setLazyLoading(false);
    });
  }, [workId, isLazy]);

  const work = getWorkById(workId);
  const allChapters = isLazy ? (lazyChapters || []) : getChaptersByWorkId(workId);
  const chapter = chapterId
    ? allChapters.find((c) => c.id === chapterId)
    : allChapters[0];
  const sentences = chapter
    ? (isLazy
        ? (lazySentences || []).filter((s) => s.chapterId === chapter.id)
        : getSentencesByChapterId(chapter.id))
    : [];

  if (!work) {
    return (
      <div className="pt-20 text-center text-text-muted">Không tìm thấy tác phẩm.</div>
    );
  }

  if (isLazy && lazyLoading) {
    return (
      <div className="pt-20 text-center text-text-ghost">Đang tải dữ liệu...</div>
    );
  }

  // Pre-index ~3900 characters by traditional AND simplified form for O(1) lookup
  const charLookup = new Map(characters.map((c) => [c.traditional, c]));
  const charLookupSimp = new Map(
    characters.filter((c) => c.simplified && c.simplified !== c.traditional)
      .map((c) => [c.simplified!, c])
  );

  const renderChar = (ch: string, idx: number, sentence: (typeof sentences)[0]) => {
    // CJK punctuation rendered without tooltip or ruby — just styled differently
    if (/[，。、；：！？「」『』（）\s]/.test(ch)) {
      return (
        <span key={idx} className="text-text-muted">
          {ch}
        </span>
      );
    }

    const charData = charLookup.get(ch) || charLookupSimp.get(ch) || charLookup.get(toTraditional(ch));
    const displayChar = scriptPreference === "simplified"
      ? (charData?.simplified || ch)
      : (charData?.traditional || ch);
    const reading = charData?.readings[0];
    const meaning = reading?.meanings[0];

    const rubyContent = (
      <span className="inline-block text-center">
        {(toggles.pinyin || toggles.hanViet) && (
          <span className="block text-[9.5px] leading-tight mb-0.5">
            {toggles.pinyin && reading && (
              <span className="text-pinyin italic block">{reading.pinyin}</span>
            )}
            {toggles.hanViet && reading && (
              <span className="text-hanviet block">{reading.hanViet}</span>
            )}
          </span>
        )}
        <span className="text-[20px] leading-snug">{displayChar}</span>
      </span>
    );

    const pEntry = personalDict.get(ch);

    if (charData || pEntry) {
      const pinyinRuby = reading?.pinyin || pEntry?.pinyin;
      const hanVietRuby = reading?.hanViet || pEntry?.hanViet;

      const rubyContentWithPersonal = (
        <span className="inline-block text-center">
          {(toggles.pinyin || toggles.hanViet) && (
            <span className="block text-[9.5px] leading-tight mb-0.5">
              {toggles.pinyin && pinyinRuby && (
                <span className="text-pinyin italic block">{pinyinRuby}</span>
              )}
              {toggles.hanViet && hanVietRuby && (
                <span className="text-hanviet block">{hanVietRuby}</span>
              )}
              {!pinyinRuby && toggles.pinyin && !toggles.hanViet && (
                <span className="block opacity-0">·</span>
              )}
              {!hanVietRuby && toggles.hanViet && !toggles.pinyin && (
                <span className="block opacity-0">·</span>
              )}
            </span>
          )}
          <span className="text-[20px] leading-snug">{displayChar}</span>
        </span>
      );

      return (
        <CharTooltip
          key={idx}
          character={charData?.traditional || ch}
          hanViet={reading?.hanViet}
          pinyin={reading?.pinyin}
          partOfSpeech={meaning?.partOfSpeech}
          definition={meaning?.definition}
          charId={charData?.id}
          personalEntry={pEntry}
        >
          {rubyContentWithPersonal}
        </CharTooltip>
      );
    }

    const unknownHighlight = toggles.highlightUnknown
      ? "bg-red-500/15 rounded-sm ring-1 ring-red-400/40"
      : "";

    return (
      <CharTooltip key={idx} character={ch} personalEntry={pEntry}>
        <span className="inline-block text-center">
          {(toggles.pinyin || toggles.hanViet) && (
            <span className="block text-[9.5px] leading-tight mb-0.5 opacity-0">
              {toggles.pinyin && <span className="block">·</span>}
              {toggles.hanViet && <span className="block">·</span>}
            </span>
          )}
          <span className={`text-[20px] leading-snug ${unknownHighlight}`}>{displayChar}</span>
        </span>
      </CharTooltip>
    );
  };

  const annotations = sampleAnnotations.filter((a) =>
    sentences.some((s) => s.id === a.sentenceId)
  );
  const comments = sampleComments.filter((c) =>
    sentences.some((s) => s.id === c.sentenceId)
  );

  return (
    <>
      {/* Topbar */}
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-border-main">
        <div className="flex items-center h-12 px-4 max-w-2xl mx-auto">
          <Link
            href={`/library/${workId}`}
            className="text-text-muted hover:text-accent-dark text-sm mr-3"
          >
            ‹
          </Link>
          <h1 className="flex-1 text-center font-han-kai text-sm text-text-primary truncate title-classical">
            {toScript(work.titleHan, scriptPreference)}
          </h1>
          <span className="w-6" />
        </div>
      </div>

      {/* Chapter header */}
      {chapter && (
        <div className="text-center py-8 px-4">
          <p className="text-[11px] text-accent-gold uppercase tracking-[2px] font-medium">
            THIÊN {chapter.chapterNumber}
          </p>
          <h2 className="font-han-ming text-[22px] font-bold text-text-primary mt-2">
            {chapter.titleHan ? toScript(chapter.titleHan, scriptPreference) : chapter.titleViet}
          </h2>
        </div>
      )}

      {/* Sentences */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {sentences.map((sentence, sIdx) => {
          const sentAnnotations = annotations.filter(
            (a) => a.sentenceId === sentence.id
          );
          const sentComments = comments.filter(
            (c) => c.sentenceId === sentence.id
          );
          // paragraphGroup groups sentences into stanzas/paragraphs — a change
          // in group number inserts extra vertical space (mt-8 vs mt-4)
          const showNewParagraph =
            sIdx > 0 &&
            sentence.paragraphGroup !== sentences[sIdx - 1].paragraphGroup;

          return (
            <div key={sentence.id} className={showNewParagraph ? "mt-8" : "mt-4"}>
              {/* Main text */}
              <div className={`flex flex-wrap items-end tracking-wide leading-loose relative ${fontClass} ${alignClass} ${rubyActive ? "gap-x-[6px] gap-y-1" : "gap-x-[2px]"}`}>
                {toggles.annotations &&
                  sentAnnotations.length > 0 && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-accent-gold" />
                  )}
                {sentence.textTraditional.split("").map((ch, i) =>
                  renderChar(ch, i, sentence)
                )}
              </div>

              {/* Translation */}
              {toggles.translation && sentence.translation && (
                <p className="text-sm text-text-muted italic mt-1.5 leading-relaxed">
                  {sentence.translation}
                </p>
              )}

              {/* Annotations */}
              {toggles.annotations &&
                sentAnnotations.map((ann) => (
                  <div
                    key={ann.id}
                    className="mt-2 rounded-r-lg border-l-[3px] border-annotation-border bg-annotation-bg px-3 py-2"
                  >
                    <p className="text-[10px] text-accent-gold uppercase tracking-wider font-semibold mb-1">
                      CHÚ GIẢI
                    </p>
                    <p className="text-xs text-text-body leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}

              {/* Comments */}
              {toggles.comments &&
                sentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="mt-2 rounded-r-lg border-l-[3px] border-comment-border bg-comment-bg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-bg-secondary flex items-center justify-center">
                        <span className="text-[10px] text-text-faint">
                          {comment.userName?.[0]}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-comment-text">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-text-ghost">
                        {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-xs text-comment-text leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
            </div>
          );
        })}

        {sentences.length === 0 && (
          <p className="text-center text-text-ghost text-sm py-20">
            Chưa có nội dung cho chương này.
          </p>
        )}

        {/* Chapter navigation */}
        {chapter && allChapters.length > 1 && (
          <>
            <DividerBrush className="my-8" />
            <div className="flex items-center justify-between gap-2 pb-8">
              {(() => {
                const idx = allChapters.findIndex((c) => c.id === chapter.id);
                const prev = idx > 0 ? allChapters[idx - 1] : null;
                const next = idx < allChapters.length - 1 ? allChapters[idx + 1] : null;
                return (
                  <>
                    <div className="flex-1 min-w-0">
                      {prev && (
                        <Link
                          href={`/read/${workId}?chapter=${prev.id}`}
                          className="text-xs text-accent-dark hover:underline"
                        >
                          ‹ Trước
                        </Link>
                      )}
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-[10px] text-text-ghost">
                        Thiên {chapter.chapterNumber} / {allChapters.length}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      {next && (
                        <Link
                          href={`/read/${workId}?chapter=${next.id}`}
                          className="text-xs text-accent-dark hover:underline"
                        >
                          Sau ›
                        </Link>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <FABPanel />
    </>
  );
}

// Suspense boundary required because ReadingContent uses useSearchParams(),
// which needs a client-side Suspense wrapper in Next.js App Router
export default function ReadPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = use(params);
  return (
    <Suspense fallback={<div className="pt-20 text-center text-text-ghost">Đang tải...</div>}>
      <ReadingContent workId={workId} />
    </Suspense>
  );
}
