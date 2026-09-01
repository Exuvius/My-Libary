"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { getAllCollections, deleteCollection, getAllDictEntries } from "@/lib/personal-db";
import { CreateCollectionModal } from "@/components/personal/CreateCollectionModal";
import type { FontPreference } from "@/types/user";
import type { PersonalCollection } from "@/types/personal";

const fontOptions: { key: FontPreference; label: string; desc: string; sample: string }[] = [
  { key: "ming", label: "Minh thể", desc: "Noto Serif SC", sample: "明體" },
  { key: "kai", label: "Khải thể", desc: "LXGW WenKai", sample: "楷體" },
  { key: "gothic", label: "Hắc thể", desc: "Noto Sans SC", sample: "黑體" },
];

const themeOptions = [
  { key: "light", label: "Sáng" },
  { key: "dark", label: "Tối" },
  { key: "system", label: "Hệ thống" },
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const fontPreference = useAppStore((s) => s.fontPreference);
  const setFontPreference = useAppStore((s) => s.setFontPreference);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const setScriptPreference = useAppStore((s) => s.setScriptPreference);

  const [collections, setCollections] = useState<PersonalCollection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dictCount, setDictCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    loadCollections();
    getAllDictEntries().then((e) => setDictCount(e.length));
  }, []);

  const loadCollections = () => {
    getAllCollections().then(setCollections);
  };

  const handleDelete = async (id: string) => {
    await deleteCollection(id);
    setConfirmDeleteId(null);
    loadCollections();
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <h1 className="font-han-kai text-[22px] font-bold text-text-primary mb-6">
        Cá Nhân
      </h1>

      {/* Personal Library — Collections */}
      <section className="mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center font-han-kai text-accent-dark text-[15px]">
            書
          </span>
          <h2 className="flex-1 text-sm font-semibold text-text-primary">
            Thư viện cá nhân
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-medium text-accent-dark hover:underline"
          >
            + Tạo tuyển tập
          </button>
        </div>

        {collections.length === 0 ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-10 rounded-2xl border-2 border-dashed border-border-main hover:border-accent-gold text-center transition-colors bg-bg-primary"
          >
            <p className="text-2xl text-text-ghost mb-1">+</p>
            <p className="text-xs text-text-muted">
              Tạo tuyển tập để quản lý văn bản Hán văn
            </p>
            <p className="text-[10px] text-text-ghost mt-1">
              VD: Thơ Lý Bạch, Tam Quốc Diễn Nghĩa, Bài tập...
            </p>
          </button>
        ) : (
          <div className="space-y-2">
            {collections.map((col) => (
              <div key={col.id} className="relative">
                <Link
                  href={`/personal/collection?id=${col.id}`}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-lg shrink-0 font-han-kai text-text-primary">
                    {col.title.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {col.title}
                    </p>
                    {col.description && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {col.description}
                      </p>
                    )}
                    <p className="text-[10px] text-text-ghost mt-1">
                      {col.documentCount} tài liệu · {formatDate(col.updatedAt)}
                    </p>
                  </div>
                  <span className="text-text-ghost text-sm mt-1">›</span>
                </Link>
                <button
                  onClick={() => setConfirmDeleteId(col.id)}
                  className="absolute top-2 right-8 w-6 h-6 flex items-center justify-center rounded-full text-text-ghost hover:text-text-muted hover:bg-bg-secondary text-xs transition-colors"
                >
                  ✕
                </button>

                {confirmDeleteId === col.id && (
                  <div className="absolute inset-0 bg-bg-primary/95 rounded-2xl flex items-center justify-center gap-2 border border-border-main">
                    <span className="text-xs text-text-muted mr-1">Xóa tuyển tập?</span>
                    <button
                      onClick={() => handleDelete(col.id)}
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
          </div>
        )}
      </section>

      {/* Personal Dictionary */}
      <section className="mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center font-han-kai text-accent-dark text-[15px]">
            字
          </span>
          <h2 className="flex-1 text-sm font-semibold text-text-primary">
            Từ điển cá nhân
          </h2>
          <span className="text-[11px] text-text-ghost">{dictCount} mục từ</span>
        </div>
        <Link
          href="/personal/dictionary"
          className="flex items-center gap-3 p-3 rounded-2xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-lg shrink-0 font-han-kai text-text-primary">
            字
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              Quản lý từ điển cá nhân
            </p>
            <p className="text-[11px] text-text-faint">
              Xem, sửa, thêm từ mới, export JSON
            </p>
          </div>
          <span className="text-text-ghost text-sm">›</span>
        </Link>
      </section>

      {/* Cài đặt */}
      <section>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center gap-2.5 py-2 group"
        >
          <span className="w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center text-accent-dark text-[15px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent-dark">
              <path d="M6.5 1.5A1.5 1.5 0 0 1 8 0h0a1.5 1.5 0 0 1 1.5 1.5v.42a5.5 5.5 0 0 1 1.35.56l.3-.3a1.5 1.5 0 0 1 2.12 0h0a1.5 1.5 0 0 1 0 2.12l-.3.3c.24.42.43.87.56 1.35h.42A1.5 1.5 0 0 1 15.5 7.5v0A1.5 1.5 0 0 1 14 9h-.42a5.5 5.5 0 0 1-.56 1.35l.3.3a1.5 1.5 0 0 1 0 2.12h0a1.5 1.5 0 0 1-2.12 0l-.3-.3a5.5 5.5 0 0 1-1.35.56v.42A1.5 1.5 0 0 1 8 15h0a1.5 1.5 0 0 1-1.5-1.5v-.42a5.5 5.5 0 0 1-1.35-.56l-.3.3a1.5 1.5 0 0 1-2.12 0h0a1.5 1.5 0 0 1 0-2.12l.3-.3A5.5 5.5 0 0 1 2.47 9H2A1.5 1.5 0 0 1 .5 7.5v0A1.5 1.5 0 0 1 2 6h.47a5.5 5.5 0 0 1 .56-1.35l-.3-.3a1.5 1.5 0 0 1 0-2.12h0a1.5 1.5 0 0 1 2.12 0l.3.3A5.5 5.5 0 0 1 6.5 1.97V1.5Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="8" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </span>
          <h2 className="flex-1 text-sm font-semibold text-text-primary text-left">
            Cài đặt
          </h2>
          <span
            className={`text-text-ghost text-xs transition-transform duration-200 ${
              settingsOpen ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </button>

        {settingsOpen && <>
        {/* Script preference */}
        <div className="mb-5 mt-3">
          <h3 className="text-[11px] text-text-muted mb-2">Chữ thể mặc định</h3>
          <div className="flex gap-2">
            {([
              { key: "traditional" as const, label: "Phồn thể", char: "繁" },
              { key: "simplified" as const, label: "Giản thể", char: "简" },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setScriptPreference(opt.key)}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border transition-colors ${
                  scriptPreference === opt.key
                    ? "border-accent-gold bg-bg-primary"
                    : "border-border-subtle bg-bg-primary hover:border-border-main"
                }`}
              >
                <span className="font-han-ming text-[24px] text-text-primary leading-none">
                  {opt.char}
                </span>
                <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                {scriptPreference === opt.key && (
                  <span className="text-accent-gold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font preference */}
        <div className="mb-5">
          <h3 className="text-[11px] text-text-muted mb-2">Font chữ Hán khi đọc</h3>
          <div className="space-y-2">
            {fontOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFontPreference(opt.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                  fontPreference === opt.key
                    ? "border-accent-gold bg-bg-primary"
                    : "border-border-subtle bg-bg-primary hover:border-border-main"
                }`}
              >
                <span
                  className={`text-[28px] text-text-primary w-14 text-center leading-none ${
                    opt.key === "ming"
                      ? "font-han-ming"
                      : opt.key === "kai"
                      ? "font-han-kai"
                      : "font-han-hei"
                  }`}
                >
                  {opt.sample}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{opt.label}</p>
                  <p className="text-[11px] text-text-faint">{opt.desc}</p>
                </div>
                {fontPreference === opt.key && (
                  <span className="ml-auto text-accent-gold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-[11px] text-text-muted mb-2">Giao diện</h3>
          {mounted ? (
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    theme === opt.key
                      ? "bg-text-body text-bg-primary"
                      : "bg-bg-primary text-text-muted border border-border-subtle hover:border-border-main"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <div
                  key={opt.key}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-bg-primary text-text-muted border border-border-subtle text-center"
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
        </>}
      </section>

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadCollections();
          }}
        />
      )}
    </div>
  );
}
