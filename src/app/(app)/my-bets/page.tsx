"use client";

import { useEffect, useRef, useState } from "react";
import { Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { BetCardSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTransition } from "@/components/ui/PageTransition";

// ─── Types ────────────────────────────────────────────────────────────────────

type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";

interface ApiBet {
  id: string;
  sport: string;
  event: string;
  pick: string;
  betType: string;
  odds: number;
  wagerAmount: number;
  potentialPayout: number;
  charityContribution: number | null;
  status: BetStatus;
  createdAt: string;
}

type TabKey = "open" | "settled" | "void";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

async function fetchTab(tab: TabKey): Promise<ApiBet[]> {
  if (tab === "open") {
    const res = await api.get("/api/bets?status=PENDING");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load bets");
    return data.bets;
  }
  if (tab === "void") {
    const res = await api.get("/api/bets?status=VOID");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load bets");
    return data.bets;
  }
  // "settled" = WON + LOST fetched in parallel
  const [wonRes, lostRes] = await Promise.all([
    api.get("/api/bets?status=WON"),
    api.get("/api/bets?status=LOST"),
  ]);
  const [wonData, lostData] = await Promise.all([wonRes.json(), lostRes.json()]);
  if (!wonRes.ok) throw new Error(wonData.error ?? "Failed to load bets");
  if (!lostRes.ok) throw new Error(lostData.error ?? "Failed to load bets");
  const combined: ApiBet[] = [...wonData.bets, ...lostData.bets];
  return combined.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─── UI ───────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BetStatus, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "rgba(136,149,179,0.15)", color: "#8895B3", label: "Pending" },
  WON:     { bg: "rgba(0,196,140,0.15)",   color: "#00C48C", label: "Won"     },
  LOST:    { bg: "rgba(255,59,92,0.15)",    color: "#FF3B5C", label: "Lost"    },
  VOID:    { bg: "rgba(136,149,179,0.15)",  color: "#8895B3", label: "Void"    },
};

function BetCard({ bet }: { bet: ApiBet }) {
  const badge = STATUS_STYLES[bet.status];
  const wager = Number(bet.wagerAmount);
  const payout = Number(bet.potentialPayout);
  const charity = bet.charityContribution ? Number(bet.charityContribution) : null;

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-3"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Top row: league · date | status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8895B3" }}>
              {bet.sport}
            </span>
            <span className="text-xs" style={{ color: "#2A3350" }}>·</span>
            <span className="text-xs" style={{ color: "#8895B3" }}>{formatDate(bet.createdAt)}</span>
          </div>
          <span className="text-sm font-bold text-white leading-snug">{bet.event}</span>
        </div>
        <span
          className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Middle row: pick | odds + wager */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2.5"
        style={{ backgroundColor: "#1C2438" }}
      >
        <div className="flex flex-col gap-0.5 min-w-0 pr-4">
          <span className="text-xs" style={{ color: "#8895B3" }}>Your pick</span>
          <span className="text-sm font-bold text-white truncate">{bet.pick}</span>
        </div>
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-xs" style={{ color: "#8895B3" }}>Odds</span>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
              {formatOdds(bet.odds)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-xs" style={{ color: "#8895B3" }}>Wager</span>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
              ${wager.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payout row — PENDING shows potential; WON shows actual */}
      {(bet.status === "PENDING" || bet.status === "WON") && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#8895B3" }}>
            {bet.status === "WON" ? "Payout" : "To Win"}
          </span>
          <span
            className="text-sm font-bold"
            style={{
              color: bet.status === "WON" ? "#00C48C" : "#F7F9FC",
              fontFamily: "var(--font-mono)",
            }}
          >
            {bet.status === "WON" ? "+" : ""}${payout.toFixed(2)}
          </span>
        </div>
      )}

      {/* LOST — charity donation */}
      {bet.status === "LOST" && charity !== null && charity > 0 && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: "rgba(0,196,140,0.08)" }}
        >
          <span style={{ color: "#00C48C" }}>♥</span>
          <span className="text-xs" style={{ color: "#00C48C" }}>
            ${charity.toFixed(2)} donated to your cause
          </span>
        </div>
      )}
    </div>
  );
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "open",    label: "Open"    },
  { key: "settled", label: "Settled" },
  { key: "void",    label: "Void"    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("open");
  const [bets, setBets] = useState<ApiBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cache counts so badges stay visible after each tab is visited
  const countCache = useRef<Partial<Record<TabKey, number>>>({});
  const [, forceRender] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTab(activeTab);
        if (cancelled) return;
        setBets(data);
        countCache.current[activeTab] = data.length;
        forceRender((n) => n + 1);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load bets");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[800px] flex flex-col gap-5">

          <h1 className="text-[28px] font-bold text-white leading-tight">My Bets</h1>

          {/* Tabs — overflow-x-auto in case many tabs on narrow screens */}
          <div className="flex border-b overflow-x-auto scrollbar-none" style={{ borderColor: "#2A3350" }}>
            {TABS.map(({ key, label }) => {
              const active = activeTab === key;
              const count = countCache.current[key];
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
                  {count !== undefined && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: active ? "#0052FF" : "#1C2438",
                        color: active ? "#ffffff" : "#8895B3",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 pb-6">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => <BetCardSkeleton key={i} />)
            ) : error ? (
              <div
                className="rounded-xl px-5 py-6 text-center border"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: "#FF3B5C" }}>
                  Failed to load bets
                </p>
                <p className="text-xs" style={{ color: "#8895B3" }}>{error}</p>
              </div>
            ) : bets.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={
                  activeTab === "open"
                    ? "No bets yet"
                    : activeTab === "settled"
                    ? "No settled bets yet"
                    : "No void bets"
                }
                description={
                  activeTab === "open"
                    ? "Head to Markets to place your first bet"
                    : activeTab === "settled"
                    ? "Settled bets will appear here once they're graded"
                    : "Voided bets will appear here if any are cancelled"
                }
                actionLabel={activeTab === "open" ? "Browse Markets" : undefined}
                actionHref={activeTab === "open" ? "/markets" : undefined}
              />
            ) : (
              bets.map((bet, i) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <BetCard bet={bet} />
                </motion.div>
              ))
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
