"use client";

import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDocument, getDocumentsByCollection, getAllDictEntries } from "@/lib/personal-db";
import { characters, toTraditional } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { FABPanel } from "@/components/reading/FABPanel";
import { PersonalCharTooltip } from "@/components/personal/PersonalCharTooltip";
import type { PersonalDocument, PersonalDictEntry } from "@/types/personal";

const BATCH_SIZE = 30;

function PersonalReadingContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");
  const [doc, setDoc] = useState<PersonalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [siblings, setSiblings] = useState<PersonalDocument[]>([]);
  const [showTOC, setShowTOC] = useState(false);
  const [personalDict, setPersonalDict] = useState<Map<string, PersonalDictEntry>>(new Map());

  const fontPreference = useAppStore((s) => s.fontPreference);
  const textAlign = useAppStore((s) => s.textAlign);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const toggles = useAppStore((s) => s.toggles);

  const fontClass =
    fontPreference === "kai"
      ? "font-han-kai"
      : fontPreference === "gothic"
      ? "font-han-hei"
      : "font-han-ming";

  const alignClass =
    textAlign === "center"
      ? "justify-center"
      : textAlign === "right"
      ? "justify-end"
      : "justify-start";

  const rubyActive = toggles.hanViet || toggles.pinyin;

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    restoredRef.current = false;
    setShowTOC(false);
    window.scrollTo(0, 0);
    const pos = (() => {
      try {
        const v = localStorage.getItem(`handien-pos:${docId}`);
        return v ? parseInt(v) : 0;
      } catch {
        return 0;
      }
    })();
    setRenderedCount(Math.max(BATCH_SIZE, pos + BATCH_SIZE));
    getDocument(docId).then((d) => {
      setDoc(d || null);
      setLoading(false);
    });
  }, [docId]);

  useEffect(() => {
    if (!doc?.collectionId) return;
    getDocumentsByCollection(doc.collectionId).then((docs) => {
      setSiblings(docs.sort((a, b) => a.sortOrder - b.sortOrder));
    });
  }, [doc]);

  useEffect(() => {
    if (!doc?.collectionId || !docId) return;
    try {
      localStorage.setItem(`handien-last-read:${doc.collectionId}`, docId);
    } catch {}
  }, [doc, docId]);

  useEffect(() => {
    getAllDictEntries().then((entries) => {
      setPersonalDict(new Map(entries.map((e) => [e.text, e])));
    });
  }, []);

  const charLookup = useMemo(() => {
    const byTrad = new Map(characters.map((c) => [c.traditional, c]));
    const bySimp = new Map(
      characters
        .filter((c) => c.simplified && c.simplified !== c.traditional)
        .map((c) => [c.simplified!, c])
    );
    return { byTrad, bySimp };
  }, []);

  const paragraphs = useMemo(() => {
    if (!doc) return [];
    return doc.contentText.split(/\n+/).filter((p) => p.trim().length > 0);
  }, [doc]);

  // Lazy loading
  const savedIdx = docId
    ? (() => {
        try {
          const v = localStorage.getItem(`handien-pos:${docId}`);
          return v ? parseInt(v) : 0;
        } catch {
          return 0;
        }
      })()
    : 0;

  const [renderedCount, setRenderedCount] = useState(
    Math.max(BATCH_SIZE, savedIdx + BATCH_SIZE)
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || renderedCount >= paragraphs.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderedCount((prev) =>
            Math.min(prev + BATCH_SIZE, paragraphs.length)
          );
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [paragraphs.length, renderedCount]);

  // Restore reading position
  useEffect(() => {
    if (loading || !doc || restoredRef.current || !docId) return;
    restoredRef.current = true;
    if (savedIdx > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.querySelector(`[data-para-idx="${savedIdx}"]`);
          el?.scrollIntoView({ behavior: "instant", block: "start" });
        }, 100);
      });
    }
  }, [loading, doc, docId, savedIdx]);

  // Save reading position on scroll
  useEffect(() => {
    if (!docId || loading) return;
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const els = document.querySelectorAll("[data-para-idx]");
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= -50) {
            try {
              localStorage.setItem(
                `handien-pos:${docId}`,
                el.getAttribute("data-para-idx")!
              );
            } catch {}
            break;
          }
        }
      }, 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [docId, loading]);

  const currentIdx = siblings.findIndex((s) => s.id === docId);
  const prevDoc = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextDoc =
    currentIdx >= 0 && currentIdx < siblings.length - 1
      ? siblings[currentIdx + 1]
      : null;

  useEffect(() => {
    if (!showTOC) return;
    requestAnimationFrame(() => {
      const el = document.querySelector('[data-toc-active="true"]');
      el?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  }, [showTOC]);

  if (loading) {
    return (
      <div className="pt-20 text-center text-text-ghost">Đang tải...</div>
    );
  }

  if (!doc) {
    return (
      <div className="pt-20 text-center text-text-muted">
        Không tìm thấy tài liệu.
      </div>
    );
  }

  const renderChar = (ch: string, idx: number) => {
    if (/[，。、；：！？「」『』（）〈〉《》【】\s]/.test(ch)) {
      return (
        <span key={idx} className="text-text-muted">
          {ch}
        </span>
      );
    }

    const charData =
      charLookup.byTrad.get(ch) || charLookup.bySimp.get(ch) || charLookup.byTrad.get(toTraditional(ch));
    const pEntry = personalDict.get(ch);

    const displayChar =
      scriptPreference === "simplified"
        ? charData?.simplified || ch
        : charData?.traditional || ch;

    const reading = charData?.readings[0];
    const pinyinRuby = reading?.pinyin || pEntry?.pinyin;
    const hanVietRuby = reading?.hanViet || pEntry?.hanViet;
    const isUnknown = !charData && !pEntry;
    const unknownHighlight = toggles.highlightUnknown && isUnknown
      ? "bg-red-500/15 rounded-sm ring-1 ring-red-400/40"
      : "";

    return (
      <PersonalCharTooltip key={idx} character={ch} charData={charData} personalEntry={pEntry}>
        <span className="inline-block text-center">
          {(toggles.pinyin || toggles.hanViet) && (
            <span className="block text-[9.5px] leading-tight mb-0.5">
              {toggles.pinyin && pinyinRuby ? (
                <span className="text-pinyin italic block">{pinyinRuby}</span>
              ) : toggles.pinyin ? (
                <span className="block opacity-0">·</span>
              ) : null}
              {toggles.hanViet && hanVietRuby ? (
                <span className="text-hanviet block">{hanVietRuby}</span>
              ) : toggles.hanViet ? (
                <span className="block opacity-0">·</span>
              ) : null}
            </span>
          )}
          <span className={`text-[20px] leading-snug ${unknownHighlight}`}>{displayChar}</span>
        </span>
      </PersonalCharTooltip>
    );
  };

  const visibleParagraphs = paragraphs.slice(0, renderedCount);
  const remaining = paragraphs.length - renderedCount;

  return (
    <>
      {/* Topbar */}
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-border-main">
        <div className="flex items-center h-12 px-4 max-w-2xl mx-auto">
          <Link
            href={
              doc.collectionId
                ? `/personal/collection?id=${doc.collectionId}`
                : "/profile"
            }
            className="text-text-muted hover:text-accent-dark text-sm mr-3"
          >
            ‹
          </Link>
          <h1 className="flex-1 text-center text-sm text-text-primary truncate font-medium">
            {doc.title}
            {siblings.length > 1 && (
              <span className="text-[10px] text-text-ghost font-normal ml-1.5">
                {currentIdx + 1}/{siblings.length}
              </span>
            )}
          </h1>
          {siblings.length > 1 ? (
            <button
              onClick={() => setShowTOC(true)}
              className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-accent-dark text-xs rounded-lg hover:bg-bg-secondary transition-colors"
            >
              ☰
            </button>
          ) : (
            <span className="w-6" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {visibleParagraphs.map((para, pIdx) => (
          <div
            key={pIdx}
            data-para-idx={pIdx}
            className={`${
              pIdx > 0 ? "mt-6" : ""
            } flex flex-wrap items-end tracking-wide leading-loose ${fontClass} ${alignClass} ${rubyActive ? "gap-x-[6px] gap-y-1" : "gap-x-[2px]"}`}
          >
            {[...para].map((ch, i) => renderChar(ch, i))}
          </div>
        ))}

        {remaining > 0 && (
          <div
            ref={sentinelRef}
            className="py-8 text-center text-xs text-text-ghost"
          >
            Đang tải thêm... ({remaining} đoạn còn lại)
          </div>
        )}

        {siblings.length > 1 && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-border-subtle">
            {prevDoc ? (
              <Link
                href={`/personal/read?id=${prevDoc.id}`}
                className="flex-1 p-3 rounded-xl bg-bg-secondary border border-border-subtle hover:border-border-main transition-colors text-left"
              >
                <p className="text-[10px] text-text-ghost">‹ Chương trước</p>
                <p className="text-sm text-text-primary truncate mt-0.5">
                  {prevDoc.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {nextDoc ? (
              <Link
                href={`/personal/read?id=${nextDoc.id}`}
                className="flex-1 p-3 rounded-xl bg-bg-secondary border border-border-subtle hover:border-border-main transition-colors text-right"
              >
                <p className="text-[10px] text-text-ghost">Chương sau ›</p>
                <p className="text-sm text-text-primary truncate mt-0.5">
                  {nextDoc.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
      </div>

      {showTOC && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setShowTOC(false)}
          />
          <div className="fixed z-[55] inset-x-0 bottom-0 top-16 max-w-2xl mx-auto bg-bg-primary rounded-t-2xl border border-border-main shadow-xl flex flex-col">
            <div className="p-4 border-b border-border-subtle shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">Mục lục</h2>
              <button
                onClick={() => setShowTOC(false)}
                className="text-text-ghost text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
              {siblings.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/personal/read?id=${s.id}`}
                  onClick={() => setShowTOC(false)}
                  data-toc-active={s.id === docId ? "true" : undefined}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    s.id === docId
                      ? "bg-accent-gold/10 border border-accent-gold/30"
                      : "hover:bg-bg-secondary border border-transparent"
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center text-[11px] text-text-ghost font-medium shrink-0">
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm truncate ${
                      s.id === docId
                        ? "font-medium text-accent-dark"
                        : "text-text-primary"
                    }`}
                  >
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <FABPanel />
    </>
  );
}

export default function PersonalReadPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 text-center text-text-ghost">Đang tải...</div>
      }
    >
      <PersonalReadingContent />
    </Suspense>
  );
}
