"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { TOKEN_KEY } from "@/lib/api";

interface AdminBet {
  id: string;
  event: string;
  pick: string;
  betType: string;
  odds: number;
  wagerAmount: string;
  potentialPayout: string;
  createdAt: string;
  user: { username: string; email: string };
}

type Result = "WON" | "LOST" | "VOID";

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg"
      style={{ backgroundColor: "#0052FF", color: "#fff" }}
    >
      {message}
    </div>
  );
}

function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AdminPage() {
  const [bets, setBets] = useState<AdminBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [settling, setSettling] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const fetchBets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403 || res.status === 401) {
        setAccessDenied(true);
        return;
      }
      const data = await res.json();
      setBets(data.bets ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  async function settle(betId: string, result: Result) {
    if (settling) return;
    setSettling(betId + result);
    try {
      const res = await fetch(`/api/admin/bets/${betId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      });
      if (res.ok) {
        setBets((prev) => prev.filter((b) => b.id !== betId));
        setToast("Bet settled");
      }
    } finally {
      setSettling(null);
    }
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0A0E1A" }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: "#0052FF" }} />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0A0E1A" }}
      >
        <p className="text-sm font-medium" style={{ color: "#FF3B5C" }}>
          Access denied. Admins only.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: "#0A0E1A" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-sm mt-1" style={{ color: "#8895B3" }}>
          Bet Settlement Dashboard
        </p>
      </div>

      {bets.length === 0 ? (
        <div
          className="rounded-xl border p-12 flex flex-col items-center gap-2"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <p className="text-sm font-medium text-white">No pending bets</p>
          <p className="text-xs" style={{ color: "#8895B3" }}>
            All bets have been settled.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-x-auto"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3350" }}>
                {["User", "Event", "Pick", "Odds", "Wager", "Potential Payout", "Date", "Settle"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#8895B3" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, i) => {
                const isSettlingRow = settling?.startsWith(bet.id);
                return (
                  <tr
                    key={bet.id}
                    style={{
                      borderBottom: i < bets.length - 1 ? "1px solid #1C2438" : undefined,
                      opacity: isSettlingRow ? 0.5 : 1,
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{bet.user.username}</div>
                      <div className="text-xs" style={{ color: "#8895B3" }}>
                        {bet.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white max-w-[200px]">
                      <span className="truncate block">{bet.event}</span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{bet.pick}</td>
                    <td
                      className="px-4 py-3 font-bold"
                      style={{ color: "#4D88FF", fontFamily: "var(--font-mono)" }}
                    >
                      {fmtOdds(bet.odds)}
                    </td>
                    <td className="px-4 py-3 text-white" style={{ fontFamily: "var(--font-mono)" }}>
                      ${Number(bet.wagerAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white" style={{ fontFamily: "var(--font-mono)" }}>
                      ${Number(bet.potentialPayout).toFixed(2)}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#8895B3" }}>
                      {fmtDate(bet.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(["WON", "LOST", "VOID"] as Result[]).map((r) => {
                          const colors: Record<Result, string> = {
                            WON: "#16A34A",
                            LOST: "#DC2626",
                            VOID: "#6B7280",
                          };
                          return (
                            <button
                              key={r}
                              onClick={() => settle(bet.id, r)}
                              disabled={!!settling}
                              className="px-2.5 py-1 rounded text-xs font-bold text-white transition-opacity"
                              style={{
                                backgroundColor: colors[r],
                                opacity: settling ? 0.6 : 1,
                                cursor: settling ? "not-allowed" : "pointer",
                              }}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
