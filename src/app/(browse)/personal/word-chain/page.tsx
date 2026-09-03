"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { entries } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { Entry } from "@/types/dictionary";

const MAX_TRIES = 3;
const HINT_COST = 500;
const SKIP_COST = 500;

interface CompoundInfo {
  text: string;
  hanViet: string;
  pinyin: string;
  definition: string;
}

function buildPool(allEntries: Entry[]) {
  const pool = new Map<string, CompoundInfo>();
  const byFirst = new Map<string, CompoundInfo[]>();

  for (const e of allEntries) {
    const text = e.textSimplified || e.textTraditional;
    if (!text || text.length !== 2 || e.entryType !== "compound") continue;
    const info: CompoundInfo = {
      text,
      hanViet: e.hanViet,
      pinyin: e.pinyin || "",
      definition: e.definition,
    };
    pool.set(text, info);
    const first = text[0];
    if (!byFirst.has(first)) byFirst.set(first, []);
    byFirst.get(first)!.push(info);
  }

  return { pool, byFirst };
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type GameState = "idle" | "playing" | "gameover" | "win";
const WIN_BONUS = 500;

export default function WordChainPage() {
  const addRewardPoints = useAppStore((s) => s.addRewardPoints);
  const rewardPoints = useAppStore((s) => s.rewardPoints);
  const spendRewardPoints = useAppStore((s) => s.spendRewardPoints);
  const addGameResult = useAppStore((s) => s.addGameResult);
  const recordWordUsed = useAppStore((s) => s.recordWordUsed);
  const isWordOnCooldown = useAppStore((s) => s.isWordOnCooldown);

  const { pool, byFirst } = useMemo(() => buildPool(entries), []);

  const [state, setState] = useState<GameState>("idle");

  const chainableStarters = useMemo(() => {
    const result: CompoundInfo[] = [];
    for (const [, info] of pool) {
      if (isWordOnCooldown(info.text)) continue;
      const last = info.text[1];
      const nexts = byFirst.get(last);
      if (nexts && nexts.some((n) => !isWordOnCooldown(n.text))) {
        result.push(info);
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, byFirst, state]);
  const [chain, setChain] = useState<CompoundInfo[]>([]);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | "hint" | "skip"; text: string } | null>(null);
  const [hintChar, setHintChar] = useState<string | null>(null);
  const [sessionUsed, setSessionUsed] = useState<Set<string>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const chainEndRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);

  const currentWord = chain.length > 0 ? chain[chain.length - 1] : null;
  const requiredChar = currentWord ? currentWord.text[1] : "";

  const getValidAnswers = useCallback(
    (char: string, sessUsed: Set<string>) => {
      const candidates = byFirst.get(char) || [];
      return candidates.filter((c) => !sessUsed.has(c.text) && !isWordOnCooldown(c.text));
    },
    [byFirst, isWordOnCooldown]
  );

  const startGame = useCallback(() => {
    const starter = pickRandom(chainableStarters);
    recordWordUsed(starter.text);
    setChain([starter]);
    setSessionUsed(new Set([starter.text]));
    setScore(0);
    setTries(0);
    setInput("");
    setFeedback(null);
    setHintChar(null);
    setTotalPoints(0);
    savedRef.current = false;
    setState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [chainableStarters, recordWordUsed]);

  useEffect(() => {
    if (chainEndRef.current) {
      chainEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [chain.length]);

  const handleSubmit = useCallback(() => {
    if (state !== "playing" || !currentWord) return;
    const trimmed = input.trim();
    if (trimmed.length !== 2) {
      setFeedback({ type: "wrong", text: "Nhập đúng 2 chữ Hán" });
      return;
    }

    if (trimmed[0] !== requiredChar) {
      setTries((t) => {
        const next = t + 1;
        if (next >= MAX_TRIES) {
          const valid = getValidAnswers(requiredChar, sessionUsed);
          setFeedback({
            type: "wrong",
            text: valid.length > 0
              ? `Hết lượt! Đáp án gợi ý: ${valid[0].text} (${valid[0].hanViet})`
              : "Hết lượt! Không tìm thấy từ phù hợp.",
          });
          setTimeout(() => setState("gameover"), 1500);
        } else {
          setFeedback({ type: "wrong", text: `Chữ đầu phải là「${requiredChar}」· Còn ${MAX_TRIES - next} lần` });
        }
        return next;
      });
      setInput("");
      return;
    }

    const found = pool.get(trimmed);
    if (!found) {
      setTries((t) => {
        const next = t + 1;
        if (next >= MAX_TRIES) {
          const valid = getValidAnswers(requiredChar, sessionUsed);
          setFeedback({
            type: "wrong",
            text: valid.length > 0
              ? `Hết lượt! Đáp án gợi ý: ${valid[0].text} (${valid[0].hanViet})`
              : "Hết lượt!",
          });
          setTimeout(() => setState("gameover"), 1500);
        } else {
          setFeedback({ type: "wrong", text: `「${trimmed}」không có trong từ điển · Còn ${MAX_TRIES - next} lần` });
        }
        return next;
      });
      setInput("");
      return;
    }

    if (sessionUsed.has(trimmed) || isWordOnCooldown(trimmed)) {
      setTries((t) => {
        const next = t + 1;
        if (next >= MAX_TRIES) {
          setFeedback({ type: "wrong", text: "Hết lượt! Từ này đang trong thời gian hồi." });
          setTimeout(() => setState("gameover"), 1500);
        } else {
          setFeedback({ type: "wrong", text: `「${trimmed}」đang hồi chiêu · Còn ${MAX_TRIES - next} lần` });
        }
        return next;
      });
      setInput("");
      return;
    }

    const nextScore = score + 1;
    const pts = nextScore;
    addRewardPoints(pts);
    setTotalPoints((tp) => tp + pts);
    setScore(nextScore);
    setTries(0);
    setHintChar(null);
    setFeedback({ type: "correct", text: `${found.hanViet} — ${found.definition}` });
    recordWordUsed(trimmed);
    const newSessUsed = new Set(sessionUsed);
    newSessUsed.add(trimmed);
    setSessionUsed(newSessUsed);
    setChain((c) => [...c, found]);
    setInput("");

    const nextValid = getValidAnswers(found.text[1], newSessUsed);
    if (nextValid.length === 0) {
      addRewardPoints(WIN_BONUS);
      setTotalPoints((tp) => tp + WIN_BONUS);
      setFeedback({ type: "correct", text: `${found.hanViet} — ${found.definition} · Thắng! Không còn từ nối tiếp. +${WIN_BONUS}★` });
      setTimeout(() => setState("win"), 2000);
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [state, currentWord, input, requiredChar, pool, sessionUsed, isWordOnCooldown, addRewardPoints, recordWordUsed, getValidAnswers, score]);

  const handleHint = useCallback(() => {
    if (!requiredChar) return;
    const valid = getValidAnswers(requiredChar, sessionUsed);
    if (valid.length === 0) return;
    if (!spendRewardPoints(HINT_COST)) {
      setFeedback({ type: "hint", text: `Cần ${HINT_COST} điểm thưởng! Hiện có ${rewardPoints}` });
      return;
    }
    const answer = pickRandom(valid);
    setHintChar(answer.text[1]);
    setFeedback({ type: "hint", text: `Gợi ý: ${requiredChar}＿ → chữ thứ 2 là「${answer.text[1]}」` });
  }, [requiredChar, getValidAnswers, sessionUsed, spendRewardPoints, rewardPoints]);

  const handleSkip = useCallback(() => {
    if (!requiredChar) return;
    const valid = getValidAnswers(requiredChar, sessionUsed);
    if (valid.length === 0) {
      setState("gameover");
      return;
    }
    if (!spendRewardPoints(SKIP_COST)) {
      setFeedback({ type: "skip", text: `Cần ${SKIP_COST} điểm thưởng! Hiện có ${rewardPoints}` });
      return;
    }
    const answer = pickRandom(valid);
    recordWordUsed(answer.text);
    const newSessUsed = new Set(sessionUsed);
    newSessUsed.add(answer.text);
    setSessionUsed(newSessUsed);
    setChain((c) => [...c, answer]);
    setTries(0);
    setHintChar(null);
    setInput("");
    setFeedback({ type: "skip", text: `Bỏ qua → ${answer.text} (${answer.hanViet})` });

    const nextValid = getValidAnswers(answer.text[1], newSessUsed);
    if (nextValid.length === 0) {
      setFeedback({ type: "skip", text: `${answer.text} (${answer.hanViet}) · Chuỗi kết thúc!` });
      setTimeout(() => setState("gameover"), 2000);
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [requiredChar, getValidAnswers, sessionUsed, spendRewardPoints, rewardPoints, recordWordUsed]);

  useEffect(() => {
    if ((state === "gameover" || state === "win") && !savedRef.current && score > 0) {
      savedRef.current = true;
      addGameResult({
        game: "chain",
        score,
        pointsEarned: totalPoints,
        chainLength: chain.length,
        date: new Date().toISOString(),
      });
    }
    if (state === "playing") savedRef.current = false;
  }, [state, score, totalPoints, chain.length, addGameResult]);

  if (state === "idle") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Nối Từ</h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-12">
          <p className="text-6xl mb-4">🔗</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-3">Nối Từ</h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto mb-2">
            Nối từ ghép 2 chữ: chữ cuối của từ trước là chữ đầu của từ sau.
          </p>
          <p className="text-xs text-text-ghost mb-2">
            {pool.size} từ ghép · 3 lần thử mỗi từ
          </p>
          <p className="text-xs text-accent-dark mb-8">
            ★ {rewardPoints} điểm thưởng
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-2xl bg-text-body text-bg-primary font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    );
  }

  if (state === "gameover") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Nối Từ</h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-8">
          <p className="text-5xl mb-4">🏆</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-6">Kết thúc!</h2>
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{score}</p>
              <p className="text-[11px] text-text-ghost mt-1">Từ đúng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{chain.length}</p>
              <p className="text-[11px] text-text-ghost mt-1">Chuỗi dài</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{totalPoints}</p>
              <p className="text-[11px] text-text-ghost mt-1">★ Nhận</p>
            </div>
          </div>

          {/* Show the chain */}
          <div className="mb-4 max-h-40 overflow-y-auto px-4">
            <div className="flex flex-wrap justify-center gap-1">
              {chain.map((w, i) => (
                <span key={i} className="text-sm text-text-muted">
                  {i > 0 && <span className="text-text-ghost mx-0.5">→</span>}
                  <span className="font-han-ming">{w.text}</span>
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-muted mb-6">Tổng: ★ {rewardPoints}</p>

          <button
            onClick={startGame}
            className="px-8 py-3 rounded-2xl bg-text-body text-bg-primary font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  if (state === "win") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Nối Từ</h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-8">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-2">Chiến thắng!</h2>
          <p className="text-sm text-accent-dark mb-6">Không còn từ nào nối tiếp được · +{WIN_BONUS}★ thưởng</p>
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{score}</p>
              <p className="text-[11px] text-text-ghost mt-1">Từ đúng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{chain.length}</p>
              <p className="text-[11px] text-text-ghost mt-1">Chuỗi dài</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{totalPoints}</p>
              <p className="text-[11px] text-text-ghost mt-1">★ Nhận</p>
            </div>
          </div>

          <div className="mb-4 max-h-40 overflow-y-auto px-4">
            <div className="flex flex-wrap justify-center gap-1">
              {chain.map((w, i) => (
                <span key={i} className="text-sm text-text-muted">
                  {i > 0 && <span className="text-text-ghost mx-0.5">→</span>}
                  <span className="font-han-ming">{w.text}</span>
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-muted mb-6">Tổng: ★ {rewardPoints}</p>

          <button
            onClick={startGame}
            className="px-8 py-3 rounded-2xl bg-text-body text-bg-primary font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center h-12 mb-2">
        <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
        <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Nối Từ</h1>
        <span className="w-6" />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {MAX_TRIES - tries} lần thử
          </span>
        </div>
        <div className="flex items-center gap-4">
          {score > 0 && (
            <span className="text-xs text-accent-dark font-medium">
              x{score + 1}
            </span>
          )}
          <span className="text-sm font-bold text-text-primary">★ {totalPoints}</span>
        </div>
      </div>

      {/* Chain display */}
      <div className="bg-bg-primary border border-border-subtle rounded-2xl p-4 mb-4 max-h-32 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-1">
          {chain.map((w, i) => (
            <span key={i} className="inline-flex items-center">
              {i > 0 && <span className="text-text-ghost text-xs mx-1">→</span>}
              <span className={`font-han-ming text-base ${i === chain.length - 1 ? "text-accent-dark font-bold" : "text-text-muted"}`}>
                {w.text}
              </span>
            </span>
          ))}
          <div ref={chainEndRef} />
        </div>
      </div>

      {/* Current word card */}
      {currentWord && (
        <div className="bg-bg-primary border border-border-subtle rounded-2xl p-6 mb-4 text-center">
          <p className="font-han-ming text-[48px] leading-none text-text-primary mb-3">
            {currentWord.text}
          </p>
          <p className="text-sm text-accent-dark mb-1">{currentWord.hanViet}</p>
          <p className="text-xs text-text-muted mb-4">{currentWord.definition}</p>
          <div className="h-px bg-border-subtle mx-8 mb-4" />
          <p className="text-sm text-text-muted">
            Nhập từ ghép bắt đầu bằng「<span className="font-han-ming text-lg text-accent-dark font-bold">{requiredChar}</span>」
          </p>
          {hintChar && (
            <p className="text-xs text-accent-dark mt-1">
              Gợi ý: {requiredChar}<span className="font-bold">{hintChar}</span>
            </p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={`${requiredChar}＿`}
          maxLength={2}
          className="flex-1 px-4 py-3 rounded-xl border border-border-subtle bg-bg-primary text-text-primary text-center font-han-ming text-lg focus:outline-none focus:border-accent-gold transition-colors"
        />
        <button
          onClick={handleSubmit}
          className="px-5 py-3 rounded-xl bg-text-body text-bg-primary font-medium text-sm hover:opacity-90 transition-opacity"
        >
          OK
        </button>
      </div>

      {/* Hint / Skip buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleHint}
          className="flex-1 py-2 rounded-xl border border-border-subtle bg-bg-primary text-text-muted text-xs hover:border-accent-gold transition-colors"
        >
          Gợi ý ({HINT_COST} ★)
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 py-2 rounded-xl border border-border-subtle bg-bg-primary text-text-muted text-xs hover:border-accent-gold transition-colors"
        >
          Bỏ qua ({SKIP_COST} ★)
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center text-sm font-medium px-4 py-2 rounded-xl ${
          feedback.type === "correct"
            ? "text-green-600 bg-green-500/10"
            : feedback.type === "wrong"
            ? "text-red-500 bg-red-500/10"
            : "text-accent-dark bg-accent-gold/10"
        }`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
