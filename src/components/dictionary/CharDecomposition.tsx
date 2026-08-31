"use client";

import Link from "next/link";
import { decompositions, structureLabels } from "@/data/decompositions";
import { characters } from "@/lib/mock-data";

interface CharDecompositionProps {
  character: string;
}

const charLookupMap = new Map(characters.map((c) => [c.traditional, c]));

export function CharDecomposition({ character }: CharDecompositionProps) {
  const decomp = decompositions[character];

  if (!decomp) {
    return (
      <p className="text-sm text-text-ghost text-center py-8">
        Đây là bộ thủ cơ bản, không chia nhỏ được.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top-level structure */}
      <div className="bg-bg-primary rounded-2xl border border-border-subtle p-4">
        <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-3">
          Cấu trúc
        </p>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-han-ming text-[36px] text-text-primary leading-none">
            {character}
          </span>
          <span className="text-text-ghost text-lg">=</span>
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-accent-gold/10 text-accent-dark font-medium border border-accent-gold/20">
            {decomp.structure} {structureLabels[decomp.structure] || ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {decomp.components.map((comp, i) => (
            <ComponentCard key={i} component={comp} isMainRadical={comp === decomp.radical} />
          ))}
        </div>
      </div>

      {/* All radicals / leaf parts */}
      {decomp.allParts.length > 0 && (
        <div className="bg-bg-primary rounded-2xl border border-border-subtle p-4">
          <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-3">
            Tất cả bộ kiện
          </p>
          <div className="flex flex-wrap gap-1.5">
            {decomp.allParts.map((part, i) => (
              <PartChip key={i} part={part} isMainRadical={part === decomp.radical} />
            ))}
          </div>
        </div>
      )}

      {/* Radical info */}
      {decomp.radical && (
        <div className="bg-bg-primary rounded-2xl border border-border-subtle p-4">
          <p className="text-[10px] text-text-ghost uppercase tracking-wider mb-3">
            Bộ thủ chính
          </p>
          <ComponentCard component={decomp.radical} isMainRadical />
        </div>
      )}
    </div>
  );
}

function ComponentCard({
  component,
  isMainRadical,
}: {
  component: string;
  isMainRadical?: boolean;
}) {
  const isSingleChar = [...component].length === 1;
  const charData = isSingleChar ? charLookupMap.get(component) : undefined;
  const hanViet = charData?.readings[0]?.hanViet;
  const charId = charData?.id;
  const subDecomp = isSingleChar ? decompositions[component] : undefined;

  const inner = (
    <div
      className={`flex flex-col items-center py-2.5 px-4 rounded-xl border transition-colors min-w-[64px] ${
        isMainRadical
          ? "border-accent-gold/30 bg-accent-gold/5"
          : "border-border-subtle bg-bg-secondary hover:bg-bg-subtle"
      }`}
    >
      <span className={`font-han-ming text-[32px] leading-none ${isMainRadical ? "text-accent-gold" : "text-text-primary"}`}>
        {isSingleChar ? component : component}
      </span>
      {hanViet && (
        <span className="text-[11px] text-text-muted mt-1 font-medium">{hanViet}</span>
      )}
      {isMainRadical && (
        <span className="text-[9px] text-accent-dark mt-0.5">bộ thủ</span>
      )}
      {subDecomp && (
        <span className="text-[9px] text-text-ghost mt-0.5">
          {subDecomp.structure} {subDecomp.components.filter(c => [...c].length === 1).join(" + ")}
        </span>
      )}
    </div>
  );

  if (charId) {
    return <Link href={`/dictionary/${charId}`}>{inner}</Link>;
  }

  return inner;
}

function PartChip({
  part,
  isMainRadical,
}: {
  part: string;
  isMainRadical?: boolean;
}) {
  const charData = charLookupMap.get(part);
  const hanViet = charData?.readings[0]?.hanViet;
  const charId = charData?.id;

  const inner = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
        isMainRadical
          ? "border-accent-gold/30 bg-accent-gold/5"
          : "border-border-subtle bg-bg-secondary hover:bg-bg-subtle"
      }`}
    >
      <span className={`font-han-ming text-lg leading-none ${isMainRadical ? "text-accent-gold" : "text-text-primary"}`}>
        {part}
      </span>
      {hanViet && (
        <span className="text-[10px] text-text-faint">{hanViet}</span>
      )}
    </div>
  );

  if (charId) {
    return <Link href={`/dictionary/${charId}`}>{inner}</Link>;
  }

  return inner;
}
