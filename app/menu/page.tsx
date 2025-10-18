"use client";
import React, { useEffect, useState } from "react";
import { Sparkles, Play, Trophy, User, LogOut, Menu, X, Zap, Brain, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MainMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Player");
  const [usertag, setUsertag] = useState("2024");
  const [gameMode, setGameMode] = useState("challenge"); // "challenge" or "learning"
  const [showModeCard, setShowModeCard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/signup");
      } else {
        const { data: profile, error } = await supabase
          .from("userProfile")
          .select("username, usertag")
          .eq("user_id", user.id)
          .single();
        if (profile && !error) {
          setUsername(profile.username);
          setUsertag(profile.usertag);
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/auth/signin");
    } else {
      console.error("Logout failed:", error.message);
    }
  };

  const handleStartGame = () => {
    if (gameMode === "challenge") {
      router.push("/game");
    } else {
      router.push("/game/easymode");
    }
  };

  const handleModeSelect = (mode: string) => {
    setGameMode(mode);
    setShowModeCard(true);
  };

  const handleCloseCard = () => {
    setShowModeCard(false);
  };

  // Mode card content with new naming
  const modeCards = {
    challenge: {
      icon: Zap,
      title: "Challenge Mode",
      subtitle: "Test Your Pure Vocabulary",
      gradient: "from-red-600 to-orange-500",
      shadow: "shadow-red-500/30",
      badge: "HARDCORE",
      features: [
        "Category hints only",
        "Minimal guidance",
        "Maximum difficulty",
        "For vocabulary veterans",
        "Premium score multipliers"
      ],
      description: "No definitions. No mercy. Only your vocabulary knowledge stands between you and victory. This is for true word masters who want the ultimate challenge."
    },
    learning: {
      icon: Brain,
      title: "Learning Mode",
      subtitle: "Master New Words",
      gradient: "from-cyan-600 to-blue-500",
      shadow: "shadow-cyan-500/30",
      badge: "EDUCATIONAL",
      features: [
        "Word definitions included",
        "Learn meanings as you play",
        "Friendly difficulty curve",
        "Perfect for all levels",
        "Build vocabulary knowledge"
      ],
      description: "Expand your vocabulary while having fun. Definitions guide you to the answer, making this perfect for learners and casual players alike."
    }
  };

  const currentMode = modeCards[gameMode as keyof typeof modeCards];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated floating gradient graphics */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-green-500/20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}></div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md border-b border-slate-700/50 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-black tracking-wider hidden sm:block">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 bg-slate-900 rounded-lg shadow-lg p-4">
            <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition p-2 rounded-md">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition p-2 rounded-md">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition p-2 w-full rounded-md">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-3xl mt-20 text-center">

        {/* Welcome Section */}
        <div className="flex flex-col items-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl sm:text-6xl font-black tracking-wider">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Welcome, <span className="text-cyan-400">{username}</span>
          </h2>
          <p className="text-slate-400 text-sm">{usertag}</p>
          <p className="text-slate-300 text-lg font-medium">Guess the word in 6 tries</p>
        </div>

        {/* Game Mode Selector - Enhanced */}
        <div className="mb-8">
          <h3 className="text-white font-bold mb-6 text-lg text-center">Choose Your Challenge</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
            
            {/* Challenge Mode Card */}
            <button
              onClick={() => handleModeSelect("challenge")}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group ${
                gameMode === "challenge" 
                  ? "transform scale-105" 
                  : "hover:scale-102"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 opacity-${gameMode === "challenge" ? "100" : "60"} group-hover:opacity-80 transition-opacity duration-300`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${gameMode === "challenge" ? "scale-110" : ""} transition-transform`}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-black text-white">Challenge Mode</h4>
                <p className="text-white/90 text-sm font-medium">Category hints only</p>
                <div className="inline-block bg-white/30 px-3 py-1 rounded-full mt-2">
                  <span className="text-white text-xs font-bold tracking-wide">HARDCORE</span>
                </div>
              </div>
              {gameMode === "challenge" && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </button>

            {/* Learning Mode Card */}
            <button
              onClick={() => handleModeSelect("learning")}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group ${
                gameMode === "learning" 
                  ? "transform scale-105" 
                  : "hover:scale-102"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-500 opacity-${gameMode === "learning" ? "100" : "60"} group-hover:opacity-80 transition-opacity duration-300`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${gameMode === "learning" ? "scale-110" : ""} transition-transform`}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-black text-white">Learning Mode</h4>
                <p className="text-white/90 text-sm font-medium">With definitions</p>
                <div className="inline-block bg-white/30 px-3 py-1 rounded-full mt-2">
                  <span className="text-white text-xs font-bold tracking-wide">EDUCATIONAL</span>
                </div>
              </div>
              {gameMode === "learning" && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        {/* Mode Pop-up Card - Enhanced */}
        {showModeCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-w-lg w-full mx-auto animate-in slide-in-from-bottom-10 duration-300">
              
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${currentMode.gradient} p-8 rounded-t-2xl relative`}>
                <button 
                  onClick={handleCloseCard}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <currentMode.icon className="w-10 h-10 text-white" />
                  <h3 className="text-3xl font-black text-white">{currentMode.title}</h3>
                </div>
                <p className="text-white/95 font-medium text-center">{currentMode.subtitle}</p>
                <div className="mt-4 flex justify-center">
                  <div className="bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-white text-sm font-black tracking-widest">{currentMode.badge}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                
                {/* Description */}
                <p className="text-slate-300 text-center mb-6 leading-relaxed text-sm">
                  {currentMode.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-white font-bold mb-4 text-lg text-left">What You Get:</h4>
                  <div className="space-y-3">
                    {currentMode.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-r ${currentMode.gradient}`}></div>
                        <span className="text-slate-300 text-left text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleStartGame}
                  className={`w-full bg-gradient-to-r ${currentMode.gradient} hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transform transition duration-200 active:scale-95 shadow-lg ${currentMode.shadow} text-lg`}
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Start Playing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8 px-4 sm:px-0">
          <Link href="/profile" className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-green-500 group-hover:opacity-90 opacity-70 transition duration-300 blur-sm rounded-xl"></div>
            <div className="relative bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-lg shadow-green-500/40">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </div>
          </Link>

          <Link href="/leaderboard" className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-yellow-500 group-hover:opacity-90 opacity-70 transition duration-300 blur-sm rounded-xl"></div>
            <div className="relative bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-lg shadow-yellow-500/40">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="w-full group relative overflow-hidden rounded-xl mb-12">
          <div className="absolute inset-0 bg-slate-600 group-hover:opacity-90 opacity-70 transition duration-300 blur-sm rounded-xl"></div>
          <div className="relative bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-lg shadow-slate-600/40">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </button>

        {/* Color Legend */}
        <div className="flex gap-2 mt-12 justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg shadow-lg shadow-green-500/50 transform hover:scale-110 transition cursor-pointer" title="Correct"></div>
          <div className="w-12 h-12 bg-yellow-500 rounded-lg shadow-lg shadow-yellow-500/50 transform hover:scale-110 transition cursor-pointer" title="Wrong position"></div>
          <div className="w-12 h-12 bg-slate-600 rounded-lg shadow-lg shadow-slate-600/50 transform hover:scale-110 transition cursor-pointer" title="Not in word"></div>
        </div>
      </div>
    </div>
  );
}