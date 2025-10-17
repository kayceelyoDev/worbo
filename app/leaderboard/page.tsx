"use client";
import React, { useEffect, useState } from "react";
import { Trophy, User, Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
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
        setFilteredLeaderboard(formatted); // default show all
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchLeaderboard();
  }, []);

  // Filter leaderboard when rank changes
  useEffect(() => {
    if (selectedRank === "All") {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter((entry) => entry.rankName === selectedRank);
      setFilteredLeaderboard(filtered);
    }
  }, [selectedRank, leaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center p-4 relative">
      {/* Top Nav */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={currentUserId ? "/menu" : "/"}
            className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 mt-20 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
          <h1 className="text-2xl md:text-5xl font-black text-white tracking-wider">
            Leaderboard
          </h1>
        </div>

        {/* Rank Dropdown */}
        <div className="relative mt-4 md:mt-0">
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="bg-slate-800 text-white font-semibold border border-slate-600 rounded-xl px-4 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {rankOptions.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="w-full max-w-3xl space-y-4">
        {loading ? (
          <p className="text-slate-400 text-center">Loading leaderboard...</p>
        ) : filteredLeaderboard.length === 0 ? (
          <p className="text-slate-400 text-center">No players in this rank yet!</p>
        ) : (
          filteredLeaderboard.map((entry, idx) => {
            const isCurrentUser = currentUserId === entry.userId;
            return (
              <div
                key={entry.id}
                className={`relative border rounded-xl p-4 flex items-center justify-between backdrop-blur transition shadow-md 
                  ${isCurrentUser
                    ? "bg-green-800/60 border-green-400 scale-105"
                    : "bg-slate-800/50 border-slate-700 hover:scale-105"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-bold text-xl">{idx + 1}.</span>
                  <User
                    className={`w-6 h-6 ${isCurrentUser ? "text-white" : "text-green-400"}`}
                  />
                  <div>
                    <p className="font-semibold text-white">{entry.username}</p>
                    <p className="text-slate-400 text-sm">#{entry.usertag}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold text-yellow-400 capitalize`}
                  >
                    {entry.rankName}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isCurrentUser ? "text-white" : "text-green-400"
                    }`}
                  >
                    {entry.score}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
