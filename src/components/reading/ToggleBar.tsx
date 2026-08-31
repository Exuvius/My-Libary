"use client";

import { useAppStore } from "@/lib/store";
import { ToggleChip } from "@/components/ui/ToggleChip";

interface ReadingToggles {
  hanViet: boolean;
  pinyin: boolean;
  translation: boolean;
  simplified: boolean;
  annotations: boolean;
  comments: boolean;
}

const toggleItems: { key: keyof ReadingToggles; label: string }[] = [
  { key: "hanViet", label: "Hán Việt" },
  { key: "pinyin", label: "Pinyin" },
  { key: "translation", label: "Dịch nghĩa" },
  { key: "simplified", label: "Giản thể" },
  { key: "annotations", label: "Chú giải" },
  { key: "comments", label: "Bình luận" },
];

export function ToggleBar() {
  const toggles = useAppStore((s) => s.toggles);
  const setToggle = useAppStore((s) => s.setToggle);

  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 py-2 bg-bg-tertiary border-b border-border-subtle">
      {toggleItems.map((item) => (
        <ToggleChip
          key={item.key}
          label={item.label}
          active={toggles[item.key]}
          onToggle={() => setToggle(item.key, !toggles[item.key])}
        />
      ))}
    </div>
  );
}
