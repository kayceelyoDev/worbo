"use client";
import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, User, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getRank } from "@/lib/getRank"; // ✅ Import your rank utility

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

      // Step 1: Get userProfile using auth.user.id
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

      const userProfileId = profile.id; // PK used in scores_table

      // Step 2: Fetch user's score
      const { data: userScoreData } = await supabase
        .from("scores_table")
        .select("score")
        .eq("user_id", userProfileId)
        .single();

      const currentScore = userScoreData?.score || 0;
      setScore(currentScore);

      // Step 3: Compute rank image + name
      const rank = getRank(currentScore);
      setRankName(rank.name);
      setRankImage(rank.image);

      // Step 4: Compute leaderboard rank position
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center p-4">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/menu"
            className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </Link>
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mt-24 max-w-2xl w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-6 backdrop-blur shadow-lg">
        <div className="flex items-center gap-3">
          <User className="w-12 h-12 text-green-400" />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">{username}</h1>
            <p className="text-yellow-400 font-semibold text-lg">#{usertag}</p>
          </div>
        </div>

        {/* Score & Rank Info */}
        <div className="w-full flex justify-around mt-4">
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Score</span>
            <span className="text-2xl font-bold text-green-400">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Leaderboard Rank</span>
            <span className="text-2xl font-bold text-yellow-400">
              {rankPosition || "-"}
            </span>
          </div>
        </div>

        {/* Trophy / Rank Image */}
        <div className="flex flex-col items-center mt-6">
          <span className="text-slate-400 mb-2">Trophy Rank</span>
          <img
            src={rankImage}
            alt={rankName}
            className="w-50 h-50 drop-shadow-lg"
          />
          <span className="text-xl font-bold capitalize text-yellow-400 mt-2">
            {rankName}
          </span>
        </div>

       
      </div>
    </div>
  );
}
