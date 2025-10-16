"use client";
import { useRef, useState } from "react";
import { Sparkles, Play, Trophy, User, CheckSquare, XSquare, AlertCircle, Menu, X } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Section refs
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: any) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-sans">

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection(homeRef)}>
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="font-black text-2xl tracking-wider">WORBO</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex gap-6">
            <button onClick={() => scrollToSection(homeRef)} className="hover:text-green-400 transition">Home</button>
            <button onClick={() => scrollToSection(aboutRef)} className="hover:text-green-400 transition">About</button>
            <button onClick={() => scrollToSection(instructionsRef)} className="hover:text-green-400 transition">How to Play</button>
            <button onClick={() => scrollToSection(leaderboardRef)} className="hover:text-green-400 transition">Leaderboard</button>
            <Link href="/game" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl transition">Play Now</Link>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-900/90">
            <button onClick={() => scrollToSection(homeRef)} className="hover:text-green-400 transition">Home</button>
            <button onClick={() => scrollToSection(aboutRef)} className="hover:text-green-400 transition">About</button>
            <button onClick={() => scrollToSection(instructionsRef)} className="hover:text-green-400 transition">How to Play</button>
            <button onClick={() => scrollToSection(leaderboardRef)} className="hover:text-green-400 transition">Leaderboard</button>
            <Link href="/game" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl transition">Play Now</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={homeRef} className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Floating gradient graphics */}
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-green-500/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow"></div>

        <div className="flex items-center justify-center gap-4 mb-4 z-10 relative">
          <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
          <h1 className="text-5xl sm:text-7xl font-black tracking-wider">
            <span className="text-white">WOR</span>
            <span className="text-green-500">BO</span>
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
        </div>

        <p className="text-lg sm:text-xl text-slate-300 mb-6 max-w-xl z-10 relative">
          Challenge your mind, guess the word in 6 tries, and climb the leaderboard!
        </p>

        <div className="flex gap-4 z-10 relative flex-col sm:flex-row justify-center">
          <Link href="/game" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition transform hover:scale-105">
            <Play className="w-5 h-5" /> Play Now
          </Link>
          <button onClick={() => scrollToSection(aboutRef)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-2xl transition transform hover:scale-105">
            About
          </button>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 px-4 bg-slate-900/70 backdrop-blur-md">
        <h2 className="text-4xl font-bold mb-6 text-center">About WORBO</h2>
        <p className="text-slate-300 text-lg max-w-3xl mx-auto text-center">
          WORBO is an exciting word-guessing game that challenges your vocabulary and memory. Guess the correct word in 6 tries and compete globally with other players!
        </p>
      </section>

      {/* Instructions */}
      <section ref={instructionsRef} className="py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How to Play</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800/80 p-6 rounded-2xl shadow-lg hover:shadow-green-500/50 transition transform hover:scale-105">
            <CheckSquare className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Correct Letter</h3>
            <p className="text-slate-300">Green indicates the letter is correct and in the correct position.</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-2xl shadow-lg hover:shadow-yellow-500/50 transition transform hover:scale-105">
            <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Wrong Position</h3>
            <p className="text-slate-300">Yellow shows the letter is in the word but in the wrong position.</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-2xl shadow-lg hover:shadow-gray-500/50 transition transform hover:scale-105">
            <XSquare className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Not in Word</h3>
            <p className="text-slate-300">Gray means the letter is not in the word at all.</p>
          </div>
        </div>
      </section>

      {/* Leaderboard CTA */}
      <section ref={leaderboardRef} className="py-20 px-4 bg-slate-900/80 backdrop-blur-md text-center relative overflow-hidden">
        {/* Background graphics */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse-slow pointer-events-none"></div>
<div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl animate-pulse-slow pointer-events-none"></div>

        <h2 className="text-4xl font-bold mb-4">See the Best Players</h2>
        <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
          Check the leaderboard to see who’s topping the charts. Compete and climb to become the ultimate WORBO champion!
        </p>
        <Link href="/leaderboard" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-2xl transition transform hover:scale-105 inline-flex items-center gap-2">
          <Trophy className="w-5 h-5" /> View Leaderboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900/90 text-slate-400 text-center">
        <p>Check the leaderboard and compete globally!</p>
        <p className="mt-2">WORBO &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
