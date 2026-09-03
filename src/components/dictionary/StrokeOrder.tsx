"use client";

import { useEffect, useRef, useState } from "react";

interface StrokeOrderProps {
  character: string;
  simplified?: string;
}

function StrokeWriter({ character, label }: { character: string; label?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";
    writerRef.current = null;
    setIsPlaying(false);
    setHasData(true);

    let cancelled = false;

    import("hanzi-writer").then((mod) => {
      if (cancelled || !containerRef.current) return;

      const HanziWriter = mod.default;
      const cs = getComputedStyle(document.documentElement);
      const resolve = (varName: string, fallback: string) =>
        cs.getPropertyValue(varName).trim() || fallback;

      try {
        const writer = HanziWriter.create(containerRef.current, character, {
          width: 140,
          height: 140,
          padding: 8,
          showOutline: true,
          showCharacter: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 150,
          strokeColor: resolve("--color-text-primary", "#2c2419"),
          outlineColor: resolve("--color-border-subtle", "#dcd3c4"),
          radicalColor: resolve("--color-accent-gold", "#a88c4a"),
          drawingColor: resolve("--color-accent-dark", "#7a6b3a"),
          charDataLoader: (char: string, onComplete: (d: any) => void, onError: (e: unknown) => void) => {
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
              .then(r => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
              })
              .then(onComplete)
              .catch(onError);
          },
          onLoadCharDataError: () => {
            if (!cancelled) setHasData(false);
          },
        });
        writerRef.current = writer;
      } catch {
        setHasData(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [character]);

  const handleAnimate = () => {
    if (!writerRef.current) return;
    setIsPlaying(true);
    writerRef.current.animateCharacter({
      onComplete: () => setIsPlaying(false),
    });
  };

  if (!hasData) return null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-[10px] text-text-ghost uppercase tracking-wider">{label}</span>
      )}
      <div
        ref={containerRef}
        className="rounded-xl border border-border-subtle bg-bg-secondary"
        style={{ width: 140, height: 140 }}
      />
      <button
        onClick={handleAnimate}
        disabled={isPlaying}
        className="text-[11px] px-3 py-1 rounded-lg bg-bg-secondary text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-40"
      >
        {isPlaying ? "Đang viết..." : "▶ Viết theo nét"}
      </button>
    </div>
  );
}

export function StrokeOrder({ character, simplified }: StrokeOrderProps) {
  const hasBothForms = simplified && simplified !== character;

  if (hasBothForms) {
    return (
      <div className="flex gap-4 items-start">
        <StrokeWriter character={character} label="Phồn thể" />
        <StrokeWriter character={simplified} label="Giản thể" />
      </div>
    );
  }

  return <StrokeWriter character={character} />;
}
