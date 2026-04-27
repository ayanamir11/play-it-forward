"use client";

import { useEffect, useState } from "react";
import { BetCardSkeleton } from "@/components/ui/Skeletons";

type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";

interface Bet {
  id: string;
  league: string;
  matchup: string;
  pick: string;
  odds: string;
  wager: number;
  payout?: number;
  donated?: number;
  status: BetStatus;
  charity?: string;
}

const BETS: Record<"open" | "settled" | "void", Bet[]> = {
  open: [
    {
      id: "1",
      league: "NFL",
      matchup: "Chiefs vs Eagles",
      pick: "Chiefs -3.5",
      odds: "-110",
      wager: 22,
      status: "PENDING",
    },
    {
      id: "2",
      league: "NBA",
      matchup: "Lakers vs Celtics",
      pick: "Over 228.5",
      odds: "-110",
      wager: 11,
      status: "PENDING",
    },
  ],
  settled: [
    {
      id: "3",
      league: "NBA",
      matchup: "Warriors vs Heat",
      pick: "Warriors -4.5",
      odds: "-110",
      wager: 55,
      payout: 100,
      status: "WON",
    },
    {
      id: "4",
      league: "MLB",
      matchup: "Yankees vs Red Sox",
      pick: "Yankees ML",
      odds: "-165",
      wager: 33,
      payout: 53,
      status: "WON",
    },
    {
      id: "5",
      league: "NFL",
      matchup: "Cowboys vs Giants",
      pick: "Cowboys -7.5",
      odds: "-110",
      wager: 44,
      donated: 0.44,
      charity: "American Red Cross",
      status: "LOST",
    },
  ],
  void: [
    {
      id: "6",
      league: "EPL",
      matchup: "Man City vs Arsenal",
      pick: "Man City ML",
      odds: "-130",
      wager: 26,
      status: "VOID",
    },
  ],
};

const STATUS_STYLES: Record<BetStatus, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "rgba(136,149,179,0.15)", color: "#8895B3", label: "Pending" },
  WON:     { bg: "rgba(0,196,140,0.15)",   color: "#00C48C", label: "Won"     },
  LOST:    { bg: "rgba(255,59,92,0.15)",    color: "#FF3B5C", label: "Lost"    },
  VOID:    { bg: "rgba(136,149,179,0.15)", color: "#8895B3", label: "Void"    },
};

function BetCard({ bet }: { bet: Bet }) {
  const badge = STATUS_STYLES[bet.status];

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-3"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#8895B3" }}
          >
            {bet.league}
          </span>
          <span className="text-sm font-bold text-white">{bet.matchup}</span>
        </div>
        <span
          className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Middle row */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2.5"
        style={{ backgroundColor: "#1C2438" }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs" style={{ color: "#8895B3" }}>Your pick</span>
          <span className="text-sm font-bold text-white">{bet.pick}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5 items-center">
            <span className="text-xs" style={{ color: "#8895B3" }}>Odds</span>
            <span
              className="text-sm font-bold text-white"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {bet.odds}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-center">
            <span className="text-xs" style={{ color: "#8895B3" }}>Wager</span>
            <span
              className="text-sm font-bold text-white"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${bet.wager.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row — WON */}
      {bet.status === "WON" && bet.payout !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#8895B3" }}>Payout</span>
          <span
            className="text-sm font-bold"
            style={{ color: "#00C48C", fontFamily: "var(--font-mono)" }}
          >
            +${bet.payout.toFixed(2)}
          </span>
        </div>
      )}

      {/* Bottom row — LOST donation */}
      {bet.status === "LOST" && bet.donated !== undefined && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: "rgba(0,196,140,0.08)" }}
        >
          <span style={{ color: "#00C48C" }}>♥</span>
          <span className="text-xs" style={{ color: "#00C48C" }}>
            ${bet.donated.toFixed(2)} donated to {bet.charity}
          </span>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: "open",     label: "Open"     },
  { key: "settled",  label: "Settled"  },
  { key: "void",     label: "Void"     },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("open");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);
  const bets = BETS[activeTab];

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-5">

        {/* Title */}
        <h1 className="text-[28px] font-bold text-white leading-tight">My Bets</h1>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "#2A3350" }}>
          {TABS.map(({ key, label }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors"
                style={{
                  color: active ? "#ffffff" : "#8895B3",
                  borderColor: active ? "#0052FF" : "transparent",
                }}
              >
                {label}
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: active ? "#0052FF" : "#1C2438",
                    color: active ? "#ffffff" : "#8895B3",
                  }}
                >
                  {BETS[key].length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bet cards */}
        <div className="flex flex-col gap-3 pb-6">
          {isLoading
            ? [0, 1, 2].map((i) => <BetCardSkeleton key={i} />)
            : bets.length === 0
              ? (
                <p className="text-center py-12 text-sm" style={{ color: "#8895B3" }}>
                  No bets here yet.
                </p>
              )
              : bets.map((bet) => <BetCard key={bet.id} bet={bet} />)
          }
        </div>

      </div>
    </div>
  );
}
