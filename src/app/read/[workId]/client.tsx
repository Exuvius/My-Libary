"use client";

import { use, useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { getWorkById, sampleAnnotations, sampleComments, characters, toScript, toTraditional } from "@/lib/mock-data";
import { loadChapters, loadChapterContent } from "@/lib/book-loader";
import { getAllDictEntries } from "@/lib/personal-db";
import type { Chapter, Sentence, Annotation } from "@/types/library";
import { FABPanel } from "@/components/reading/FABPanel";
import { CharTooltip } from "@/components/reading/CharTooltip";
import { DividerBrush } from "@/components/ui/DividerBrush";
import { useAppStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import type { PersonalDictEntry } from "@/types/personal";

const charLookup = new Map(characters.map((c) => [c.traditional, c]));
const charLookupSimp = new Map(
  characters.filter((c) => c.simplified && c.simplified !== c.traditional)
    .map((c) => [c.simplified!, c])
);

function ReadingContent({ workId }: { workId: string }) {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapter");
  const toggles = useAppStore((s) => s.toggles);
  const fontPreference = useAppStore((s) => s.fontPreference);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const textAlign = useAppStore((s) => s.textAlign);
  const fontClass = fontPreference === "kai" ? "font-han-kai" : fontPreference === "gothic" ? "font-han-hei" : "font-han-ming";
  const alignClass = textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start";

  const [personalDict, setPersonalDict] = useState<Map<string, PersonalDictEntry>>(new Map());
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDictEntries().then((entries) => {
      setPersonalDict(new Map(entries.map((e) => [e.text, e])));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    loadChapters(workId).then((chs) => {
      setAllChapters(chs);
      setLoading(false);
    });
  }, [workId]);

  const chapter = chapterId
    ? allChapters.find((c) => c.id === chapterId)
    : allChapters[0];

  useEffect(() => {
    if (!chapter) { setSentences([]); return; }
    loadChapterContent(workId, chapter.id).then((data) => {
      setSentences(data.sentences);
    });
  }, [workId, chapter?.id]);

  const work = getWorkById(workId);

  const wrapClass = [
    "reading-wrap",
    toggles.pinyin && "show-pinyin",
    toggles.hanViet && "show-hanviet",
    toggles.translation && "show-translation",
    toggles.annotations && "show-annotations",
    toggles.comments && "show-comments",
    toggles.highlightUnknown && "show-highlight",
  ].filter(Boolean).join(" ");

  const renderedSentences = useMemo(() => {
    const annots = sampleAnnotations.filter((a) =>
      sentences.some((s) => s.id === a.sentenceId)
    );
    const cmts = sampleComments.filter((c) =>
      sentences.some((s) => s.id === c.sentenceId)
    );

    const renderChar = (ch: string, idx: number) => {
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
      const pEntry = personalDict.get(ch);
      const pinyinText = reading?.pinyin || pEntry?.pinyin;
      const hanVietText = reading?.hanViet || pEntry?.hanViet;
      const hasData = !!(charData || pEntry);

      const inner = (
        <span className="inline-block text-center">
          <span className={`ruby-row block text-[9.5px] leading-tight mb-0.5${hasData ? "" : " opacity-0"}`}>
            {pinyinText
              ? <span className="ruby-pinyin text-pinyin italic block">{pinyinText}</span>
              : <span className="ruby-pinyin block opacity-0">·</span>}
            {hanVietText
              ? <span className="ruby-hanviet text-hanviet block">{hanVietText}</span>
              : <span className="ruby-hanviet block opacity-0">·</span>}
          </span>
          <span className={`text-[20px] leading-snug${hasData ? "" : " char-unknown"}`}>{displayChar}</span>
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
          {inner}
        </CharTooltip>
      );
    };

    return sentences.map((sentence, sIdx) => {
      const sentAnnotations = annots.filter((a) => a.sentenceId === sentence.id);
      const sentComments = cmts.filter((c) => c.sentenceId === sentence.id);
      const showNewParagraph =
        sIdx > 0 &&
        sentence.paragraphGroup !== sentences[sIdx - 1].paragraphGroup;

      return (
        <div key={sentence.id} className={showNewParagraph ? "mt-8" : "mt-4"}>
          <div className={`sentence-chars flex flex-wrap items-end tracking-wide leading-loose relative ${fontClass} ${alignClass}`}>
            {sentAnnotations.length > 0 && (
              <span className="sent-annot-dot absolute -left-3 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-accent-gold" />
            )}
            {sentence.textTraditional.split("").map((ch, i) => renderChar(ch, i))}
          </div>

          {sentence.translation && (
            <p className="sent-translation text-sm text-text-muted italic mt-1.5 leading-relaxed">
              {sentence.translation}
            </p>
          )}

          {sentAnnotations.map((ann) => (
            <div
              key={ann.id}
              className="sent-annotation mt-2 rounded-r-lg border-l-[3px] border-annotation-border bg-annotation-bg px-3 py-2"
            >
              <p className="text-[10px] text-accent-gold uppercase tracking-wider font-semibold mb-1">
                CHÚ GIẢI
              </p>
              <p className="text-xs text-text-body leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}

          {sentComments.map((comment) => (
            <div
              key={comment.id}
              className="sent-comment mt-2 rounded-r-lg border-l-[3px] border-comment-border bg-comment-bg px-3 py-2"
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
    });
  }, [sentences, personalDict, scriptPreference, fontClass, alignClass]);

  if (!work) {
    return (
      <div className="pt-20 text-center text-text-muted">Không tìm thấy tác phẩm.</div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 text-center text-text-ghost">Đang tải dữ liệu...</div>
    );
  }

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

      {/* Sentences — CSS-driven toggle visibility for instant switching */}
      <div className={`max-w-2xl mx-auto px-4 pb-20 ${wrapClass}`}>
        {renderedSentences}

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
