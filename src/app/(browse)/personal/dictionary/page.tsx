"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { getAllDictEntries, deleteDictEntry, importDictEntries } from "@/lib/personal-db";
import { AddDictEntryModal } from "@/components/personal/AddDictEntryModal";
import type { PersonalDictEntry } from "@/types/personal";

const LIST_BATCH = 50;

export default function PersonalDictionaryPage() {
  const [entries, setEntries] = useState<PersonalDictEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [renderedCount, setRenderedCount] = useState(LIST_BATCH);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<PersonalDictEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const list = await getAllDictEntries();
    setEntries(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.text.includes(q) ||
        e.hanViet.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const visible = filtered.slice(0, renderedCount);
  const remaining = filtered.length - renderedCount;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || renderedCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setRenderedCount((prev) => Math.min(prev + LIST_BATCH, filtered.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, renderedCount]);

  useEffect(() => {
    setRenderedCount(LIST_BATCH);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    await deleteDictEntry(id);
    setConfirmDeleteId(null);
    load();
  };

  const handleExport = () => {
    const data = entries.map(({ id, ...rest }) => ({ id, ...rest }));
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert(`Đã copy ${entries.length} mục từ vào clipboard (JSON)`);
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      const valid = arr.filter(
        (item: Record<string, unknown>) => item.text && item.hanViet && item.definition
      );
      if (valid.length === 0) {
        setImportStatus("File không chứa mục từ hợp lệ (cần text, hanViet, definition)");
        return;
      }
      const result = await importDictEntries(valid);
      setImportStatus(
        `Thêm ${result.added}, cập nhật ${result.updated}, bỏ qua ${result.skipped} mục từ`
      );
      load();
    } catch {
      setImportStatus("Lỗi đọc file — hãy chọn file JSON hợp lệ");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return <div className="pt-20 text-center text-text-ghost">Đang tải...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/profile"
          className="text-text-muted hover:text-accent-dark text-sm shrink-0"
        >
          ‹
        </Link>
        <h1 className="flex-1 font-han-kai text-lg font-bold text-text-primary">
          Từ điển cá nhân
        </h1>
      </div>

      {/* Stats + actions */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-faint">{entries.length} mục từ</p>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-text-muted hover:text-accent-dark"
          >
            Import
          </button>
          {entries.length > 0 && (
            <button
              onClick={handleExport}
              className="text-xs font-medium text-text-muted hover:text-accent-dark"
            >
              Export
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs font-medium text-accent-dark hover:underline"
          >
            + Thêm từ mới
          </button>
        </div>
      </div>

      {/* Import status */}
      {importStatus && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-xs text-text-body">
          <span className="flex-1">{importStatus}</span>
          <button
            onClick={() => setImportStatus(null)}
            className="text-text-ghost hover:text-text-muted text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search */}
      {entries.length > 10 && (
        <input
          type="text"
          placeholder="Tìm chữ, Hán Việt, hoặc nghĩa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold mb-3"
        />
      )}

      {/* Entry list */}
      {entries.length === 0 ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-10 rounded-2xl border-2 border-dashed border-border-main hover:border-accent-gold text-center transition-colors bg-bg-primary"
        >
          <p className="text-2xl text-text-ghost mb-1">+</p>
          <p className="text-xs text-text-muted">
            Thêm từ mới khi đọc hoặc tại đây
          </p>
        </button>
      ) : (
        <>
          <div className="bg-bg-primary rounded-2xl border border-border-subtle overflow-hidden">
            {visible.map((entry) => (
              <div key={entry.id} className="relative">
                <button
                  onClick={() => setEditEntry(entry)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0 transition-colors text-left ${
                    confirmDeleteId === entry.id ? "" : "hover:bg-bg-subtle"
                  }`}
                >
                  <span className="font-han-ming text-lg text-text-primary w-8 text-center shrink-0">
                    {entry.text}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-medium text-hanviet">
                        {entry.hanViet}
                      </span>
                      {entry.pinyin && (
                        <span className="text-[11px] text-pinyin italic">
                          {entry.pinyin}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {entry.definition}
                    </p>
                  </div>
                  {entry.entryType !== "character" && (
                    <span className="text-[9px] text-text-ghost bg-bg-secondary px-1.5 py-0.5 rounded shrink-0">
                      {entry.entryType === "compound" ? "Từ ghép" : "Thành ngữ"}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(entry.id)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-text-ghost/40 hover:text-text-muted hover:bg-bg-secondary text-[10px] transition-colors"
                >
                  ✕
                </button>

                {confirmDeleteId === entry.id && (
                  <div className="absolute inset-0 bg-bg-primary/95 flex items-center justify-center gap-2 border-b border-border-subtle">
                    <span className="text-xs text-text-muted mr-1">Xóa?</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 rounded-lg text-xs text-text-muted bg-bg-secondary hover:bg-bg-subtle"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            ))}

            {remaining > 0 && (
              <div
                ref={sentinelRef}
                className="py-3 text-center text-xs text-text-ghost"
              >
                Đang tải thêm... ({remaining} mục còn lại)
              </div>
            )}
          </div>

          {searchQuery && filtered.length === 0 && (
            <p className="text-center text-xs text-text-muted mt-4">
              Không tìm thấy mục từ nào
            </p>
          )}
        </>
      )}

      {/* Add modal */}
      {showAdd && (
        <AddDictEntryModal
          character=""
          onSave={() => {
            setShowAdd(false);
            load();
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editEntry && (
        <AddDictEntryModal
          character={editEntry.text}
          existingId={editEntry.id}
          prefill={{
            hanViet: editEntry.hanViet,
            pinyin: editEntry.pinyin,
            definition: editEntry.definition,
            partOfSpeech: editEntry.partOfSpeech,
            simplified: editEntry.simplified,
            entryType: editEntry.entryType,
            notes: editEntry.notes,
          }}
          onSave={() => {
            setEditEntry(null);
            load();
          }}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}
