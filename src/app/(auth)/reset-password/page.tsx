"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.replace("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSuccess(true);
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
          <h1 className="text-2xl font-bold text-white mb-1">Set a new password</h1>
          <p className="text-sm" style={{ color: "#8895B3" }}>
            Choose a strong password for your account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 border flex flex-col gap-5"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: "rgba(0,82,255,0.15)" }}
              >
                ✓
              </div>
              <p className="text-sm font-medium text-white">Password updated!</p>
              <p className="text-xs" style={{ color: "#8895B3" }}>
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!token && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
                >
                  Invalid or missing reset token.{" "}
                  <Link href="/forgot-password" style={{ color: "#FF3B5C", textDecoration: "underline" }}>
                    Request a new link
                  </Link>
                </div>
              )}

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
                >
                  {error}
                </div>
              )}

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                  New password
                </label>
                <div
                  className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
                  style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                      : <Eye size={16} style={{ color: "#8895B3" }} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                  Confirm password
                </label>
                <div
                  className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
                  style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="px-3 flex items-center"
                    tabIndex={-1}
                  >
                    {showConfirm
                      ? <EyeOff size={16} style={{ color: "#8895B3" }} />
                      : <Eye size={16} style={{ color: "#8895B3" }} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-opacity"
                style={{
                  backgroundColor: "#0052FF",
                  opacity: isLoading || !token ? 0.75 : 1,
                  cursor: isLoading || !token ? "not-allowed" : "pointer",
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm" style={{ color: "#8895B3" }}>
          Back to{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#0052FF" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0A0E1A", minHeight: "100vh" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
