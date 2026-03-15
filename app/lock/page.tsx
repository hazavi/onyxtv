"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LockPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Onyx<span className="text-accent">TV</span>
          </h1>
          <p className="text-white/30 text-sm mt-2">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass rounded-2xl p-6 border border-white/[0.06]">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Password"
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-white text-sm outline-none placeholder:text-white/20 focus:border-accent/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-accent text-xs mt-2 ml-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="mt-4 w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
