"use client";
import React, { useEffect, useState } from "react";
import { Trophy, User, Sparkles, ArrowLeft, ChevronDown, Medal, Flame, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getRank } from "@/lib/getRank";

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  usertag: string;
  userId?: string;
  rankName?: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string>("All");

  const rankOptions = [
    "All",
    "Grande",
    "Abyssal",
    "Diamond",
    "Platinum",
    "Emerald",
    "Gold",
    "Pearl",
    "Coper",
    "Iron",
    "Wood",
    "Unranked",
  ];

  const getRankBadgeColor = (rank: string) => {
    const colors: { [key: string]: string } = {
      "Grande": "from-red-600 to-red-500",
      "Abyssal": "from-purple-600 to-purple-500",
      "Diamond": "from-cyan-600 to-cyan-500",
      "Platinum": "from-slate-400 to-slate-300",
      "Emerald": "from-green-600 to-green-500",
      "Gold": "from-yellow-600 to-yellow-500",
      "Pearl": "from-blue-400 to-blue-300",
      "Coper": "from-orange-600 to-orange-500",
      "Iron": "from-slate-600 to-slate-500",
      "Wood": "from-amber-700 to-amber-600",
      "Unranked": "from-slate-700 to-slate-600",
    };
    return colors[rank] || "from-slate-700 to-slate-600";
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from("scores_table")
          .select("id, score, user_id, userProfile(username, usertag)")
          .order("score", { ascending: false });

        if (error) {
          console.error("Error fetching leaderboard:", error);
          setLoading(false);
          return;
        }

        const formatted = (data || [])
          .filter((row: any) => row.userProfile?.username && row.userProfile?.usertag)
          .map((row: any) => {
            const rankInfo = getRank(row.score);
            return {
              id: row.id,
              score: row.score,
              username: row.userProfile.username,
              usertag: row.userProfile.usertag,
              userId: row.user_id,
              rankName: rankInfo.name,
            };
          });

        setLeaderboard(formatted);
        setFilteredLeaderboard(formatted);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (selectedRank === "All") {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter((entry) => entry.rankName === selectedRank);
      setFilteredLeaderboard(filtered);
    }
  }, [selectedRank, leaderboard]);

  const topThree = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-sans">
     
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

  
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>

    
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={currentUserId ? "/menu" : "/"}
              className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition transform hover:scale-110 duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-sm sm:text-base">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
          </div>
        </div>
      </nav>

  
      <div className="relative z-10 pt-20 pb-6 px-3 sm:px-4">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-wider">
                <span className="text-white">LEADER</span>
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">BOARD</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm pl-12 sm:pl-14">Compete with your friends</p>
          </div>

          <div className="w-60">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Filter by Rank</label>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 font-semibold border border-slate-600 hover:border-green-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition cursor-pointer backdrop-blur text-sm sm:text-base"
            >
              {rankOptions.map((rank) => (
                <option key={rank} value={rank} className="bg-slate-800 text-slate-100">
                  {rank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      <div className="relative z-10 px-3 sm:px-4 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border border-green-500 border-t-transparent"></div>
            <p className="text-slate-400">Loading rankings...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">No players in this rank yet!</p>
          </div>
        ) : (
          <>
           
            {topThree.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                  <span>Top Champions</span>
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
               
                  {topThree[0] && (
                    <div className="lg:order-2">
                      <div className="group bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur border-2 border-yellow-400/50 hover:border-yellow-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden transition transform hover:scale-105 duration-300 shadow-2xl shadow-yellow-500/30">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-bounce flex-shrink-0">
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-yellow-400">1</span>
                          </div>
                          <div className="mb-4 sm:mb-6 min-w-0">
                            <p className="font-black text-base sm:text-lg text-white mb-0.5 truncate">{topThree[0].username}</p>
                            <p className="text-yellow-300/80 text-xs truncate">#{topThree[0].usertag}</p>
                          </div>
                          <div className="space-y-2">
                            <div className={`px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r ${getRankBadgeColor(topThree[0].rankName || "Unranked")} text-white font-bold capitalize text-xs inline-block truncate max-w-full`}>
                              {topThree[0].rankName}
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-yellow-300">{topThree[0].score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                 
                  {topThree[1] && (
                    <div className="lg:order-1">
                      <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50 hover:border-slate-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden transition transform hover:scale-105 duration-300 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-300/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg flex-shrink-0">
                              <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-slate-300">2</span>
                          </div>
                          <div className="mb-4 sm:mb-6 min-w-0">
                            <p className="font-black text-base sm:text-lg text-white mb-0.5 truncate">{topThree[1].username}</p>
                            <p className="text-slate-400 text-xs truncate">#{topThree[1].usertag}</p>
                          </div>
                          <div className="space-y-2">
                            <div className={`px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r ${getRankBadgeColor(topThree[1].rankName || "Unranked")} text-white font-bold capitalize text-xs inline-block truncate max-w-full`}>
                              {topThree[1].rankName}
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-300">{topThree[1].score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                
                  {topThree[2] && (
                    <div className="lg:order-3">
                      <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50 hover:border-orange-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden transition transform hover:scale-105 duration-300 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                              <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-orange-400">3</span>
                          </div>
                          <div className="mb-4 sm:mb-6 min-w-0">
                            <p className="font-black text-base sm:text-lg text-white mb-0.5 truncate">{topThree[2].username}</p>
                            <p className="text-slate-400 text-xs truncate">#{topThree[2].usertag}</p>
                          </div>
                          <div className="space-y-2">
                            <div className={`px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r ${getRankBadgeColor(topThree[2].rankName || "Unranked")} text-white font-bold capitalize text-xs inline-block truncate max-w-full`}>
                              {topThree[2].rankName}
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-orange-400">{topThree[2].score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

        
            {rest.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <span>Rankings</span>
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {rest.map((entry, idx) => {
                    const isCurrentUser = currentUserId === entry.userId;
                    const position = idx + 4;
                    return (
                      <div
                        key={entry.id}
                        className={`group relative rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 backdrop-blur transition transform hover:scale-105 duration-200 border shadow-md overflow-hidden
                          ${isCurrentUser
                            ? "bg-gradient-to-r from-green-600/40 to-green-500/30 border-green-400/60 hover:from-green-600/50 hover:to-green-500/40 scale-105 shadow-lg shadow-green-500/30"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-500 shadow-slate-900/50"}`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                          <div className="w-6 sm:w-8 flex items-center justify-center flex-shrink-0">
                            <span className={`font-black text-sm sm:text-base ${isCurrentUser ? "text-green-300" : "text-yellow-400"}`}>
                              #{position}
                            </span>
                          </div>
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${isCurrentUser ? "from-green-400 to-green-600" : "from-slate-600 to-slate-700"}`}>
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className={`font-bold text-white truncate text-xs sm:text-sm ${isCurrentUser ? "text-sm" : ""}`}>{entry.username}</p>
                            <p className="text-slate-400 text-xs truncate">#{entry.usertag}</p>
                          </div>
                        </div>

                        <div className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold capitalize whitespace-nowrap flex-shrink-0 bg-gradient-to-r ${getRankBadgeColor(entry.rankName || "Unranked")} text-white`}>
                          {entry.rankName}
                        </div>

                        <div className={`text-right flex-shrink-0 ${isCurrentUser ? "text-green-300" : "text-slate-300"}`}>
                          <p className={`font-black text-sm sm:text-base ${isCurrentUser ? "text-white" : "text-green-400"}`}>
                            {entry.score}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}