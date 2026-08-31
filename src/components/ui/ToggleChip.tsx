"use client";

interface ToggleChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function ToggleChip({ label, active, onToggle }: ToggleChipProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        px-3 py-1.5 rounded-[14px] text-xs font-medium whitespace-nowrap transition-colors
        ${active
          ? "bg-text-body text-bg-primary"
          : "bg-transparent text-text-muted border border-border-light hover:bg-bg-subtle"
        }
      `}
    >
      {label}
    </button>
  );
}
