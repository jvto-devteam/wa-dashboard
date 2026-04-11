"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#25d366] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#25d366]/30">
          <MessageSquare className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">WA Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@admin.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#25d366]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <p className="text-white/20 text-xs text-center mt-6">
        WhatsApp Multi-User Dashboard · Powered by Baileys
      </p>
    </div>
  );
}
