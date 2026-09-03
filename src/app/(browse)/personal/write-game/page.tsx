"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { characters, entries } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

const TOTAL_LIVES = 3;
const HINT_COST = 500;
const SKIP_COST = 500;

interface QuestionItem {
  text: string;
  hanViet: string;
  pinyin: string;
  definition: string;
  charCount: number;
}

function buildPool(
  chars: typeof characters,
  ents: typeof entries,
): QuestionItem[] {
  const pool: QuestionItem[] = [];
  const seen = new Set<string>();

  for (const c of chars) {
    const r = c.readings[0];
    if (!r?.pinyin || !r.hanViet) continue;
    const def = r.meanings[0]?.definition;
    if (!def) continue;
    const text = c.simplified || c.traditional;
    if (seen.has(text)) continue;
    seen.add(text);
    pool.push({
      text,
      hanViet: r.hanViet,
      pinyin: r.pinyin,
      definition: def,
      charCount: text.length,
    });
  }

  for (const e of ents) {
    if (!e.definition || e.definition === e.hanViet) continue;
    const text = e.textSimplified || e.textTraditional;
    if (seen.has(text)) continue;
    seen.add(text);
    pool.push({
      text,
      hanViet: e.hanViet,
      pinyin: e.pinyin || "",
      definition: e.definition,
      charCount: text.length,
    });
  }

  return pool;
}

type GameState = "idle" | "playing" | "gameover";
type HintLevel = 0 | 1 | 2;

export default function WriteGamePage() {
  const addRewardPoints = useAppStore((s) => s.addRewardPoints);
  const rewardPoints = useAppStore((s) => s.rewardPoints);
  const spendRewardPoints = useAppStore((s) => s.spendRewardPoints);
  const addGameResult = useAppStore((s) => s.addGameResult);
  const recordWriteGameUsed = useAppStore((s) => s.recordWriteGameUsed);
  const isWriteGameOnCooldown = useAppStore((s) => s.isWriteGameOnCooldown);

  const pool = useMemo(
    () => buildPool(characters, entries),
    [],
  );

  const [state, setState] = useState<GameState>("idle");
  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | "skip"; text: string } | null>(null);
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);

  const pickQuestion = useCallback(
    (hist: string[]) => {
      let tries = 0;
      while (tries < 100) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        if (hist.includes(item.text) || isWriteGameOnCooldown(item.text)) {
          tries++;
          continue;
        }
        const newHist = [...hist, item.text].slice(-50);
        setHistory(newHist);
        setQuestion(item);
        setInput("");
        setHintLevel(0);
        setFeedback(null);
        return;
      }
      const item = pool[Math.floor(Math.random() * pool.length)];
      setQuestion(item);
      setInput("");
      setHintLevel(0);
      setFeedback(null);
    },
    [pool, isWriteGameOnCooldown],
  );

  const startGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(TOTAL_LIVES);
    setHistory([]);
    setTotalPoints(0);
    savedRef.current = false;
    setState("playing");
    pickQuestion([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [pickQuestion]);

  const advanceNext = useCallback(() => {
    if (lives <= 0) {
      setState("gameover");
      return;
    }
    pickQuestion(history);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [lives, pickQuestion, history]);

  const handleSubmit = useCallback(() => {
    if (state !== "playing" || !question) return;
    const trimmed = input.trim();
    if (trimmed.length !== question.charCount) {
      setFeedback({ type: "wrong", text: `Nhập đúng ${question.charCount} chữ Hán` });
      return;
    }

    if (trimmed === question.text) {
      const nextStreak = streak + 1;
      const pts = nextStreak;
      addRewardPoints(pts);
      setTotalPoints((tp) => tp + pts);
      setBestStreak((b) => Math.max(b, nextStreak));
      setStreak(nextStreak);
      setScore((s) => s + 1);
      recordWriteGameUsed(question.text);
      setFeedback({ type: "correct", text: `${question.text} · ${question.hanViet}` });
      setInput("");
      setTimeout(() => advanceNext(), 1200);
    } else {
      setStreak(0);
      setLives((l) => {
        if (l <= 1) {
          setFeedback({ type: "wrong", text: `Sai! Đáp án: ${question.text} (${question.hanViet})` });
          setTimeout(() => setState("gameover"), 1500);
        } else {
          setFeedback({ type: "wrong", text: `Sai rồi! Còn ${l - 1} mạng` });
        }
        return l - 1;
      });
      setInput("");
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [state, question, input, streak, addRewardPoints, recordWriteGameUsed, advanceNext]);

  const handleHint = useCallback(() => {
    if (!question || hintLevel >= 2) return;
    if (!spendRewardPoints(HINT_COST)) {
      setFeedback({ type: "wrong", text: `Cần ${HINT_COST} điểm! Hiện có ${rewardPoints}` });
      return;
    }
    setHintLevel((l) => Math.min(l + 1, 2) as HintLevel);
  }, [question, hintLevel, spendRewardPoints, rewardPoints]);

  const handleSkip = useCallback(() => {
    if (!question) return;
    if (!spendRewardPoints(SKIP_COST)) {
      setFeedback({ type: "skip", text: `Cần ${SKIP_COST} điểm! Hiện có ${rewardPoints}` });
      return;
    }
    setStreak(0);
    setFeedback({ type: "skip", text: `Bỏ qua → ${question.text} (${question.hanViet})` });
    setInput("");
    setTimeout(() => advanceNext(), 1200);
  }, [question, spendRewardPoints, rewardPoints, advanceNext]);

  useEffect(() => {
    if (state === "gameover" && !savedRef.current && score > 0) {
      savedRef.current = true;
      addGameResult({
        game: "write",
        score,
        pointsEarned: totalPoints,
        bestStreak,
        date: new Date().toISOString(),
      });
    }
    if (state === "playing") savedRef.current = false;
  }, [state, score, totalPoints, bestStreak, addGameResult]);

  if (state === "idle") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Viết Chữ</h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-12">
          <p className="text-6xl mb-4">✍️</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-3">Viết Chữ</h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto mb-2">
            Nhìn nghĩa, viết đúng chữ Hán tương ứng.
          </p>
          <p className="text-xs text-text-ghost mb-2">
            {pool.length} từ · 3 mạng
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
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Viết Chữ</h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-12">
          <p className="text-5xl mb-4">💀</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-6">Kết thúc!</h2>
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{score}</p>
              <p className="text-[11px] text-text-ghost mt-1">Câu đúng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{bestStreak}</p>
              <p className="text-[11px] text-text-ghost mt-1">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{totalPoints}</p>
              <p className="text-[11px] text-text-ghost mt-1">★ Nhận</p>
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

  if (!question) return null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center h-12 mb-2">
        <Link href="/profile" className="text-text-muted hover:text-accent-dark text-sm mr-3">‹</Link>
        <h1 className="flex-1 text-center text-sm text-text-primary font-medium">Viết Chữ</h1>
        <span className="w-6" />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <span key={i} className={`text-lg ${i < lives ? "opacity-100" : "opacity-20"}`}>♥</span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <span className="text-xs text-accent-dark font-medium">
              x{streak + 1} · {streak} 🔥
            </span>
          )}
          <span className="text-sm font-bold text-text-primary">★ {totalPoints}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-bg-primary border border-border-subtle rounded-2xl p-6 mb-4 text-center">
        <p className="text-sm text-text-muted mb-4">{question.definition}</p>
        <div className="h-px bg-border-subtle mx-8 mb-4" />

        {/* Character slots */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: question.charCount }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg border-2 border-border-subtle flex items-center justify-center font-han-ming text-2xl text-text-primary"
            >
              {input[i] || ""}
            </div>
          ))}
        </div>

        {/* Hints */}
        {hintLevel >= 1 && (
          <p className="text-sm text-accent-dark mb-1">{question.hanViet}</p>
        )}
        {hintLevel >= 2 && question.pinyin && (
          <p className="text-xs text-text-muted">{question.pinyin}</p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={Array.from({ length: question.charCount }).map(() => "＿").join("")}
          maxLength={question.charCount}
          className="flex-1 h-12 px-4 rounded-xl border border-border-subtle bg-bg-primary text-center font-han-ming text-xl text-text-primary outline-none focus:border-accent-gold transition-colors"
        />
        <button
          onClick={handleSubmit}
          className="h-12 px-5 rounded-xl bg-text-body text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity"
        >
          OK
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleHint}
          disabled={hintLevel >= 2}
          className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs text-text-muted hover:border-accent-gold transition-colors disabled:opacity-30"
        >
          {hintLevel === 0 ? `Hán Việt (${HINT_COST} ★)` : hintLevel === 1 ? `Pinyin (${HINT_COST} ★)` : "Đã gợi ý"}
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs text-text-muted hover:border-accent-gold transition-colors"
        >
          Bỏ qua ({SKIP_COST} ★)
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center py-3 px-4 rounded-xl text-sm font-medium ${
          feedback.type === "correct"
            ? "bg-green-500/10 text-green-700"
            : feedback.type === "skip"
            ? "bg-yellow-500/10 text-yellow-700"
            : "bg-red-500/10 text-red-600"
        }`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
