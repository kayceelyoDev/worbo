"use client";

import React, { useState, useEffect } from "react";
import { User, Tag, Sparkles, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CreateProfile() {
  const [username, setUsername] = useState("");
  const [usertag, setUsertag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  // Check if user is logged in, otherwise redirect
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/signup"); // not logged in → redirect
      } else {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, [router]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !usertag) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (usertag.length < 2) {
      setError("User tag must be at least 2 characters");
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    // Insert to Supabase table
    const { error: insertError } = await supabase
      .from("userProfile")
      .insert([{ username, usertag, user_id: userId }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* === Existing UI (unchanged) === */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-black tracking-wider">
              <span className="text-white">WOR</span>
              <span className="text-green-500">BO</span>
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Create your identity. Start playing.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          {!success ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Complete Your Profile
              </h2>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition blur"></div>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/\s+/g, ""))
                    }
                    maxLength={20}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  {username.length}/20 characters
                </p>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition blur"></div>
                <div className="relative flex items-center">
                  <Tag className="absolute left-4 w-5 h-5 text-slate-400 -rotate-45" />
                  <input
                    type="text"
                    placeholder="Enter your tag (e.g., #1234)"
                    value={usertag}
                    onChange={(e) =>
                      setUsertag(e.target.value.replace(/\s+/g, ""))
                    }
                    maxLength={10}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  {usertag.length}/10 characters
                </p>
              </div>

              {(username || usertag) && (
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-2">Profile Preview:</p>
                  <p className="text-white font-semibold">
                    {username || "username"}
                    <span className="text-yellow-400 ml-2">
                      #{usertag || "tag"}
                    </span>
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-red-400 text-sm font-medium">
                    {error}
                  </span>
                </div>
              )}

              <button
                disabled={loading || !username || !usertag}
                onClick={handleCreateProfile}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 px-4 rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border border-white border-t-transparent"></div>
                ) : (
                  <>
                    Create Profile
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  Your username and tag will be your{" "}
                  <span className="text-green-400 font-semibold">
                    player identity
                  </span>{" "}
                  in Worbo.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/50">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-400">
                Profile Created!
              </h3>
              <p className="text-white font-semibold">
                {username}
                <span className="text-yellow-400 ml-2">#{usertag}</span>
              </p>
              <p className="text-slate-400">Welcome to Worbo, player!</p>
              <Link href={"/menu"} className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition transform hover:scale-105 active:scale-95">
                Start Playing
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-8 justify-center">
          <div
            className="w-12 h-12 bg-green-500 rounded-lg shadow-lg shadow-green-500/50 transform hover:scale-110 transition cursor-pointer"
            title="Correct"
          ></div>
          <div
            className="w-12 h-12 bg-yellow-500 rounded-lg shadow-lg shadow-yellow-500/50 transform hover:scale-110 transition cursor-pointer"
            title="Wrong position"
          ></div>
          <div
            className="w-12 h-12 bg-slate-600 rounded-lg shadow-lg shadow-slate-600/50 transform hover:scale-110 transition cursor-pointer"
            title="Not in word"
          ></div>
        </div>
      </div>
    </div>
  );
}
