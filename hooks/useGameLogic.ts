import { useState, useRef, useEffect, useCallback } from "react";
import { profileService } from "@/lib/services/profileService";
import { scoreService } from "@/lib/services/scoreService";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

export interface GameState {
  guesses: string[];
  currentRow: number;
  message: string;
  targetWord: string;
  hint: string | null; // For Easy Mode
  loading: boolean;
  score: number | null;
  animatedPoints: number | null;
  isPositive: boolean;
  gameOver: boolean;
  usedKeys: Record<string, string>;
  showRestartConfirm: boolean;
  restarting: boolean;
  userProfile: any | null;
}

interface UseGameLogicProps {
  mode?: "normal" | "easy";
}

export function useGameLogic({ mode = "normal" }: UseGameLogicProps = {}) {
  // --- State ---
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

  // --- Refs ---
  const guessesRef = useRef<string[]>(guesses);
  const currentRowRef = useRef<number>(currentRow);
  const targetWordRef = useRef<string>(targetWord);
  const hasFetchedRef = useRef(false);

  // Sync refs
  useEffect(() => { guessesRef.current = guesses; }, [guesses]);
  useEffect(() => { currentRowRef.current = currentRow; }, [currentRow]);
  useEffect(() => { targetWordRef.current = targetWord; }, [targetWord]);

  // --- Initialization ---
  useEffect(() => {
    const initProfile = async () => {
      const profile = await profileService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
      } else {
        // Handle redirect or error if needed? 
        // For now, the hook just won't have a profile, preserving existing behavior
      }
    };
    initProfile();
  }, []);

  const fetchWord = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setHint(null);

    try {
      // Use query param for easy mode
      const url = mode === "easy" ? "/api/word?mode=easy" : "/api/word";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch word");
      
      const data = await res.json();
      
      if (data.word) {
        setTargetWord(data.word);
        if (data.definition) {
          setHint(data.definition);
        }
        setStartTime(Date.now());
      } else {
        throw new Error("Invalid word data");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setMessage("Failed to load a word. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchWord();
  }, [fetchWord]);


  // --- Logic Methods ---

  const handleKeyPress = async (rawKey: string) => {
    if (!userProfile || loading || gameOver) return;

    const key = rawKey.toUpperCase();
    const rowIndex = currentRowRef.current;
    const rowValue = guessesRef.current[rowIndex] || "";

    // ENTER
    if (key === "ENTER") {
      if (rowValue.length !== WORD_LENGTH) {
        setMessage("Not enough letters");
        return;
      }

      const guess = rowValue.toUpperCase();
      const end = Date.now();
      const timeTaken = Math.floor((end - (startTime || end)) / 1000);

      // Update Used Keys Colors
      const newKeys = { ...usedKeys };
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        if (letter === targetWordRef.current[i]) newKeys[letter] = "correct";
        else if (targetWordRef.current.includes(letter))
          newKeys[letter] = newKeys[letter] !== "correct" ? "present" : "correct";
        else newKeys[letter] = "absent";
      }
      setUsedKeys(newKeys);

      // Check Win
      if (guess === targetWordRef.current) {
        const baseScore = 50;
        const timeBonus = Math.max(0, 500 - timeTaken * 5);
        const attemptPenalty = (rowIndex + 1) * 50;
        const finalScore = Math.max(baseScore, baseScore + timeBonus - attemptPenalty);

        setScore(finalScore);
        setEndTime(end);
        setMessage("You got it!");
        setGameOver(true);
        setAnimatedPoints(finalScore);
        setIsPositive(true);
        
        await scoreService.saveScore(userProfile.user_id, finalScore, true);
        return;
      }

      // Check Loss (if last try)
      if (rowIndex + 1 >= MAX_TRIES) {
        setScore(0);
        setEndTime(end);
        setMessage(`Answer: ${targetWordRef.current}`);
        setGameOver(true);
        setAnimatedPoints(0);
        setIsPositive(false);
        
        await scoreService.saveScore(userProfile.user_id, 0, false);
        return;
      }

      // Continue
      setMessage("");
      setCurrentRow((r) => r + 1);
      return;
    }

    // BACKSPACE
    if (key === "BACKSPACE" || key === "DEL") {
      setGuesses((prev) => {
        const updated = [...prev];
        updated[rowIndex] = updated[rowIndex].slice(0, -1);
        return updated;
      });
      return;
    }

    // LETTERS
    if (/^[A-Z]$/.test(key)) {
      if (rowValue.length >= WORD_LENGTH) return;
      setGuesses((prev) => {
        const updated = [...prev];
        updated[rowIndex] += key;
        return updated;
      });
    }
  };

  const confirmRestart = async () => {
    setShowRestartConfirm(false);
    setRestarting(true);

    if (userProfile) {
      const result = await scoreService.deductPoints(userProfile.user_id, 50);
      if (result) {
        setAnimatedPoints(-50);
        setIsPositive(false);
      }
    }

    setMessage(`Game restarted! The word was: ${targetWord}`);

    setTimeout(() => {
      resetGame();
      setRestarting(false);
    }, 3000);
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
    // Restart fetch
    await fetchWord();
  };

  const handleRestartClick = () => setShowRestartConfirm(true);
  const cancelRestart = () => setShowRestartConfirm(false);
  const restartGame = () => resetGame(); // For Game Over screen

  // Keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") return handleKeyPress("ENTER");
      if (e.key === "Backspace") return handleKeyPress("DEL");
      if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, gameOver, userProfile, guesses, currentRow, targetWord]); // Dependencies slightly loose here, but handleKeyPress uses refs so it's safer.

  return {
    // State
    guesses,
    currentRow,
    message,
    targetWord,
    hint,
    loading,
    score,
    animatedPoints,
    isPositive,
    gameOver,
    usedKeys,
    showRestartConfirm,
    restarting,
    userProfile,
    
    // Constants
    WORD_LENGTH,
    MAX_TRIES,
    
    // Actions
    handleKeyPress,
    handleRestartClick,
    confirmRestart,
    cancelRestart,
    restartGame,
    
    // Helpers
    getTileColor: (letter: string, index: number, rowIdx: number) => {
        const upper = letter.toUpperCase();
        if (rowIdx >= currentRow) return "bg-slate-700/50 border-slate-600 text-slate-400"; // Empty/Future rows
        if (!upper) return "bg-slate-700/50 border-slate-600";
        
        if (upper === targetWordRef.current[index])
          return "bg-green-600 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] text-white scale-110 z-10"; // Correct
        
        if (targetWordRef.current.includes(upper))
          return "bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-white scale-105 z-0"; // Present
        
        return "bg-slate-800/80 border-slate-700 text-slate-600 opacity-70"; // Absent
    },
    getKeyColor: (key: string) => {
        const state = usedKeys[key];
        if (state === "correct")
          return "bg-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)] border border-green-500 hover:bg-green-500";
        if (state === "present")
          return "bg-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.4)] border border-yellow-400 hover:bg-yellow-400";
        if (state === "absent")
          return "bg-slate-800 text-slate-600 border border-slate-700 hover:bg-slate-800 cursor-not-allowed opacity-60";
        return "bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white";
    }
  };
}
