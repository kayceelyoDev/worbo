"use client";
import React, { useEffect, useState } from "react";
import { Sparkles, Play, Trophy, User, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MainMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Player");
  const [usertag, setUsertag] = useState("2024");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 relative">


      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>


      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md border-b border-slate-700/50 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

    
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-black tracking-wider hidden sm:block">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </h1>
          </div>

 
          <div className="hidden md:flex items-center gap-6">
            <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>


          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>


        {menuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 bg-slate-900 rounded-lg shadow-lg p-4">
            <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition p-2 rounded-md">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition p-2 rounded-md">
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


      <div className="relative w-full max-w-2xl mt-20 text-center">
  
        <div className="flex flex-col items-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl sm:text-6xl font-black tracking-wider">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Welcome, <span className="text-green-400">{username}</span> <br />
            <span className="text-green-500 text-lg">{usertag}</span>
          </h2>
          <p className="text-slate-400 text-lg">Guess the word in 6 tries</p>
        </div>


        <div className="space-y-4 px-4 sm:px-0">
          <Link href="/game" className="group relative w-full block">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-green-600 opacity-100 group-hover:opacity-0 transition duration-300 rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl"></div>
            <div className="relative bg-gradient-to-r from-green-600 to-green-500 group-hover:from-green-500 group-hover:to-blue-600 text-white font-black py-6 px-6 rounded-2xl flex items-center justify-center gap-3 transform group-hover:scale-105 transition duration-200 active:scale-95 shadow-2xl shadow-green-500/50 group-hover:shadow-blue-500/50">
              <Play className="w-7 h-7 fill-current" />
              <span className="text-2xl">START GAME</span>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/profile" className="group relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-blue-600 group-hover:to-blue-500 transition duration-300 opacity-100 group-hover:opacity-100 blur-sm rounded-xl"></div>
              <div className="relative bg-slate-700/80 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 backdrop-blur">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </div>
            </Link>

            <Link href="/leaderboard" className="group relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-purple-600 group-hover:to-purple-500 transition duration-300 opacity-100 group-hover:opacity-100 blur-sm rounded-xl"></div>
              <div className="relative bg-slate-700/80 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 backdrop-blur">
                <Trophy className="w-5 h-5" />
                <span>Leaderboard</span>
              </div>
            </Link>
          </div>

          <button onClick={handleLogout} className="w-full group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-red-600 group-hover:to-red-500 transition duration-300 opacity-100 group-hover:opacity-100 blur-sm rounded-xl"></div>
            <div className="relative bg-slate-700/80 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:scale-105 transition duration-200 active:scale-95 backdrop-blur">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </button>
        </div>

 
        <div className="flex gap-2 mt-12 justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg shadow-lg shadow-green-500/50 transform hover:scale-110 transition cursor-pointer" title="Correct"></div>
          <div className="w-12 h-12 bg-yellow-500 rounded-lg shadow-lg shadow-yellow-500/50 transform hover:scale-110 transition cursor-pointer" title="Wrong position"></div>
          <div className="w-12 h-12 bg-slate-600 rounded-lg shadow-lg shadow-slate-600/50 transform hover:scale-110 transition cursor-pointer" title="Not in word"></div>
        </div>
      </div>
    </div>
  );
}
