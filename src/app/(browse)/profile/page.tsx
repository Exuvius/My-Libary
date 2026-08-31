"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import type { FontPreference } from "@/types/user";

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

  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <h1 className="font-han-kai text-[22px] font-bold text-text-primary mb-6">
        Cá Nhân
      </h1>

      {/* Script preference */}
      <section className="mb-6">
        <h2 className="text-xs text-text-faint uppercase tracking-wider mb-3">
          Chữ thể mặc định
        </h2>
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
      </section>

      {/* Font preference */}
      <section className="mb-6">
        <h2 className="text-xs text-text-faint uppercase tracking-wider mb-3">
          Font chữ Hán khi đọc
        </h2>
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
      </section>

      {/* Theme */}
      <section className="mb-6">
        <h2 className="text-xs text-text-faint uppercase tracking-wider mb-3">
          Giao diện
        </h2>
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
      </section>

      {/* Reading stats */}
      <section>
        <h2 className="text-xs text-text-faint uppercase tracking-wider mb-3">
          Thống kê đọc
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-primary rounded-xl p-3 border border-border-subtle text-center">
            <p className="text-2xl font-bold text-accent-gold">2</p>
            <p className="text-[11px] text-text-faint mt-0.5">Đang đọc</p>
          </div>
          <div className="bg-bg-primary rounded-xl p-3 border border-border-subtle text-center">
            <p className="text-2xl font-bold text-accent-gold">1</p>
            <p className="text-[11px] text-text-faint mt-0.5">Đã hoàn thành</p>
          </div>
          <div className="bg-bg-primary rounded-xl p-3 border border-border-subtle text-center">
            <p className="text-2xl font-bold text-accent-gold">5</p>
            <p className="text-[11px] text-text-faint mt-0.5">Đánh dấu</p>
          </div>
        </div>
      </section>
    </div>
  );
}
