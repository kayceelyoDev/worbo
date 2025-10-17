"use client";
import { useRef, useState } from "react";
import { Sparkles, Play, Trophy, User, CheckSquare, XSquare, AlertCircle, Menu, X, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-sans overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => scrollToSection(homeRef)}>
            <div className="w-10 h-10 relative">
              <Image src="/logo.svg" alt="Worbo Logo" width={40} height={40} />
            </div>
            <span className="font-black text-2xl tracking-wider hidden sm:block">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex gap-8 items-center">
            <button onClick={() => scrollToSection(homeRef)} className="hover:text-green-400 transition font-medium">Home</button>
            <button onClick={() => scrollToSection(aboutRef)} className="hover:text-green-400 transition font-medium">About</button>
            <button onClick={() => scrollToSection(instructionsRef)} className="hover:text-green-400 transition font-medium">How to Play</button>
            <button onClick={() => scrollToSection(leaderboardRef)} className="hover:text-green-400 transition font-medium">Leaderboard</button>
            <Link href="/game" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-2 px-6 rounded-xl transition transform hover:scale-105 flex items-center gap-2">
              <Play className="w-4 h-4" /> Play Now
            </Link>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-900/95 border-t border-slate-700/50">
            <button onClick={() => scrollToSection(homeRef)} className="hover:text-green-400 transition font-medium">Home</button>
            <button onClick={() => scrollToSection(aboutRef)} className="hover:text-green-400 transition font-medium">About</button>
            <button onClick={() => scrollToSection(instructionsRef)} className="hover:text-green-400 transition font-medium">How to Play</button>
            <button onClick={() => scrollToSection(leaderboardRef)} className="hover:text-green-400 transition font-medium">Leaderboard</button>
            <Link href="/game" className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-2 px-6 rounded-xl transition">Play Now</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={homeRef} className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pt-20">
        {/* Floating gradient graphics */}
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-green-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>

        <div className="z-10 relative space-y-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-wider">
              <span className="text-white">WOR</span>
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">BO</span>
            </h1>
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>

          <p className="text-lg sm:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Challenge your mind, guess the word in <span className="text-green-400 font-bold">6 tries</span>, and climb the leaderboard!
          </p>

          <div className="flex gap-4 flex-col sm:flex-row justify-center pt-8">
            <Link href="/game" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition blur-sm"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition transform hover:scale-110 active:scale-95 shadow-xl shadow-green-500/50">
                <Play className="w-6 h-6 fill-current" />
                <span className="text-lg">Play Now</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
            <button onClick={() => scrollToSection(aboutRef)} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition blur-sm"></div>
              <div className="relative bg-slate-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-2xl transition transform hover:scale-110 active:scale-95 shadow-xl">
                Learn More
              </div>
            </button>
          </div>
        </div>


      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              About <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">WORBO</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                WORBO is an exciting word-guessing game that challenges your vocabulary and memory. Test your linguistic skills while competing with players worldwide.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Every day brings a new word to guess. Strategic thinking, pattern recognition, and a bit of luck—that's all you need to master WORBO.
              </p>
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Daily word challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Global leaderboard system</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Track your streak and stats</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Compete with friends</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl p-8 border border-slate-700/50 backdrop-blur">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                      {[...Array(5)].map((_, j) => {
                        const colors = ['bg-green-500', 'bg-yellow-500', 'bg-gray-500'];
                        return (
                          <div
                            key={j}
                            className={`w-10 h-10 rounded-lg ${colors[Math.floor(Math.random() * 3)]} animate-pulse`}
                            style={{ animationDelay: `${(i * 5 + j) * 0.1}s` }}
                          ></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section ref={instructionsRef} className="py-32 px-4 bg-slate-900/50 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">How to Play</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Correct */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="relative bg-slate-800/80 border border-slate-700/50 hover:border-green-500/50 p-8 rounded-2xl shadow-lg backdrop-blur transition transform group-hover:scale-105 duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center">Correct Letter</h3>
                <p className="text-slate-400 text-center leading-relaxed">The letter is correct and in the right position. Keep it and move on!</p>
              </div>
            </div>

            {/* Wrong Position */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-yellow-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="relative bg-slate-800/80 border border-slate-700/50 hover:border-yellow-500/50 p-8 rounded-2xl shadow-lg backdrop-blur transition transform group-hover:scale-105 duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center">Wrong Position</h3>
                <p className="text-slate-400 text-center leading-relaxed">The letter exists in the word but is in the wrong position.</p>
              </div>
            </div>

            {/* Not in Word */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="relative bg-slate-800/80 border border-slate-700/50 hover:border-gray-500/50 p-8 rounded-2xl shadow-lg backdrop-blur transition transform group-hover:scale-105 duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <XSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center">Not in Word</h3>
                <p className="text-slate-400 text-center leading-relaxed">This letter is not in the word at all. Try a different one.</p>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div className="mt-16 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Game Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-slate-300"><span className="text-green-400 font-bold">•</span> You have exactly 6 attempts to guess the word</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">•</span> Each guess must be a valid 5-letter word</p>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300"><span className="text-green-400 font-bold">•</span> You get feedback after each guess</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">•</span> Guess correctly to build your streak!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard CTA */}
      <section ref={leaderboardRef} className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Climb the Rankings</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-600 mx-auto rounded-full mb-8"></div>

          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Compete with your friends and climb the leaderboard! Track your scores, compare performances, and see who's the best word guesser among your crew.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/0 border border-yellow-500/30 rounded-xl p-6 backdrop-blur">
              <p className="text-yellow-400 text-3xl font-black">#1</p>
              <p className="text-slate-400 mt-2">Top Player</p>
            </div>
            <div className="bg-gradient-to-br from-gray-400/20 to-gray-400/0 border border-gray-400/30 rounded-xl p-6 backdrop-blur">
              <p className="text-gray-400 text-3xl font-black">#2</p>
              <p className="text-slate-400 mt-2">Runner-up</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/0 border border-orange-500/30 rounded-xl p-6 backdrop-blur">
              <p className="text-orange-400 text-3xl font-black">#3</p>
              <p className="text-slate-400 mt-2">Third Place</p>
            </div>
          </div>

          <Link href="/leaderboard" className="group relative overflow-hidden inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition blur-sm"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition transform hover:scale-110 active:scale-95 flex items-center gap-3 shadow-xl shadow-purple-500/50">
              <Trophy className="w-6 h-6" />
              <span className="text-lg">View Full Leaderboard</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950/80 backdrop-blur-md border-t border-slate-700/50 text-slate-400 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-lg mb-2">Challenge yourself. Compete globally. Master the word game.</p>
          <p className="mt-4">WORBO &copy; {new Date().getFullYear()} • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}