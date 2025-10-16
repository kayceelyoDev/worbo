"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message)
            setLoading(false);
        }
        else {
            router.push("/menu");

            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">

            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px'
                }}></div>
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
                    <p className="text-slate-400 text-sm font-medium">Welcome back. Let's play!</p>
                </div>


                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    {!success ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white text-center mb-8">Sign In</h2>


                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition blur"></div>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                                    />
                                </div>
                            </div>


                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition blur"></div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                                    />
                                </div>
                            </div>


                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                                    <span className="text-red-400 text-sm font-medium">{error}</span>
                                </div>
                            )}


                            <button
                                disabled={loading}
                                onClick={handleLogin}
                                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 px-4 rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>


                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-400 text-center">
                                    Continue your streak. <span className="text-green-400 font-semibold">6 tries</span> per word.
                                </p>
                            </div>


                            <div className="text-center">
                                <p className="text-slate-400 text-sm">
                                    Don't have an account?{' '}
                                    <Link href="/auth/signup" className="text-green-400 hover:text-green-300 font-semibold transition">
                                        Create one here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-6xl animate-bounce">🎮</div>
                            <h3 className="text-2xl font-bold text-green-400">Welcome back!</h3>
                            <p className="text-slate-400">You're signed in. Let's guess some words.</p>
                            <p className="text-sm text-slate-500">Ready to play?</p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
