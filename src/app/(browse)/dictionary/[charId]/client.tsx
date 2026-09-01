"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getCharacterById, getEntriesByCharacterId, getCitationsForCharacter } from "@/lib/mock-data";
import { Tag } from "@/components/ui/Tag";
import { CornerOrnament } from "@/components/ui/CornerOrnament";
import { DividerBrush } from "@/components/ui/DividerBrush";
import { StrokeOrder } from "@/components/dictionary/StrokeOrder";
import { CharDecomposition } from "@/components/dictionary/CharDecomposition";
import { decompositions } from "@/data/decompositions";
import { useAppStore } from "@/lib/store";

type EntryTab = "meanings" | "structure" | "compounds" | "idioms" | "citations";

const tabConfig: { key: EntryTab; label: string }[] = [
  { key: "meanings", label: "Nghĩa" },
  { key: "structure", label: "Cấu tạo" },
  { key: "compounds", label: "Từ ghép" },
  { key: "idioms", label: "Thành ngữ" },
  { key: "citations", label: "Trích dẫn" },
];

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ charId: string }>;
}) {
  const { charId } = use(params);
  const [activeTab, setActiveTab] = useState<EntryTab>("meanings");
  const char = getCharacterById(charId);
  const scriptPreference = useAppStore((s) => s.scriptPreference);
  const useSimplified = scriptPreference === "simplified";

  if (!char) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 text-center text-text-muted">
        Không tìm thấy mục từ.
      </div>
    );
  }

  const relatedEntries = getEntriesByCharacterId(charId);
  // "Từ ghép" includes specialized entries — they're compound words with a domain tag
  const compounds = relatedEntries.filter((e) => e.entryType === "compound" || e.entryType === "specialized");
  const idioms = relatedEntries.filter((e) => e.entryType === "idiom");

  const citations = getCitationsForCharacter(char.traditional);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
      <Link
        href="/dictionary"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-dark mb-4"
      >
        ‹ Từ Điển
      </Link>

      {/* Hero */}
      <div className="relative bg-bg-primary rounded-2xl p-7 border border-border-subtle mb-5">
        <CornerOrnament />
        <div className="text-center">
          <span className="font-han-ming text-[76px] text-text-primary leading-none">
            {useSimplified && char.simplified ? char.simplified : char.traditional}
          </span>
          {char.simplified && char.simplified !== char.traditional && (
            <span className="block font-han-ming text-[28px] text-text-ghost mt-1">
              {useSimplified ? char.traditional : char.simplified}
            </span>
          )}
          <div className="flex items-center justify-center gap-3 mt-3">
            {char.radical && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-bg-secondary text-text-faint">
                {char.radical.character} {char.radical.hanViet}
              </span>
            )}
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-bg-secondary text-text-faint">
              {char.strokeCount} nét
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
            {char.readings.map((r) => (
              <span key={r.id} className="text-base">
                <span className="font-bold text-hanviet">{r.hanViet}</span>
                <span className="text-pinyin text-sm italic ml-1.5">{r.pinyin}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <StrokeOrder character={char.traditional} simplified={char.simplified} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabConfig.map((tab) => {
          let count = 0;
          if (tab.key === "meanings")
            count = char.readings.reduce((sum, r) => sum + r.meanings.length, 0);
          if (tab.key === "structure") {
            const d = decompositions[char.traditional];
            count = d ? d.allParts.length : 0;
          }
          if (tab.key === "compounds") count = compounds.length;
          if (tab.key === "idioms") count = idioms.length;
          if (tab.key === "citations") count = citations.length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-text-body text-bg-primary"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-[10px] opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Meanings tab */}
      {activeTab === "meanings" && (
        <div className="space-y-0">
          {char.readings.map((reading, rIdx) => (
            <div key={reading.id}>
              {rIdx > 0 && <DividerBrush className="my-5" />}
              <div className="border-l-[3px] border-accent-gold pl-3 mb-3">
                <span className="text-[19px] font-bold text-hanviet">
                  {reading.hanViet}
                </span>
                <span className="text-[13px] text-pinyin italic ml-2">
                  {reading.pinyin}
                </span>
              </div>
              <div className="space-y-2.5">
                {reading.meanings.map((meaning, mIdx) => (
                  <div key={meaning.id} className="flex gap-2">
                    <span className="text-sm text-text-ghost font-medium w-5 text-right shrink-0">
                      {mIdx + 1}.
                    </span>
                    <div>
                      <Tag label={meaning.partOfSpeech} size="sm" />
                      <p className="text-sm text-text-body mt-1">{meaning.definition}</p>
                      {meaning.notes && (
                        <p className="text-xs text-text-muted mt-0.5 italic">
                          {meaning.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structure tab */}
      {activeTab === "structure" && (
        <CharDecomposition character={char.traditional} />
      )}

      {/* Compounds tab */}
      {activeTab === "compounds" && (
        <div className="space-y-2">
          {compounds.length === 0 && (
            <p className="text-sm text-text-ghost text-center py-8">
              Chưa có từ ghép.
            </p>
          )}
          {compounds.map((entry) => {
            const displayText = useSimplified && entry.textSimplified ? entry.textSimplified : entry.textTraditional;
            return (
              <Link
                key={entry.id}
                href={`/dictionary/entry/${entry.id}`}
                className="block p-3 rounded-xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
              >
                <span className="font-han-ming text-lg text-text-primary">
                  {displayText.split("").map((ch, i) => {
                    const tradCh = entry.textTraditional[i];
                    return (
                      <span
                        key={i}
                        className={tradCh === char.traditional ? "text-accent-gold" : ""}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
                <span className="text-sm font-bold text-hanviet ml-2">{entry.hanViet}</span>
                <span className="text-xs text-pinyin italic ml-1">{entry.pinyin}</span>
                <p className="text-xs text-text-body mt-1">{entry.definition}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Idioms tab */}
      {activeTab === "idioms" && (
        <div className="space-y-2">
          {idioms.length === 0 && (
            <p className="text-sm text-text-ghost text-center py-8">
              Chưa có thành ngữ.
            </p>
          )}
          {idioms.map((entry) => {
            const displayText = useSimplified && entry.textSimplified ? entry.textSimplified : entry.textTraditional;
            return (
              <Link
                key={entry.id}
                href={`/dictionary/entry/${entry.id}`}
                className="block p-3 rounded-xl bg-bg-primary border border-border-subtle hover:border-border-main transition-colors"
              >
                <span className="font-han-ming text-lg text-text-primary">
                  {displayText.split("").map((ch, i) => {
                    const tradCh = entry.textTraditional[i];
                    return (
                      <span
                        key={i}
                        className={tradCh === char.traditional ? "text-accent-gold" : ""}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
                <span className="text-sm font-bold text-hanviet ml-2">{entry.hanViet}</span>
                <p className="text-xs text-text-body mt-1">{entry.definition}</p>
                <Tag label="Thành ngữ" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Citations tab */}
      {activeTab === "citations" && (
        <div className="space-y-2">
          {citations.length === 0 && (
            <p className="text-sm text-text-ghost text-center py-8">
              Chưa có trích dẫn.
            </p>
          )}
          {citations.map((cit) => (
            <Link
              key={cit.sentence.id}
              href={`/read/${cit.workId}?chapter=${cit.sentence.chapterId}`}
              className="block p-3 rounded-xl bg-bg-subtle border-l-[3px] border-accent-gold rounded-l-none hover:bg-bg-secondary transition-colors"
            >
              <p className="font-han-ming text-base text-text-primary tracking-wide">
                {cit.sentence.textTraditional.split("").map((ch, i) => (
                  <span
                    key={i}
                    className={
                      ch === char.traditional ? "text-accent-gold font-bold" : ""
                    }
                  >
                    {ch}
                  </span>
                ))}
              </p>
              {cit.sentence.translation && (
                <p className="text-xs text-text-muted italic mt-1.5">
                  {cit.sentence.translation}
                </p>
              )}
              <p className="text-[10px] text-text-ghost mt-1.5">
                {cit.workTitle} · {cit.chapterTitle}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
