"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { characters } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { CharacterFull } from "@/types/dictionary";

const TOTAL_LIVES = 3;

const TONE_MARKS: Record<string, [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["ü", 1], ǘ: ["ü", 2], ǚ: ["ü", 3], ǜ: ["ü", 4],
};

const APPLY: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function findToneVowelIdx(base: string): number {
  for (let i = 0; i < base.length; i++) {
    if (base[i] === "a" || base[i] === "e") return i;
  }
  const ou = base.indexOf("ou");
  if (ou >= 0) return ou;
  for (let i = base.length - 1; i >= 0; i--) {
    if ("aeioüu".includes(base[i])) return i;
  }
  return -1;
}

function parsePinyin(py: string): { base: string; tone: number; idx: number } {
  for (let i = 0; i < py.length; i++) {
    const m = TONE_MARKS[py[i]];
    if (m) {
      return {
        base: py.slice(0, i) + m[0] + py.slice(i + 1),
        tone: m[1],
        idx: i,
      };
    }
  }
  return { base: py, tone: 5, idx: findToneVowelIdx(py) };
}

function applyTone(base: string, idx: number, tone: number): string {
  if (tone === 5 || idx < 0) return base;
  const ch = base[idx];
  const t = APPLY[ch];
  if (!t) return base;
  return base.slice(0, idx) + t[tone - 1] + base.slice(idx + 1);
}

const TONE_LABELS = ["1声 ˉ", "2声 ˊ", "3声 ˇ", "4声 ˋ", "轻声"];

type GameState = "idle" | "playing" | "answered" | "gameover";

interface Question {
  char: CharacterFull;
  pinyin: string;
  base: string;
  tone: number;
  toneIdx: number;
  hanViet: string;
  definition: string;
  options: string[];
}

function buildQuestion(char: CharacterFull): Question | null {
  const r = char.readings[0];
  if (!r?.pinyin) return null;
  const { base, tone, idx } = parsePinyin(r.pinyin);
  if (idx < 0 && tone !== 5) return null;
  const options = [1, 2, 3, 4, 5].map((t) =>
    t === 5 ? base : applyTone(base, idx, t)
  );
  const def = r.meanings[0]?.definition || "";
  return {
    char,
    pinyin: r.pinyin,
    base,
    tone,
    toneIdx: idx,
    hanViet: r.hanViet,
    definition: def,
    options,
  };
}

export default function ToneGamePage() {
  const addRewardPoints = useAppStore((s) => s.addRewardPoints);
  const rewardPoints = useAppStore((s) => s.rewardPoints);
  const addGameResult = useAppStore((s) => s.addGameResult);

  const pool = useMemo(
    () => characters.filter((c) => c.readings[0]?.pinyin),
    []
  );

  const [state, setState] = useState<GameState>("idle");
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [picked, setPicked] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const nextQuestion = useCallback(
    (hist: string[]) => {
      let q: Question | null = null;
      let tries = 0;
      while (!q && tries < 50) {
        const c = pool[Math.floor(Math.random() * pool.length)];
        if (hist.includes(c.id)) {
          tries++;
          continue;
        }
        q = buildQuestion(c);
        tries++;
      }
      if (!q) {
        const c = pool[Math.floor(Math.random() * pool.length)];
        q = buildQuestion(c);
      }
      if (q) {
        const newHist = [...hist, q.char.id].slice(-30);
        setHistory(newHist);
      }
      setQuestion(q);
      setPicked(-1);
    },
    [pool]
  );

  const startGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(TOTAL_LIVES);
    setHistory([]);
    setTotalPoints(0);
    setState("playing");
    nextQuestion([]);
  }, [nextQuestion]);

  const handlePick = useCallback(
    (tone: number) => {
      if (state !== "playing" || !question) return;
      const correct = tone === question.tone;
      setPicked(tone);
      setState("answered");
      if (correct) {
        const nextStreak = streak + 1;
        const pts = nextStreak;
        addRewardPoints(pts);
        setTotalPoints((tp) => tp + pts);
        setBestStreak((b) => Math.max(b, nextStreak));
        setStreak(nextStreak);
        setScore((s) => s + 1);
      } else {
        setStreak(0);
        setLives((l) => {
          if (l <= 1) {
            setTimeout(() => setState("gameover"), 800);
          }
          return l - 1;
        });
      }
    },
    [state, question, addRewardPoints, streak]
  );

  const handleNext = useCallback(() => {
    if (lives <= 0) {
      setState("gameover");
      return;
    }
    setState("playing");
    nextQuestion(history);
  }, [lives, nextQuestion, history]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (state === "gameover" && !savedRef.current && score > 0) {
      savedRef.current = true;
      addGameResult({
        game: "tone",
        score,
        pointsEarned: totalPoints,
        bestStreak,
        date: new Date().toISOString(),
      });
    }
    if (state === "playing") savedRef.current = false;
  }, [state, score, totalPoints, bestStreak, addGameResult]);

  // --- Idle screen ---
  if (state === "idle") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link
            href="/profile"
            className="text-text-muted hover:text-accent-dark text-sm mr-3"
          >
            ‹
          </Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">
            Đoán Thanh Điệu
          </h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-12">
          <p className="text-6xl mb-4">🎵</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-3">
            Đoán Thanh Điệu
          </h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto mb-2">
            Chọn thanh điệu đúng cho chữ Hán được hiển thị.
          </p>
          <p className="text-xs text-text-ghost mb-2">
            5 thanh · 3 mạng · {pool.length} chữ
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

  // --- Game Over screen ---
  if (state === "gameover") {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center h-12 mb-4">
          <Link
            href="/profile"
            className="text-text-muted hover:text-accent-dark text-sm mr-3"
          >
            ‹
          </Link>
          <h1 className="flex-1 text-center text-sm text-text-primary font-medium">
            Đoán Thanh Điệu
          </h1>
          <span className="w-6" />
        </div>

        <div className="text-center py-12">
          <p className="text-5xl mb-4">💀</p>
          <h2 className="font-han-kai text-xl text-text-primary mb-6">
            Kết thúc!
          </h2>
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">{score}</p>
              <p className="text-[11px] text-text-ghost mt-1">Câu đúng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-dark">
                {bestStreak}
              </p>
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

  // --- Playing / Answered ---
  if (!question) return null;

  const isCorrect = picked === question.tone;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center h-12 mb-2">
        <Link
          href="/profile"
          className="text-text-muted hover:text-accent-dark text-sm mr-3"
        >
          ‹
        </Link>
        <h1 className="flex-1 text-center text-sm text-text-primary font-medium">
          Đoán Thanh Điệu
        </h1>
        <span className="w-6" />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < lives ? "opacity-100" : "opacity-20"}`}
            >
              ♥
            </span>
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
      <div className="bg-bg-primary border border-border-subtle rounded-2xl p-6 mb-6 text-center">
        <p className="font-han-ming text-[56px] leading-none text-text-primary mb-4">
          {question.char.simplified || question.char.traditional}
        </p>
        <p className="text-lg text-text-muted font-mono tracking-wider mb-3">
          {question.base}
        </p>
        <div className="h-px bg-border-subtle mx-8 mb-3" />
        <p className="text-sm text-accent-dark mb-1">{question.hanViet}</p>
        {question.definition && (
          <p className="text-xs text-text-muted">{question.definition}</p>
        )}
      </div>

      {/* Tone options */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((tone) => {
          let btnClass =
            "py-3 rounded-xl border text-center transition-colors ";
          if (state === "answered") {
            if (tone === question.tone) {
              btnClass +=
                "border-green-500 bg-green-500/15 text-green-700";
            } else if (tone === picked) {
              btnClass += "border-red-400 bg-red-500/15 text-red-600";
            } else {
              btnClass +=
                "border-border-subtle bg-bg-secondary text-text-ghost opacity-50";
            }
          } else {
            btnClass +=
              "border-border-subtle bg-bg-primary text-text-primary hover:border-accent-gold hover:bg-accent-gold/5 active:bg-accent-gold/10";
          }
          return (
            <button
              key={tone}
              onClick={() => handlePick(tone)}
              disabled={state !== "playing"}
              className={btnClass}
            >
              <p className="text-sm font-medium mb-0.5">
                {question.options[tone - 1]}
              </p>
              <p className="text-[9px] text-text-ghost">{TONE_LABELS[tone - 1]}</p>
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {state === "answered" && (
        <div className="text-center">
          <p
            className={`text-sm font-medium mb-3 ${
              isCorrect ? "text-green-600" : "text-red-500"
            }`}
          >
            {isCorrect
              ? ["Chính xác!", "Đúng rồi!", "Tuyệt vời!"][
                  Math.floor(Math.random() * 3)
                ]
              : `Sai rồi! Đáp án: ${question.pinyin}`}
          </p>
          {lives > 0 && (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-text-body text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Câu tiếp →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
