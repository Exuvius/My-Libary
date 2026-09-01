"use client";

import { useState, useRef } from "react";
import { addDocument, getDocumentsByCollection } from "@/lib/personal-db";
import { detectChapters } from "@/lib/text-splitter";
import type { PersonalDocument, DocSource } from "@/types/personal";

interface AddContentModalProps {
  collectionId: string;
  onClose: () => void;
  onAdded: () => void;
}

type Tab = "paste" | "import";

interface ChapterItem {
  title: string;
  content: string;
  charCount: number;
  selected: boolean;
}

type ModalStep =
  | { type: "input" }
  | { type: "reading"; progress: number; fileName: string }
  | { type: "preview"; chapters: ChapterItem[]; fileName: string }
  | { type: "saving"; saved: number; total: number };

function countHanChars(text: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x4e00 && c <= 0x9fff) n++;
  }
  return n;
}

function makePreview(text: string): string {
  const lines = text.split(/\n+/).filter(Boolean);
  return lines.slice(0, 2).join("\n").slice(0, 120);
}

export function AddContentModal({ collectionId, onClose, onAdded }: AddContentModalProps) {
  const [tab, setTab] = useState<Tab>("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<ModalStep>({ type: "input" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    setStep({ type: "reading", progress: 0, fileName: name });

    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setStep({ type: "reading", progress: evt.loaded / evt.total, fileName: name });
      }
    };
    reader.onload = () => {
      const text = reader.result as string;
      const chapters = detectChapters(text);

      if (chapters && chapters.length >= 2) {
        setStep({
          type: "preview",
          chapters: chapters.map((ch) => ({ ...ch, selected: true })),
          fileName: name,
        });
      } else {
        setFileName(name);
        setTitle(name.replace(/\.txt$/i, ""));
        setContent(text);
        setStep({ type: "input" });
      }
    };
    reader.onerror = () => {
      setStep({ type: "input" });
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleSaveSingle = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    const now = new Date().toISOString();
    const sourceType: DocSource = tab === "paste" ? "paste" : "import_txt";
    const existing = await getDocumentsByCollection(collectionId);
    const doc: PersonalDocument = {
      id: crypto.randomUUID(),
      collectionId,
      title: title.trim() || "Không có tiêu đề",
      sortOrder: existing.length,
      sourceType,
      originalFilename: fileName || undefined,
      contentText: trimmed,
      contentPreview: makePreview(trimmed),
      characterCount: countHanChars(trimmed),
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(doc);
    setSaving(false);
    onAdded();
  };

  const handleSaveChapters = async () => {
    if (step.type !== "preview") return;
    const selected = step.chapters.filter((ch) => ch.selected);
    if (selected.length === 0) return;

    setStep({ type: "saving", saved: 0, total: selected.length });

    const existing = await getDocumentsByCollection(collectionId);
    const sortBase = existing.length;
    const now = new Date().toISOString();

    for (let i = 0; i < selected.length; i++) {
      const ch = selected[i];
      const doc: PersonalDocument = {
        id: crypto.randomUUID(),
        collectionId,
        title: ch.title,
        sortOrder: sortBase + i,
        sourceType: "import_txt",
        contentText: ch.content,
        contentPreview: makePreview(ch.content),
        characterCount: ch.charCount,
        createdAt: now,
        updatedAt: now,
      };
      await addDocument(doc);
      setStep({ type: "saving", saved: i + 1, total: selected.length });
    }

    onAdded();
  };

  const toggleChapter = (idx: number) => {
    if (step.type !== "preview") return;
    const chapters = [...step.chapters];
    chapters[idx] = { ...chapters[idx], selected: !chapters[idx].selected };
    setStep({ ...step, chapters });
  };

  const renameChapter = (idx: number, newTitle: string) => {
    if (step.type !== "preview") return;
    const chapters = [...step.chapters];
    chapters[idx] = { ...chapters[idx], title: newTitle };
    setStep({ ...step, chapters });
  };

  // --- Reading file progress ---
  if (step.type === "reading") {
    const percent = Math.round(step.progress * 100);
    return (
      <>
        <div className="fixed inset-0 z-[55] bg-black/30" />
        <div className="fixed z-[60] inset-x-4 bottom-14 md:bottom-0 max-w-lg mx-auto bg-bg-primary rounded-2xl md:rounded-b-none md:rounded-t-2xl border border-border-main shadow-xl">
          <div className="p-6 text-center">
            <p className="text-sm text-text-primary font-medium mb-2">
              Đang đọc file...
            </p>
            <p className="text-xs text-text-muted mb-3">{step.fileName}</p>
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-gold rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-ghost mt-2">{percent}%</p>
          </div>
        </div>
      </>
    );
  }

  // --- Split preview ---
  if (step.type === "preview") {
    const selectedCount = step.chapters.filter((ch) => ch.selected).length;
    const totalChars = step.chapters
      .filter((ch) => ch.selected)
      .reduce((s, ch) => s + ch.charCount, 0);
    return (
      <>
        <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />
        <div className="fixed z-[60] inset-x-4 bottom-14 md:bottom-0 top-20 max-w-lg mx-auto bg-bg-primary rounded-2xl border border-border-main shadow-xl flex flex-col">
          <div className="p-4 border-b border-border-subtle shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary">
                  Phát hiện {step.chapters.length} phần
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {step.fileName} · {totalChars.toLocaleString()} chữ Hán
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-text-ghost text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
            {step.chapters.map((ch, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-xl border transition-colors ${
                  ch.selected
                    ? "border-accent-gold/50 bg-bg-primary"
                    : "border-border-subtle bg-bg-secondary opacity-50"
                }`}
              >
                <button
                  onClick={() => toggleChapter(i)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    ch.selected
                      ? "border-accent-gold bg-accent-gold text-white"
                      : "border-border-main"
                  }`}
                >
                  {ch.selected && (
                    <span className="text-[10px] leading-none">✓</span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => renameChapter(i, e.target.value)}
                    className="w-full text-sm font-medium text-text-primary bg-transparent focus:outline-none focus:underline decoration-accent-gold underline-offset-2"
                  />
                  <p className="text-[10px] text-text-ghost mt-0.5 truncate font-han-ming">
                    {ch.content.slice(0, 60)}
                  </p>
                  <p className="text-[10px] text-text-ghost">
                    {ch.charCount.toLocaleString()} chữ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border-subtle shrink-0">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm text-text-muted bg-bg-secondary hover:bg-bg-subtle transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveChapters}
                disabled={selectedCount === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-text-body text-bg-primary hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Lưu {selectedCount} phần
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Saving progress ---
  if (step.type === "saving") {
    const percent = Math.round((step.saved / step.total) * 100);
    return (
      <>
        <div className="fixed inset-0 z-[55] bg-black/30" />
        <div className="fixed z-[60] inset-x-4 bottom-14 md:bottom-0 max-w-lg mx-auto bg-bg-primary rounded-2xl md:rounded-b-none md:rounded-t-2xl border border-border-main shadow-xl">
          <div className="p-6 text-center">
            <p className="text-sm text-text-primary font-medium mb-2">
              Đang lưu...
            </p>
            <p className="text-xs text-text-muted mb-3">
              {step.saved} / {step.total} phần
            </p>
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-gold rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-ghost mt-2">{percent}%</p>
          </div>
        </div>
      </>
    );
  }

  // --- Default input state ---
  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />
      <div className="fixed z-[60] inset-x-4 bottom-14 md:bottom-0 max-w-lg mx-auto bg-bg-primary rounded-2xl md:rounded-b-none md:rounded-t-2xl border border-border-main shadow-xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">
              Thêm nội dung
            </h2>
            <button
              onClick={onClose}
              className="text-text-ghost text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => {
                setTab("paste");
                setContent("");
                setFileName(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                tab === "paste"
                  ? "bg-text-body text-bg-primary"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              Dán văn bản
            </button>
            <button
              onClick={() => {
                setTab("import");
                setContent("");
                setFileName(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                tab === "import"
                  ? "bg-text-body text-bg-primary"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              Import file
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Tên tài liệu..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold mb-3"
          />

          {tab === "paste" ? (
            <textarea
              placeholder="Dán đoạn văn bản Hán văn vào đây..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold resize-none font-han-ming"
            />
          ) : (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-xl border-2 border-dashed border-border-main hover:border-accent-gold text-center transition-colors"
              >
                {fileName ? (
                  <div>
                    <p className="text-sm text-text-primary font-medium">
                      {fileName}
                    </p>
                    <p className="text-[11px] text-text-faint mt-1">
                      {countHanChars(content).toLocaleString()} chữ Hán
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl text-text-ghost mb-1">+</p>
                    <p className="text-xs text-text-muted">
                      Chọn file .txt · Tự tách chương nếu phát hiện
                    </p>
                  </div>
                )}
              </button>
              {content && (
                <div className="mt-3 p-2 rounded-lg bg-bg-secondary text-xs text-text-muted font-han-ming max-h-24 overflow-y-auto">
                  {content.slice(0, 300)}
                  {content.length > 300 && "..."}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pb-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-text-muted bg-bg-secondary hover:bg-bg-subtle transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveSingle}
              disabled={!content.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-text-body text-bg-primary hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
