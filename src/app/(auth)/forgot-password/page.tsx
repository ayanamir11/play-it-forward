"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          <h1 className="text-2xl font-bold text-white mb-1">Forgot your password?</h1>
          <p className="text-sm" style={{ color: "#8895B3" }}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 border flex flex-col gap-5"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: "rgba(0,82,255,0.15)" }}
              >
                ✉️
              </div>
              <p className="text-sm font-medium text-white">Check your email for a reset link</p>
              <p className="text-xs" style={{ color: "#8895B3" }}>
                If an account with that email exists, you&apos;ll receive a link within a few minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none border transition-colors focus:border-[#0052FF]"
                  style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
                />
              </div>

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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm" style={{ color: "#8895B3" }}>
          Remember your password?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#0052FF" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
