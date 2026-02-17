"use client";
import React from "react";
import Link from "next/link";
import {
  House,
  Sparkles,
  RotateCcw,
  Loader2,
  Trophy,
  RefreshCcw,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Flame,
  X,
  AlertCircle,
} from "lucide-react";
import { useGameLogic } from "@/hooks/useGameLogic";

export default function GameUI() {
  const {
    guesses,
    currentRow,
    message,
    targetWord,
    loading,
    score,
    animatedPoints,
    isPositive,
    gameOver,
    showRestartConfirm,
    restarting,
    MAX_TRIES,
    WORD_LENGTH,
    handleKeyPress,
    handleRestartClick,
    confirmRestart,
    cancelRestart,
    restartGame,
    getTileColor,
    getKeyColor,
  } = useGameLogic({ mode: "normal" });

  const keyboardLayout: string[][] = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "DEL"],
  ];

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8" />
          <p className="text-lg font-semibold">Loading word...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-3 sm:p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>
      <div className="fixed -top-40 -left-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 w-full flex items-center justify-between mb-6 sm:mb-8 px-2">
        <Link
          href="/menu"
          className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition transform hover:scale-110"
        >
          <House className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
            Menu
          </span>
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

      {/* Info Bar */}
      {!gameOver && (
        <div className="relative z-10 flex flex-col items-center gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <p className="text-sm sm:text-base">
              Mode: <span className="text-yellow-400 font-bold">Normal</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <p className="text-sm sm:text-base">
              Attempts:{" "}
              <span className="text-orange-400 font-bold">
                {currentRow}/{MAX_TRIES}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Board */}
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
                    className={`${colorClass} w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold rounded-lg border-2 text-lg sm:text-xl transition transform ${
                      letter && rowIdx < currentRow ? "scale-100" : "scale-95"
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
          <div
            className={`text-center mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
              message.includes("Not enough")
                ? "bg-red-500/20 border border-red-400/50 text-red-300"
                : message.includes("Game restarted")
                ? "bg-orange-500/20 border border-orange-400/50 text-orange-300"
                : "bg-slate-700/50 border border-slate-600 text-slate-300"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm sm:text-base">{message}</p>
          </div>
        )}

        {/* Keyboard */}
        <div className="space-y-1.5 sm:space-y-2 mb-6">
          {keyboardLayout.map((row, rIdx) => (
            <div
              key={rIdx}
              className="flex justify-center gap-1 sm:gap-1 flex-nowrap"
            >
              {row.map((k) => {
                if (k === "ENTER" || k === "DEL") return null;
                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    disabled={gameOver || restarting}
                    className={`${getKeyColor(
                      k
                    )} px-2.5 sm:px-6 py-3 sm:py-5 rounded-lg font-semibold text-xs sm:text-lg transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="flex justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            <button
              onClick={() => handleKeyPress("ENTER")}
              disabled={gameOver || restarting}
              className={`${getKeyColor(
                "ENTER"
              )} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              ENTER
            </button>
            <button
              onClick={() => handleKeyPress("DEL")}
              disabled={gameOver || restarting}
              className={`${getKeyColor(
                "DEL"
              )} px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex-1 max-w-[5rem] transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
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

      {/* Restart Modal */}
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
                <p className="text-left">
                  Restarting the game will deduct{" "}
                  <span className="text-red-400 font-bold">50 points</span> from
                  your score.
                </p>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <Target className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-left">
                  The current word will be revealed, and a new game will start
                  in 3 seconds.
                </p>
              </div>
            </div>

            {/* Modal Buttons */}
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
              <div
                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-2xl pointer-events-none ${
                  isPositive
                    ? "text-green-400 animate-bounce"
                    : "text-red-500 animate-pulse"
                }`}
              >
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
                <span className="text-green-400 font-bold">
                  {animatedPoints}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Attempts Used:</span>
                <span className="text-yellow-400 font-bold">{currentRow}</span>
              </div>
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
              <Link
                href="/menu"
                className="group relative overflow-hidden flex-1 rounded-lg"
              >
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
