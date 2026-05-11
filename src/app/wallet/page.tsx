"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Receipt, Trophy, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";

interface ApiBet {
  id: string;
  sport: string;
  event: string;
  pick: string;
  odds: number;
  wagerAmount: number;
  potentialPayout: number;
  status: BetStatus;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function formatOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

// ─── Recent Activity Row ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BetStatus, { icon: React.ElementType; bg: string; color: string; sign: string }> = {
  PENDING: { icon: Receipt, bg: "rgba(136,149,179,0.15)", color: "#8895B3", sign:  ""  },
  WON:     { icon: Trophy,  bg: "rgba(0,196,140,0.15)",  color: "#00C48C", sign:  "+" },
  LOST:    { icon: X,       bg: "rgba(255,59,92,0.15)",   color: "#FF3B5C", sign:  "-" },
  VOID:    { icon: Receipt, bg: "rgba(136,149,179,0.15)", color: "#8895B3", sign:  ""  },
};

const STATUS_LABEL: Record<BetStatus, string> = {
  PENDING: "Pending",
  WON:     "Bet Won",
  LOST:    "Bet Lost",
  VOID:    "Voided",
};

function BetRow({ bet, index }: { bet: ApiBet; index: number }) {
  const cfg = STATUS_CONFIG[bet.status];
  const Icon = cfg.icon;
  const wager = Number(bet.wagerAmount);
  const payout = Number(bet.potentialPayout);

  const displayAmount =
    bet.status === "WON"     ? payout :
    bet.status === "LOST"    ? wager  :
    bet.status === "PENDING" ? wager  :
    wager;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{
        borderTop: index > 0 ? "1px solid #2A3350" : undefined,
        backgroundColor: index % 2 === 0 ? "#131929" : "transparent",
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: cfg.bg }}
      >
        <Icon size={16} style={{ color: cfg.color }} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-[100px]">
        <span className="text-sm font-semibold text-white">{STATUS_LABEL[bet.status]}</span>
        <span className="text-xs" style={{ color: "#8895B3" }}>{formatDate(bet.createdAt)}</span>
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-xs truncate" style={{ color: "#8895B3" }}>{bet.event}</span>
        <span className="text-xs truncate" style={{ color: "#8895B3" }}>
          {bet.pick} · {formatOdds(bet.odds)}
        </span>
      </div>

      <span
        className="text-sm font-bold flex-shrink-0"
        style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}
      >
        {cfg.sign}${displayAmount.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  const [depositSuccess, setDepositSuccess] = useState(false);
  const [bets, setBets] = useState<ApiBet[]>([]);
  const [betsLoading, setBetsLoading] = useState(true);

  // Handle Stripe ?deposit=success redirect with retry polling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      setDepositSuccess(true);
      window.history.replaceState({}, "", "/wallet");

      const balanceBefore = useAuthStore.getState().user?.balance;
      let attempts = 0;
      function poll() {
        fetchUser().then(() => {
          const updated = useAuthStore.getState().user?.balance;
          if (updated !== balanceBefore || ++attempts >= 3) return;
          setTimeout(poll, 2000 * attempts);
        });
      }
      poll();
    }
  }, [fetchUser]);

  // Load recent bets for activity list
  useEffect(() => {
    api.get("/api/bets")
      .then((res) => res.json())
      .then((data) => {
        if (data.bets) setBets(data.bets as ApiBet[]);
      })
      .catch(() => {})
      .finally(() => setBetsLoading(false));
  }, []);

  const balance = user ? parseFloat(user.balance) : 0;

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

        <button
          onClick={() => router.push("/account")}
          className="flex items-center gap-1.5 w-fit text-sm font-medium transition-colors hover:text-white"
          style={{ color: "#8895B3" }}
        >
          <ArrowLeft size={16} />
          Back to Account
        </button>

        <h1 className="text-[28px] font-bold text-white leading-tight">Wallet</h1>

        {depositSuccess && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "rgba(0,196,140,0.12)", color: "#00C48C" }}
          >
            ✓ Deposit successful! Your balance has been updated.
          </div>
        )}

        {/* ── Balance card ── */}
        <div
          className="rounded-xl p-6 border flex flex-col gap-5"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm" style={{ color: "#8895B3" }}>Available Balance</p>
            <p
              className="text-5xl font-bold text-white leading-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${balance.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/wallet/deposit"
              className="flex-1 text-center rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0052FF" }}
            >
              Deposit
            </Link>
            <Link
              href="/wallet/withdraw"
              className="flex-1 text-center rounded-lg py-3 text-sm font-semibold text-white border transition-colors hover:bg-[#1C2438]"
              style={{ borderColor: "#2A3350" }}
            >
              Withdraw
            </Link>
          </div>
        </div>

        {/* ── Recent Bet Activity ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Bet Activity</h2>
            <Link href="/my-bets" className="text-xs font-medium" style={{ color: "#0052FF" }}>
              View All →
            </Link>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#2A3350" }}>
            {betsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin" style={{ color: "#0052FF" }} />
              </div>
            ) : bets.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: "#8895B3" }}>No bets placed yet.</p>
                <Link
                  href="/markets"
                  className="inline-block mt-3 text-xs font-semibold"
                  style={{ color: "#0052FF" }}
                >
                  Browse Markets →
                </Link>
              </div>
            ) : (
              bets.slice(0, 10).map((bet, i) => (
                <BetRow key={bet.id} bet={bet} index={i} />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
