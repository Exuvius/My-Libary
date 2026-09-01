"use client";

import { useState } from "react";
import { addDictEntry, updateDictEntry } from "@/lib/personal-db";
import type { PersonalDictEntry, DictEntryType } from "@/types/personal";

interface Prefill {
  text?: string;
  simplified?: string;
  hanViet?: string;
  pinyin?: string;
  definition?: string;
  partOfSpeech?: string;
  entryType?: DictEntryType;
  notes?: string;
}

interface AddDictEntryModalProps {
  character: string;
  prefill?: Prefill;
  existingId?: string;
  onSave: () => void;
  onClose: () => void;
}

const posOptions = ["Danh từ", "Động từ", "Tính từ", "Phó từ", "Hư từ", "Khác"];

export function AddDictEntryModal({
  character,
  prefill,
  existingId,
  onSave,
  onClose,
}: AddDictEntryModalProps) {
  const [text, setText] = useState(character || prefill?.text || "");
  const [simplified, setSimplified] = useState(prefill?.simplified || "");
  const [hanViet, setHanViet] = useState(prefill?.hanViet || "");
  const [pinyin, setPinyin] = useState(prefill?.pinyin || "");
  const [definition, setDefinition] = useState(prefill?.definition || "");
  const [partOfSpeech, setPartOfSpeech] = useState(prefill?.partOfSpeech || "");
  const [entryType, setEntryType] = useState<DictEntryType>(
    prefill?.entryType || (character.length > 1 ? "compound" : "character")
  );
  const [notes, setNotes] = useState(prefill?.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim() || !hanViet.trim() || !definition.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();

    if (existingId) {
      await updateDictEntry(existingId, {
        simplified: simplified.trim() || undefined,
        hanViet: hanViet.trim(),
        pinyin: pinyin.trim() || undefined,
        definition: definition.trim(),
        partOfSpeech: partOfSpeech || undefined,
        entryType,
        notes: notes.trim() || undefined,
      });
    } else {
      const entry: PersonalDictEntry = {
        id: crypto.randomUUID(),
        text: text.trim(),
        simplified: simplified.trim() || undefined,
        hanViet: hanViet.trim(),
        pinyin: pinyin.trim() || undefined,
        definition: definition.trim(),
        partOfSpeech: partOfSpeech || undefined,
        entryType,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      await addDictEntry(entry);
    }

    setSaving(false);
    onSave();
  };

  const isEdit = !!existingId;

  return (
    <>
      <div className="fixed inset-0 z-[65] bg-black/30" onClick={onClose} />
      <div className="fixed z-[70] inset-x-4 top-16 bottom-16 max-w-md mx-auto bg-bg-primary rounded-2xl border border-border-main shadow-xl flex flex-col">
        <div className="p-4 border-b border-border-subtle shrink-0 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">
            {isEdit ? "Sửa mục từ" : "Thêm vào từ điển"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-ghost text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {/* Character display / input */}
          {character ? (
            <div className="text-center py-2">
              <span className="font-han-ming text-[48px] text-text-primary leading-none">
                {character}
              </span>
            </div>
          ) : (
            <div>
              <label className="text-[11px] text-text-muted block mb-1">
                Chữ / Từ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder="VD: 學 hoặc 學習"
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-lg text-text-body text-center placeholder:text-text-ghost focus:outline-none focus:border-accent-gold font-han-ming"
              />
            </div>
          )}

          {/* Entry type */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">Loại</label>
            <div className="flex gap-1.5">
              {([
                { key: "character" as const, label: "Đơn tự" },
                { key: "compound" as const, label: "Từ ghép" },
                { key: "idiom" as const, label: "Thành ngữ" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setEntryType(opt.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    entryType === opt.key
                      ? "bg-text-body text-bg-primary"
                      : "bg-bg-secondary text-text-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simplified */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">
              Giản thể <span className="text-text-ghost">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={simplified}
              onChange={(e) => setSimplified(e.target.value)}
              placeholder="VD: 学"
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold font-han-ming"
            />
          </div>

          {/* Han Viet */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">
              Hán Việt <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={hanViet}
              onChange={(e) => setHanViet(e.target.value)}
              placeholder="VD: học"
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Pinyin */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">
              Pinyin <span className="text-text-ghost">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={pinyin}
              onChange={(e) => setPinyin(e.target.value)}
              placeholder="VD: xué"
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Part of speech */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">Từ loại</label>
            <div className="flex flex-wrap gap-1.5">
              {posOptions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPartOfSpeech(partOfSpeech === pos ? "" : pos)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    partOfSpeech === pos
                      ? "bg-accent-gold/20 text-accent-dark border border-accent-gold/40"
                      : "bg-bg-secondary text-text-muted"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Definition */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">
              Nghĩa <span className="text-red-400">*</span>
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Nhập nghĩa tiếng Việt..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] text-text-muted block mb-1">
              Ghi chú <span className="text-text-ghost">(tùy chọn)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cá nhân..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-sm text-text-body placeholder:text-text-ghost focus:outline-none focus:border-accent-gold resize-none"
            />
          </div>
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
              onClick={handleSave}
              disabled={!text.trim() || !hanViet.trim() || !definition.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-text-body text-bg-primary hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
