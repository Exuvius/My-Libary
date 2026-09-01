"use client";

import {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getCollection,
  getDocumentsByCollection,
  deleteDocument,
  updateCollection,
} from "@/lib/personal-db";
import { AddContentModal } from "@/components/personal/AddContentModal";
import type { PersonalCollection, PersonalDocument } from "@/types/personal";

const LIST_BATCH = 50;

function CollectionContent() {
  const searchParams = useSearchParams();
  const colId = searchParams.get("id");

  const [collection, setCollection] = useState<PersonalCollection | null>(null);
  const [docs, setDocs] = useState<PersonalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [renderedCount, setRenderedCount] = useState(LIST_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!colId) {
      setLoading(false);
      return;
    }
    const [col, docList] = await Promise.all([
      getCollection(colId),
      getDocumentsByCollection(colId),
    ]);
    setCollection(col || null);
    setDocs(docList);
    setLoading(false);
  }, [colId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter((d) => d.title.toLowerCase().includes(q));
  }, [docs, searchQuery]);

  const totalChars = useMemo(
    () => docs.reduce((sum, d) => sum + d.characterCount, 0),
    [docs]
  );

  const visibleDocs = filteredDocs.slice(0, renderedCount);
  const remaining = filteredDocs.length - renderedCount;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || renderedCount >= filteredDocs.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderedCount((prev) =>
            Math.min(prev + LIST_BATCH, filteredDocs.length)
          );
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredDocs.length, renderedCount]);

  useEffect(() => {
    setRenderedCount(LIST_BATCH);
  }, [searchQuery]);

  const handleDeleteDoc = async (docId: string) => {
    if (!colId) return;
    await deleteDocument(docId, colId);
    setConfirmDeleteId(null);
    load();
  };

  const handleTitleSave = async () => {
    if (!colId || !titleDraft.trim()) return;
    await updateCollection(colId, { title: titleDraft.trim() });
    setEditingTitle(false);
    load();
  };

  if (loading) {
    return (
      <div className="pt-20 text-center text-text-ghost">Đang tải...</div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link
          href="/profile"
          className="text-sm text-text-muted hover:text-accent-dark"
        >
          ‹ Quay lại
        </Link>
        <div className="pt-12 text-center text-text-muted">
          Không tìm thấy tuyển tập.
        </div>
      </div>
    );
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
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
              className="flex-1 px-2 py-1 rounded-lg bg-bg-secondary border border-border-subtle text-sm text-text-body focus:outline-none focus:border-accent-gold"
            />
            <button
              onClick={handleTitleSave}
              className="text-xs text-accent-dark font-medium px-2"
            >
              Lưu
            </button>
            <button
              onClick={() => setEditingTitle(false)}
              className="text-xs text-text-muted px-1"
            >
              Hủy
            </button>
          </div>
        ) : (
          <h1
            className="flex-1 font-han-kai text-lg font-bold text-text-primary truncate cursor-pointer hover:text-accent-dark"
            onClick={() => {
              setTitleDraft(collection.title);
              setEditingTitle(true);
            }}
          >
            {collection.title}
          </h1>
        )}
      </div>

      {collection.description && (
        <p className="text-xs text-text-muted mb-3 ml-5">
          {collection.description}
        </p>
      )}

      {/* Stats + Add */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-faint">
          {docs.length} chương
          {totalChars > 0 && (
            <>
              {" · "}
              {totalChars > 10000
                ? `${Math.round(totalChars / 1000)}k`
                : totalChars.toLocaleString()}{" "}
              chữ
            </>
          )}
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-medium text-accent-dark hover:underline"
        >
          + Thêm nội dung
        </button>
      </div>

      {/* Search (show when > 20 docs) */}
      {docs.length > 20 && (
        <input
          type="text"
          placeholder="Tìm chương..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold mb-3"
        />
      )}

      {/* Chapter list */}
      {docs.length === 0 ? (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-10 rounded-2xl border-2 border-dashed border-border-main hover:border-accent-gold text-center transition-colors bg-bg-primary"
        >
          <p className="text-2xl text-text-ghost mb-1">+</p>
          <p className="text-xs text-text-muted">
            Import file .txt hoặc dán văn bản Hán văn
          </p>
        </button>
      ) : (
        <>
          <div className="bg-bg-primary rounded-2xl border border-border-subtle overflow-hidden">
            {visibleDocs.map((doc) => (
              <div key={doc.id} className="relative">
                <Link
                  href={`/personal/read?id=${doc.id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0 transition-colors ${
                    confirmDeleteId === doc.id
                      ? ""
                      : "hover:bg-bg-subtle"
                  }`}
                >
                  <span className="text-[11px] text-text-ghost w-7 text-right shrink-0">
                    {doc.sortOrder + 1}
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-text-primary truncate">
                    {doc.title}
                  </span>
                  <span className="text-[10px] text-text-ghost shrink-0 mr-5">
                    {doc.characterCount.toLocaleString()}
                  </span>
                </Link>
                <button
                  onClick={() => setConfirmDeleteId(doc.id)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-text-ghost/40 hover:text-text-muted hover:bg-bg-secondary active:text-text-muted active:bg-bg-secondary text-[10px] transition-colors"
                >
                  ✕
                </button>

                {confirmDeleteId === doc.id && (
                  <div className="absolute inset-0 bg-bg-primary/95 flex items-center justify-center gap-2 border-b border-border-subtle">
                    <span className="text-xs text-text-muted mr-1">Xóa?</span>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
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
                Đang tải thêm... ({remaining} chương còn lại)
              </div>
            )}
          </div>

          {searchQuery && filteredDocs.length === 0 && (
            <p className="text-center text-xs text-text-muted mt-4">
              Không tìm thấy chương nào
            </p>
          )}
        </>
      )}

      {showAddModal && colId && (
        <AddContentModal
          collectionId={colId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 text-center text-text-ghost">Đang tải...</div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
