"use client";

import { useState } from "react";
import { addCollection } from "@/lib/personal-db";
import type { PersonalCollection } from "@/types/personal";

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateCollectionModal({ onClose, onCreated }: CreateCollectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);
    const now = new Date().toISOString();
    const col: PersonalCollection = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: description.trim() || undefined,
      documentCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await addCollection(col);
    setSaving(false);
    onCreated();
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />
      <div className="fixed z-[60] inset-x-4 bottom-14 md:bottom-0 max-w-lg mx-auto bg-bg-primary rounded-2xl md:rounded-b-none md:rounded-t-2xl border border-border-main shadow-xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">Tạo tuyển tập mới</h2>
            <button onClick={onClose} className="text-text-ghost text-lg leading-none px-1">
              ✕
            </button>
          </div>

          <input
            type="text"
            placeholder="Tên tuyển tập (VD: Thơ Lý Bạch, Tam Quốc Diễn Nghĩa...)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold mb-3"
          />

          <input
            type="text"
            placeholder="Mô tả ngắn (không bắt buộc)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold mb-3"
          />

          <div className="flex gap-2 mt-2 pb-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-text-muted bg-bg-secondary hover:bg-bg-subtle transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-text-body text-bg-primary hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
