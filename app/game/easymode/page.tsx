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
  X,
  AlertCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { getRank } from "@/lib/getRank";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

export default function GameUIEasy() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_TRIES).fill(""));
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [targetWord, setTargetWord] = useState<string>("");
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [animatedPoints, setAnimatedPoints] = useState<number | null>(null);
  const [isPositive, setIsPositive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [usedKeys, setUsedKeys] = useState<Record<string, string>>({});
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);
  const [restarting, setRestarting] = useState<boolean>(false);
  const [showDefinitionError, setShowDefinitionError] = useState<boolean>(false);
  const [definitionErrorCount, setDefinitionErrorCount] = useState<number>(0);
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

  // Function to fetch definition via your Next.js API route
  const fetchDefinition = async (word: string): Promise<string> => {
    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error('Word not found in dictionary');
      }

      const data = await response.json();
      
      if (data && data.definition) {
        let definition = data.definition;
        
        // Clean the definition to ensure it doesn't reveal the word
        definition = definition.replace(new RegExp(word, 'gi'), '_____');
        definition = definition.replace(new RegExp(word.toLowerCase(), 'gi'), '_____');
        definition = definition.replace(new RegExp(word.toUpperCase(), 'gi'), '_____');
        
        // Remove any obvious reveals and clean up the text
        definition = definition.split('.')[0]; // Take only the first sentence
        definition = definition.replace(/[^a-zA-Z0-9\s.,!?-]/g, ''); // Remove special characters
        
        // Ensure the definition is not too revealing
        if (definition.length < 10 || definition.toLowerCase().includes(word.toLowerCase())) {
          throw new Error('Definition too revealing');
        }
        
        return definition;
      }
      
      throw new Error('No definition found');
    } catch (error) {
      console.error('Error fetching definition:', error);
      // Show error modal after multiple failures
      setDefinitionErrorCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) { // Show modal after 2 consecutive failures
          setShowDefinitionError(true);
        }
        return newCount;
      });
      return "A common five-letter word";
    }
  };

  // Helper function for fallback words
  const getRandomFallbackWord = (): string => {
    const fallbackWords = [
      // Common nouns
      "APPLE", "BRAIN", "CHAIR", "DREAM", "EARTH", "FLAME", "GRAPE", "HEART",
      "HOUSE", "LIGHT", "MONEY", "NIGHT", "PHONE", "RIVER", "SMILE", "TABLE",
      "WATER", "BEACH", "CLOUD", "FRUIT", "GHOST", "IMAGE", "LEMON", "PIANO",
      "QUEEN", "ROBOT", "TIGER", "WHALE", "BREAD", "EMAIL", "GLOBE", "HONEY",
      "MAGIC", "PEARL", "SHARK", "WHEAT", 
      
      // Common adjectives
      "ANGRY", "BLISS", "BROWN", "CLEAN", "DIZZY", "EMPTY", "FAST", "GREAT",
      "HAPPY", "IVORY", "JUMPY", "LUCKY", "MERRY", "NASTY", "OLIVE", "PROUD",
      "QUICK", "ROYAL", "SILLY", "TALL", "ULTRA", "VIVID", "WACKY", "YOUNG",
      "ZESTY", "ALIVE", "BRAVE", "CALM", "DEEP", "EPIC", "FINE", "GOLD",
      
      // Common verbs
      "BRING", "CATCH", "DANCE", "ENTER", "FIGHT", "GUARD", "HELP", "JUMP",
      "KNOCK", "LAUGH", "MARCH", "NOTES", "OFFER", "PULL", "QUEST", "REACH",
      "SHARE", "THINK", "UNDER", "VALUE", "WATCH", "YIELD", "ADMIT", "BUILD",
      "CLIMB", "DRIVE", "EAT", "FOCUS", "GROW", "HOLD", "INPUT"
    ];
    
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  };

  // Function to fetch root/common words from various free APIs
  const fetchRootWord = async (): Promise<string | null> => {
    const apis = [
      // Primary: Random Word API (most reliable)
      async () => {
        const response = await fetch(
          `https://random-word-api.vercel.app/api?words=1&length=${WORD_LENGTH}`
        );
        if (response.ok) {
          const data = await response.json();
          return data[0]?.toUpperCase();
        }
        throw new Error('API failed');
      },
      
      // Secondary: Random Word Form API
      async () => {
        const response = await fetch(
          `https://random-word-form.herokuapp.com/random/noun?count=1`
        );
        if (response.ok) {
          const data = await response.json();
          const word = data[0]?.toUpperCase();
          if (word?.length === WORD_LENGTH) return word;
        }
        throw new Error('API failed');
      },
      
      // Tertiary: Datamuse for common words
      async () => {
        const response = await fetch(
          `https://api.datamuse.com/words?sp=${'?'.repeat(WORD_LENGTH)}&max=30`
        );
        if (response.ok) {
          const data = await response.json();
          const validWords = data
            .filter((item: any) => item.word?.length === WORD_LENGTH && /^[A-Za-z]+$/.test(item.word))
            .map((item: any) => item.word.toUpperCase());
          if (validWords.length > 0) {
            return validWords[Math.floor(Math.random() * validWords.length)];
          }
        }
        throw new Error('API failed');
      }
    ];

    // Try each API in sequence
    for (const api of apis) {
      try {
        const result = await api();
        if (result && result.length === WORD_LENGTH && /^[A-Z]+$/.test(result)) {
          return result;
        }
      } catch (error) {
        console.log("API attempt failed, trying next...");
        continue;
      }
    }

    // Final fallback
    return getRandomFallbackWord();
  };

  const fetchWord = async () => {
    setLoading(true);
    setMessage("");
    setDefinitionErrorCount(0); // Reset error count on new fetch
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        // Step 1: Fetch root/common word
        setMessage("Loading word...");
        const fetched = await fetchRootWord();

        if (fetched && fetched.length === WORD_LENGTH && /^[A-Z]+$/.test(fetched)) {
          setTargetWord(fetched);

          // Step 2: Fetch definition for the word using your dictionary API
          setMessage("Getting hint...");
          const definition = await fetchDefinition(fetched);
          setHint(definition);

          setStartTime(Date.now());
          setLoading(false);
          setMessage("");
          console.log(fetched)
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
          if (currentScore < 10000) deduction = 80;
          else if (currentScore < 15000) deduction = 200;
          else if (currentScore < 20000) deduction = 300;
          else if (currentScore < 25000) deduction = 400;
          else if (currentScore < 30000) deduction = 450;
          else if (currentScore < 60000) deduction = 500;
          else if (currentScore < 100000) deduction = 550;
          else deduction = 550;

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

  const deductPointsForRestart = async () => {
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

      if (existing) {
        const deduction = 50;
        const updatedScore = Math.max(0, existing.score - deduction);
        
        const { name: rankName } = getRank(updatedScore);

        const { error: updateError } = await supabase
          .from("scores_table")
          .update({ score: updatedScore, rank: rankName })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating score:", updateError);
          return;
        }

        // Show deduction animation
        setAnimatedPoints(-deduction);
        setIsPositive(false);
      }
    } catch (err) {
      console.error("Unexpected error deducting points:", err);
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

  const handleRestartClick = () => {
    setShowRestartConfirm(true);
  };

  const confirmRestart = async () => {
    setShowRestartConfirm(false);
    setRestarting(true);
    
    // Deduct 50 points
    await deductPointsForRestart();
    
    // Show the current word
    setMessage(`Game restarted! The word was: ${targetWord}`);
    
    // Wait for 3 seconds before starting new game
    setTimeout(() => {
      resetGame();
      setRestarting(false);
    }, 3000);
  };

  const cancelRestart = () => {
    setShowRestartConfirm(false);
  };

  const resetGame = async () => {
    setGuesses(Array(MAX_TRIES).fill(""));
    setCurrentRow(0);
    setMessage("");
    setScore(null);
    setEndTime(null);
    setGameOver(false);
    setUsedKeys({});
    setAnimatedPoints(null);
    setShowDefinitionError(false); // Hide definition error modal on reset
    await fetchWord();
  };

  const restartGame = async () => {
    // For game over state, restart without confirmation
    resetGame();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleCloseDefinitionError = () => {
    setShowDefinitionError(false);
    setDefinitionErrorCount(0); // Reset count when manually closed
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
          <p className="text-lg font-semibold">Loading word and hint...</p>
        </div>
      </div>
    );

  const timeTaken =
    endTime && startTime ? Math.floor((endTime - startTime) / 1000) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-3 sm:p-4 relative overflow-hidden">

      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="fixed -top-40 -left-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full flex items-center justify-between mb-6 sm:mb-8 px-2">
        <Link href="/menu" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition transform hover:scale-110">
          <House className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Menu</span>
        </Link>

        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
            WOR<span className="text-green-500">BO</span> <span className="text-sm text-yellow-400">EASY</span>
          </h1>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
        </div>

        <div className="w-5 h-5 sm:w-6 sm:h-6"></div>
      </div>

      {/* Hint Section - Enhanced for Easy Mode */}
      {!gameOver && (
        <div className="relative z-10 flex flex-col items-center gap-3 mb-4 sm:mb-6 w-full max-w-md">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <p className="text-sm sm:text-base">Attempts: <span className="text-orange-400 font-bold">{currentRow}/{MAX_TRIES}</span></p>
          </div>
          
          {/* Hint Display */}
          {hint && (
            <div className="w-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2 text-slate-200">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold text-yellow-400 mb-1">Hint:</p>
                  <p className="text-sm sm:text-base leading-relaxed">{hint}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
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

        {/* Message Display */}
        {message && (
          <div className={`text-center mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            message.includes("Not enough") 
              ? "bg-red-500/20 border border-red-400/50 text-red-300" 
              : message.includes("Game restarted")
              ? "bg-orange-500/20 border border-orange-400/50 text-orange-300"
              : "bg-slate-700/50 border border-slate-600 text-slate-300"
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm sm:text-base">{message}</p>
          </div>
        )}

        {/* Keyboard */}
        <div className="space-y-1.5 sm:space-y-2 mb-6">
          {keyboardLayout.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1 flex-nowrap">
              {row.map((k) => {
                if (k === "ENTER" || k === "DEL") return null;
                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    disabled={gameOver || restarting}
                    className={`${getKeyColor(k)} px-2.5  sm:px-6 py-3 sm:py-5 rounded-lg font-semibold text-xs sm:text-lg transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Enter and Delete Buttons */}
          <div className="flex justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            <button
              onClick={() => handleKeyPress("ENTER")}
              disabled={gameOver || restarting}
              className={`${getKeyColor("ENTER")} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              ENTER
            </button>
            <button
              onClick={() => handleKeyPress("DEL")}
              disabled={gameOver || restarting}
              className={`${getKeyColor("DEL")} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              DEL
            </button>
          </div>
        </div>

        {/* Restart Button */}
        {!gameOver && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleRestartClick}
              disabled={restarting}
              className="group relative overflow-hidden rounded-xl w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-100 group-hover:opacity-0 transition"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 group-hover:from-orange-500 group-hover:to-red-600 text-white font-bold py-2 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  {restarting ? "Restarting..." : "New Game"}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Definition Error Modal */}
      {showDefinitionError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-slate-700 relative max-w-sm w-full">
            <button
              onClick={handleCloseDefinitionError}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Definition Issue
            </h2>

            <div className="bg-slate-700/50 rounded-xl p-4 mb-6 space-y-3 text-sm sm:text-base">
              <div className="flex items-start gap-3 text-slate-300">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">We're having trouble getting proper definitions for words right now.</p>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <RefreshCw className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">Please refresh the page to get a new word with a proper hint.</p>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">You can still play with the current word, but the hint might be generic.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseDefinitionError}
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-400 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-slate-600 to-slate-500 group-hover:from-slate-500 group-hover:to-slate-400 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <span className="text-xs sm:text-sm">Continue Anyway</span>
                </div>
              </button>
              <button
                onClick={handleRefreshPage}
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-600 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-green-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Refresh Page</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-slate-700 relative max-w-sm w-full">
            <button
              onClick={cancelRestart}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Restart Game?
            </h2>

            <div className="bg-slate-700/50 rounded-xl p-4 mb-6 space-y-3 text-sm sm:text-base">
              <div className="flex items-start gap-3 text-slate-300">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">Restarting the game will deduct <span className="text-red-400 font-bold">50 points</span> from your score.</p>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <Target className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">The current word will be revealed, and a new game will start in 3 seconds.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelRestart}
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-400 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-slate-600 to-slate-500 group-hover:from-slate-500 group-hover:to-slate-400 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <span className="text-xs sm:text-sm">Cancel</span>
                </div>
              </button>
              <button
                onClick={confirmRestart}
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-100 group-hover:opacity-0 transition"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-red-600 to-red-500 group-hover:from-red-500 group-hover:to-orange-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transform group-hover:scale-105 transition active:scale-95 shadow-lg">
                  <span className="text-xs sm:text-sm">Confirm</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

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
            </div>

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