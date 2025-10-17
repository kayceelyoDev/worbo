"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  House,
  Sparkles,
  RotateCcw,
  Loader2,
  Trophy,
  RefreshCcw,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Flame,
  Target,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { getRank } from "@/lib/getRank";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

export default function GameUI() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_TRIES).fill(""));
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [targetWord, setTargetWord] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [animatedPoints, setAnimatedPoints] = useState<number | null>(null);
  const [isPositive, setIsPositive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [usedKeys, setUsedKeys] = useState<Record<string, string>>({});
  const router = useRouter();

  const guessesRef = useRef<string[]>(guesses);
  const currentRowRef = useRef<number>(currentRow);
  const targetWordRef = useRef<string>(targetWord);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);

  useEffect(() => {
    currentRowRef.current = currentRow;
  }, [currentRow]);

  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/auth/signin");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("userProfile")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("No user profile found", profileError);
        return;
      }

      setUserProfile(profile);
    };

    checkAuth();
  }, [router]);

  const categories = [
    "animals",
    "countries",
    "sports",
    "fruits",
    "colors",
    "vehicles",
    "technology",
    "movies",
    "music",
    "planets",
    "occupations",
    "flowers",
    "emotions",
    "foods",
    "bodyparts",
    "brands",
    "companies",
    "birds",
    "capital",
  ];

  const fetchWord = async () => {
    setLoading(true);
    setMessage("");
    let attempts = 0;
    const maxAttempts = 7;

    while (attempts < maxAttempts) {
      try {
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        const res = await fetch(
          `https://random-words-api.kushcreates.com/api?category=${randomCategory}&length=${WORD_LENGTH}&words=1`
        );

        if (!res.ok) throw new Error("Failed API response");

        const data = await res.json();
        const fetched = data?.[0]?.word?.toUpperCase?.();

        if (
          fetched &&
          fetched.length === WORD_LENGTH &&
          /^[A-Z]+$/.test(fetched)
        ) {
          setTargetWord(fetched);
          setCategory(
            randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)
          );
          setStartTime(Date.now());
          setLoading(false);
          console.log("Fetched Word:", fetched, "Category:", randomCategory);
          return;
        } else {
          attempts++;
        }
      } catch (err) {
        console.error("Fetch attempt failed:", err);
        attempts++;
      }
    }

    setMessage("Failed to load a word after multiple attempts. Try refreshing.");
    setLoading(false);
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchWord();
  }, []);

  const saveScore = async (newScore: number, success: boolean) => {
    if (!userProfile) return;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from("scores_table")
        .select("id, score, rank")
        .eq("user_id", userProfile.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing score:", fetchError);
        return;
      }

      let updatedScore = newScore;

      if (existing) {
        if (!success) {
          const currentScore = existing.score;
          let deduction = 0;
          if (currentScore < 10000) deduction = 200;
          else if (currentScore < 15000) deduction = 300;
          else if (currentScore < 20000) deduction = 500;
          else if (currentScore < 25000) deduction = 600;
          else if (currentScore < 30000) deduction = 650;
          else deduction = 700;

          updatedScore = Math.max(0, existing.score - deduction);
          setAnimatedPoints(-deduction);
          setIsPositive(false);
        } else {
          updatedScore = existing.score + newScore;
          setAnimatedPoints(newScore);
          setIsPositive(true);
        }

        const { name: rankName } = getRank(updatedScore);

        const { error: updateError } = await supabase
          .from("scores_table")
          .update({ score: updatedScore, rank: rankName })
          .eq("id", existing.id);

        if (updateError) console.error("Error updating score:", updateError);
      } else {
        const { name: rankName } = getRank(newScore);

        const { error: insertError } = await supabase
          .from("scores_table")
          .insert([{ user_id: userProfile.id, score: newScore, rank: rankName }]);

        if (insertError) console.error("Error inserting score:", insertError);
        setAnimatedPoints(newScore);
        setIsPositive(true);
      }
    } catch (err) {
      console.error("Unexpected error saving score:", err);
    }
  };

  const handleKeyPress = async (rawKey: string) => {
    if (!userProfile || loading || gameOver) return;

    const key = rawKey.toUpperCase();
    const rowIndex = currentRowRef.current;
    const rowValue = guessesRef.current[rowIndex] || "";

    if (key === "ENTER") {
      if (rowValue.length !== WORD_LENGTH) {
        setMessage("Not enough letters");
        return;
      }

      const guess = rowValue.toUpperCase();
      const end = Date.now();
      const timeTaken = Math.floor((end - (startTime || end)) / 1000);

      const newKeys = { ...usedKeys };
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        if (letter === targetWordRef.current[i]) newKeys[letter] = "correct";
        else if (targetWordRef.current.includes(letter))
          newKeys[letter] =
            newKeys[letter] !== "correct" ? "present" : "correct";
        else newKeys[letter] = "absent";
      }
      setUsedKeys(newKeys);

      if (guess === targetWordRef.current) {
        const baseScore = 50;
        const timeBonus = Math.max(0, 500 - timeTaken * 5);
        const attemptPenalty = (rowIndex + 1) * 50;
        const finalScore = Math.max(
          baseScore,
          baseScore + timeBonus - attemptPenalty
        );

        setScore(finalScore);
        setEndTime(end);
        setMessage("You got it!");
        setGameOver(true);
        setAnimatedPoints(finalScore);
        setIsPositive(true);
        await saveScore(finalScore, true);
        return;
      }

      if (rowIndex + 1 >= MAX_TRIES) {
        setScore(0);
        setEndTime(end);
        setMessage(`Answer: ${targetWordRef.current}`);
        setGameOver(true);
        setAnimatedPoints(0);
        setIsPositive(false);
        await saveScore(0, false);
        return;
      }

      setMessage("");
      setCurrentRow((r) => r + 1);
      return;
    }

    if (key === "BACKSPACE" || key === "DEL") {
      setGuesses((prev) => {
        const updated = [...prev];
        updated[rowIndex] = updated[rowIndex].slice(0, -1);
        return updated;
      });
      return;
    }

    if (/^[A-Z]$/.test(key)) {
      if (rowValue.length >= WORD_LENGTH) return;
      setGuesses((prev) => {
        const updated = [...prev];
        updated[rowIndex] += key;
        return updated;
      });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") return handleKeyPress("ENTER");
      if (e.key === "Backspace") return handleKeyPress("DEL");
      if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, gameOver, userProfile]);

  const restartGame = async () => {
    setGuesses(Array(MAX_TRIES).fill(""));
    setCurrentRow(0);
    setMessage("");
    setScore(null);
    setEndTime(null);
    setGameOver(false);
    setUsedKeys({});
    setAnimatedPoints(null);
    await fetchWord();
  };

  const keyboardLayout: string[][] = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "DEL"],
  ];

  const getTileColor = (letter: string, index: number, rowIdx: number) => {
    const upper = letter.toUpperCase();
    if (rowIdx >= currentRow) return "bg-slate-700/70 border-slate-600";
    if (!upper) return "bg-slate-700/70 border-slate-600";
    if (upper === targetWordRef.current[index]) return "bg-green-500 border-green-400";
    if (targetWordRef.current.includes(upper)) return "bg-yellow-500 border-yellow-400";
    return "bg-slate-600 border-slate-500";
  };

  const getKeyColor = (key: string) => {
    const state = usedKeys[key];
    if (state === "correct") return "bg-green-500 text-white hover:bg-green-600";
    if (state === "present") return "bg-yellow-500 text-white hover:bg-yellow-600";
    if (state === "absent") return "bg-slate-600 text-gray-300 hover:bg-slate-700";
    return "bg-slate-700 text-white hover:bg-slate-600";
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8" />
          <p className="text-lg font-semibold">Loading word...</p>
        </div>
      </div>
    );

  const timeTaken =
    endTime && startTime ? Math.floor((endTime - startTime) / 1000) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-3 sm:p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating gradient graphics */}
      <div className="fixed -top-40 -left-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <div className="relative z-10 w-full flex items-center justify-between mb-6 sm:mb-8 px-2">
        <Link href="/menu" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition transform hover:scale-110">
          <House className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Menu</span>
        </Link>

        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
            WOR<span className="text-green-500">BO</span>
          </h1>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
        </div>

        <div className="w-5 h-5 sm:w-6 sm:h-6"></div>
      </div>

      {/* Category & Attempts */}
      {category && !gameOver && (
        <div className="relative z-10 flex flex-col items-center gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <p className="text-sm sm:text-base">Category: <span className="text-yellow-400 font-bold">{category}</span></p>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <p className="text-sm sm:text-base">Attempts: <span className="text-orange-400 font-bold">{currentRow}/{MAX_TRIES}</span></p>
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="space-y-2 mb-6">
          {guesses.map((word, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5 sm:gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                const letter = word[colIdx] || "";
                const colorClass = getTileColor(letter, colIdx, rowIdx);
                return (
                  <div
                    key={colIdx}
                    className={`${colorClass} w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-white rounded-lg border-2 text-lg sm:text-xl transition transform ${
                      letter && rowIdx < currentRow ? 'scale-100' : 'scale-95'
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`text-center mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            message.includes("Not enough") 
              ? "bg-red-500/20 border border-red-400/50 text-red-300" 
              : "bg-slate-700/50 border border-slate-600 text-slate-300"
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm sm:text-base">{message}</p>
          </div>
        )}

        {/* Keyboard */}
        <div className="space-y-1.5 sm:space-y-2 mb-6">
          {keyboardLayout.map((row, rIdx) => (
            <div key={rIdx} className="flex   justify-center gap-1 sm:gap-1  flex-wrap sm:flex-nowrap">
              {row.map((k) => {
                if (k === "ENTER" || k === "DEL") return null;
                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    disabled={gameOver}
                    className={`${getKeyColor(k)} px-2  sm:px-4 py-3 sm:py-5 rounded-lg font-semibold text-xs sm:text-lg transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}

          {/* ENTER and DEL */}
          <div className="flex justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            <button
              onClick={() => handleKeyPress("ENTER")}
              disabled={gameOver}
              className={`${getKeyColor("ENTER")} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              ENTER
            </button>
            <button
              onClick={() => handleKeyPress("DEL")}
              disabled={gameOver}
              className={`${getKeyColor("DEL")} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              DEL
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {!gameOver && (
          <div className="flex flex-col gap-2">
            <button
              onClick={restartGame}
              className="group relative overflow-hidden rounded-xl w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-100 group-hover:opacity-0 transition"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 group-hover:from-orange-500 group-hover:to-red-600 text-white font-bold py-2 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg shadow-orange-500/30">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">New Game</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-slate-700 relative max-w-sm w-full">
            {/* Animated Points */}
            {animatedPoints !== null && (
              <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-2xl pointer-events-none ${
                isPositive ? "text-green-400 animate-bounce" : "text-red-500 animate-pulse"
              }`}>
                {isPositive ? (
                  <div className="flex items-center gap-1">
                    <ArrowUpCircle className="w-6 h-6" /> +{animatedPoints}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <ArrowDownCircle className="w-6 h-6" /> {animatedPoints}
                  </div>
                )}
              </div>
            )}

            <Trophy className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              {score && score > 0 ? "You Won!" : "Game Over"}
            </h2>

            {/* Stats */}
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6 space-y-2 text-sm sm:text-base">
              <div className="flex justify-between text-slate-300">
                <span>Score:</span>
                <span className="text-green-400 font-bold">{animatedPoints}</span>
              </div>
              {score === 0 && currentRow === MAX_TRIES && (
                <div className="flex justify-between text-slate-300">
                  <span>Score Lost:</span>
                  <span className="text-red-400 font-bold">{animatedPoints}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Attempts Used:</span>
                <span className="text-yellow-400 font-bold">6</span>
              </div>
              {timeTaken !== null && (
                <div className="flex justify-between text-slate-300">
                  <span>Time:</span>
                  <span className="text-blue-400 font-bold">{timeTaken}s</span>
                </div>
              )}
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Word:</span>
                  <span className="text-green-400 font-bold">{targetWord}</span>
                </div>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Category:</span>
                <span className="text-yellow-400 font-bold">{category}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={restartGame}
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-green-500 group-hover:from-green-500 group-hover:to-blue-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <RefreshCcw className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Play Again</span>
                </div>
              </button>
              <Link href="/menu" className="group relative overflow-hidden flex-1 rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-purple-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <House className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Menu</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}