"use client";
import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, User, ArrowLeft, LogOut, Zap, TrendingUp, Crown, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getRank } from "@/lib/getRank";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("Player");
  const [usertag, setUsertag] = useState("0000");
  const [score, setScore] = useState(0);
  const [rankName, setRankName] = useState("Unranked");
  const [rankImage, setRankImage] = useState("/trophies/unranked.png");
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signup");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("userProfile")
        .select("id, username, usertag")
        .eq("user_id", user.id)
        .single();

      if (!profile || profileError) {
        console.error("Profile not found:", profileError);
        setLoading(false);
        return;
      }

      setUsername(profile.username);
      setUsertag(profile.usertag);

      const userProfileId = profile.id;

      const { data: userScoreData } = await supabase
        .from("scores_table")
        .select("score")
        .eq("user_id", userProfileId)
        .single();

      const currentScore = userScoreData?.score || 0;
      setScore(currentScore);

      const rank = getRank(currentScore);
      setRankName(rank.name);
      setRankImage(rank.image);

      const { data: allScores } = await supabase
        .from("scores_table")
        .select("user_id, score");

      if (allScores) {
        const sortedScores = allScores.sort((a, b) => b.score - a.score);
        const userRank = sortedScores.findIndex(s => s.user_id === userProfileId) + 1;
        setRankPosition(userRank);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border border-green-500 border-t-transparent"></div>
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-sans overflow-x-hidden">

      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>


      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>


      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="w-full px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/menu"
              className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition transform hover:scale-110 duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base font-semibold">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
          </div>
        </div>
      </nav>


      <div className="relative z-10 pt-20 px-3 sm:px-4 pb-12">

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-wider">
            <span className="text-white">MY</span>
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">PROFILE</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full mt-4"></div>
        </div>

        <div className="max-w-4xl mx-auto">

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
      
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8 pb-8 border-b border-slate-700/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50 flex-shrink-0">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-1 break-words">{username}</h2>
                <p className="text-yellow-400 font-bold text-base sm:text-lg">#{usertag}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-green-500/30 border border-green-400/50 text-green-300">Active Player</span>
                  <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/50 text-blue-300">{rankName}</span>
                </div>
              </div>
            </div>

 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-green-400/60 transition">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Score</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-green-300">{score}</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">Total Points</p>
              </div>

            
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-yellow-400/60 transition">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Rank</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-yellow-300">
                  #{rankPosition || "-"}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">Leaderboard Position</p>
              </div>

         
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-purple-400/60 transition">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Tier</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-purple-300 capitalize">{rankName}</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">Current Rank</p>
              </div>
            </div>
          </div>

      
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <h3 className="text-2xl sm:text-3xl font-black">Your Trophy</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400/30 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                <img
                  src={rankImage}
                  alt={rankName}
                  className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-xl"
                />
              </div>
              <p className="text-xl sm:text-2xl font-black capitalize text-yellow-300 mb-2">{rankName}</p>
              <p className="text-slate-400 text-sm sm:text-base">Achievement Unlocked</p>
            </div>
          </div>

  
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/leaderboard" className="group relative overflow-hidden flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition blur-sm"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Leaderboard</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="group relative overflow-hidden flex-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition blur-sm"></div>
              <div className="relative bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}