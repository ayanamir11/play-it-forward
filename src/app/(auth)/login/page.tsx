"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <div className="w-full max-w-[420px] flex flex-col gap-8">

        {/* Brand */}
        <div className="text-center">
          <p className="text-[28px] font-bold mb-6" style={{ color: "#0052FF" }}>
            ⚡ Play It Forward
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: "#8895B3" }}>
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6 border flex flex-col gap-5"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Error banner */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
              >
                {error}
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                Username
              </label>
              <input
                type="text"
                placeholder="yourhandle"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none border transition-colors focus:border-[#0052FF]"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                Password
              </label>
              <div
                className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="px-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff size={16} style={{ color: "#8895B3" }} />
                    : <Eye size={16} style={{ color: "#8895B3" }} />
                  }
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" className="text-xs font-medium" style={{ color: "#0052FF" }}>
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-opacity"
              style={{
                backgroundColor: "#0052FF",
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "#2A3350" }} />
            <span className="text-xs" style={{ color: "#8895B3" }}>
              or continue with
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#2A3350" }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-sm font-semibold text-white border transition-colors hover:bg-[#1C2438]"
            style={{ borderColor: "#2A3350" }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
              style={{
                background: "conic-gradient(#4285F4 0deg 90deg, #EA4335 90deg 180deg, #FBBC05 180deg 270deg, #34A853 270deg 360deg)",
                color: "transparent",
              }}
            >
              <span
                className="w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ backgroundColor: "#131929", color: "#F7F9FC" }}
              >
                G
              </span>
            </span>
            Continue with Google
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm" style={{ color: "#8895B3" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "#0052FF" }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
