"use client";

interface TagProps {
  label: string;
  variant?: "default" | "language";
  size?: "sm" | "md";
  onClick?: () => void;
  active?: boolean;
}

export function Tag({ label, variant = "default", size = "sm", onClick, active }: TagProps) {
  const isLang = variant === "language";
  const base = "inline-block font-semibold rounded-[14px] transition-opacity";
  const sizeClass = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  const colorClass = isLang
    ? "bg-lang-tag-bg text-lang-tag-text"
    : "bg-accent-tag-bg text-accent-tag-text";
  const activeClass = active ? "ring-2 ring-accent-gold" : "";
  const clickClass = onClick ? "cursor-pointer hover:opacity-80" : "";

  return (
    <span
      className={`${base} ${sizeClass} ${colorClass} ${activeClass} ${clickClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {label}
    </span>
  );
}
