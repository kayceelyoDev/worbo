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

  const hasFetchedRef = useRef(false); // ✅ guard to prevent double fetch

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
    // ✅ Prevent duplicate fetch in React StrictMode
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
        await saveScore(finalScore, true);
        return;
      }

      if (rowIndex + 1 >= MAX_TRIES) {
        setScore(0);
        setEndTime(end);
        setMessage(`Answer: ${targetWordRef.current}`);
        setGameOver(true);
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
    if (rowIdx >= currentRow) return "bg-slate-700/70";
    if (!upper) return "bg-slate-700/70";
    if (upper === targetWordRef.current[index]) return "bg-green-500";
    if (targetWordRef.current.includes(upper)) return "bg-yellow-500";
    return "bg-slate-600";
  };

  const getKeyColor = (key: string) => {
    const state = usedKeys[key];
    if (state === "correct") return "bg-green-500 text-white";
    if (state === "present") return "bg-yellow-500 text-white";
    if (state === "absent") return "bg-slate-600 text-gray-300";
    return "bg-slate-700/70 text-white";
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin w-8 h-8 mb-2" />
        Loading word...
      </div>
    );

  const timeTaken =
    endTime && startTime ? Math.floor((endTime - startTime) / 1000) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-2 relative">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
        <h1 className="text-3xl font-black text-white tracking-wider">
          WOR<span className="text-green-500">BO</span>
        </h1>
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>

      {category && !gameOver && (
        <div className="text-slate-300 text-center mb-3">
          <p>
            Category: <span className="text-yellow-400">{category}</span>
          </p>
        </div>
      )}

      <div className="w-full max-w-[380px] xs:max-w-[420px] sm:max-w-[440px] px-1">
        <div className="space-y-2 mb-4">
          {guesses.map((word, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5">
              {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                const letter = word[colIdx] || "";
                const colorClass = getTileColor(letter, colIdx, rowIdx);
                return (
                  <div
                    key={colIdx}
                    className={`${colorClass} w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-white rounded-md border border-slate-600 text-xl`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {message && (
          <div className="text-slate-300 text-center mb-3 flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <p>{message}</p>
          </div>
        )}

        {/* Keyboard */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto px-1 sm:px-2 space-y-2">
          {/* Regular letter keys */}
          {keyboardLayout.map((row, rIdx) => (
            <div
              key={rIdx}
              className="flex justify-center flex-wrap gap-1 sm:gap-2 w-full"
            >
              {row
                .filter((k) => k !== "ENTER" && k !== "DEL")
                .map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className={`${getKeyColor(
                      k
                    )} hover:opacity-90 active:scale-95 font-semibold rounded-md shadow-md transition flex-1 min-w-[auto] max-w-[6rem] px-2 py-2 sm:px-2 sm:py-3 text-xs sm:text-sm md:text-base`}
                  >
                    <span className="select-none">{k}</span>
                  </button>
                ))}
            </div>
          ))}

          {/* Bottom row with ENTER and DEL */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => handleKeyPress("ENTER")}
              className={`${getKeyColor(
                "ENTER"
              )} hover:opacity-90 active:scale-95 font-semibold rounded-md shadow-md transition flex-1 max-w-[8rem] px-4 py-3 sm:py-4 text-sm sm:text-base`}
            >
              ENTER
            </button>
            <button
              onClick={() => handleKeyPress("DEL")}
              className={`${getKeyColor(
                "DEL"
              )} hover:opacity-90 active:scale-95 font-semibold rounded-md shadow-md transition flex-1 max-w-[8rem] px-4 py-3 sm:py-4 text-sm sm:text-base`}
            >
              DEL
            </button>
          </div>
        </div>


        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl shadow-lg p-6 text-center w-[90%] max-w-sm border border-slate-700 relative">
              <Trophy className="w-10 h-10 mx-auto text-yellow-400 mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Game Over</h2>
              <div className="text-slate-300 text-sm space-y-1 mb-4">
                <p>Score: {score}</p>
                <p>Attempts: {currentRow}</p>
                {timeTaken !== null && <p>Time: {timeTaken}s</p>}
                <p>
                  Word: <span className="text-green-400">{targetWord}</span>
                </p>
                <p>
                  Category: <span className="text-yellow-400">{category}</span>
                </p>
              </div>

              {/* ANIMATED POINTS */}
              {animatedPoints !== null && (
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out ${isPositive
                      ? "text-green-400 animate-bounce"
                      : "text-red-500 animate-pulse"
                    }`}
                >
                  {isPositive ? (
                    <div className="flex items-center gap-1 font-bold text-xl">
                      <ArrowUpCircle className="w-5 h-5" /> +{animatedPoints}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-bold text-xl">
                      <ArrowDownCircle className="w-5 h-5" /> {animatedPoints}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={restartGame}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold transition"
                >
                  <RefreshCcw className="w-4 h-4" /> Restart
                </button>
                <button
                  onClick={() => (window.location.href = "/leaderboard")}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition"
                >
                  <Clock className="w-4 h-4" /> Leaderboard
                </button>
              </div>
            </div>
          </div>
        )}

        {!gameOver && (
          <div className="flex flex-col items-center gap-2 justify-center mt-4">
            <div className="flex flex-col gap-4 w-full items-center justify-center px-2">
              
              <button
                className="w-full sm:w-72 md:w-96 group relative overflow-hidden rounded-2xl"
                onClick={restartGame}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-100 group-hover:opacity-0 transition duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-red-600 to-red-500 group-hover:from-red-500 group-hover:to-pink-600 text-white font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-3 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-2xl shadow-red-500/50 group-hover:shadow-pink-500/50">
                  <RotateCcw className="w-6 h-6 sm:w-6 sm:h-6" />
                  <span className="text-lg sm:text-xl md:text-2xl">RESET</span>
                </div>
              </button>

              <button className="w-full sm:w-72 md:w-96 group relative overflow-hidden rounded-2xl">
                <Link href={"/menu"}>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-green-600 opacity-100 group-hover:opacity-0 transition duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-green-600 to-green-500 group-hover:from-green-500 group-hover:to-blue-600 text-white font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-3 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-2xl shadow-green-500/50 group-hover:shadow-blue-500/50">
                    <House className="w-6 h-5 sm:w-7 sm:h-6" />
                    <span className="text-lg sm:text-xl md:text-2xl">
                      Main Menu
                    </span>
                  </div>
                </Link>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
