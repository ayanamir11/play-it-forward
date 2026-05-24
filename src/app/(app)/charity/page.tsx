"use client";

import { useEffect, useState } from "react";
import { BookOpen, HandHeart, Heart, Leaf, Scale } from "lucide-react";
import { api } from "@/lib/api";
import { CharityPageSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveCharity {
  name: string;
  description: string;
  causeCategory: string;
}

interface BreakdownItem {
  category: string;
  total: number;
}

interface HistoryItem {
  month: string;
  charityName: string;
  charityCategory: string;
  amount: number;
  isDisbursed: boolean;
}

interface Summary {
  totalDonated: number;
  thisMonth: number;
  betsWithCharity: number;
  charitiesSupported: number;
  selectedCause: string | null;
  activeCharity: ActiveCharity | null;
  breakdown: BreakdownItem[];
  history: HistoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CAUSE_CATEGORIES = [
  { key: "HEALTH",       label: "Health",       icon: Heart,     defaultCharity: "American Red Cross"      },
  { key: "EDUCATION",    label: "Education",    icon: BookOpen,  defaultCharity: "Khan Academy"            },
  { key: "ENVIRONMENT",  label: "Environment",  icon: Leaf,      defaultCharity: "The Nature Conservancy"  },
  { key: "HUMAN_RIGHTS", label: "Human Rights", icon: Scale,     defaultCharity: "Amnesty International"   },
  { key: "POVERTY",      label: "Poverty & Aid",icon: HandHeart, defaultCharity: "Feeding America"         },
];

const CAUSE_LABELS: Record<string, string> = {
  HEALTH:       "Health & Medical Research",
  EDUCATION:    "Education",
  ENVIRONMENT:  "Environment & Conservation",
  HUMAN_RIGHTS: "Human Rights",
  POVERTY:      "Poverty & Aid",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-white">{children}</h2>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CharityPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/donations/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalDonated !== undefined) setSummary(data as Summary);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <CharityPageSkeleton />;
  }

  const totalDonated = summary?.totalDonated ?? 0;
  const thisMonth = summary?.thisMonth ?? 0;
  const betsWithCharity = summary?.betsWithCharity ?? 0;
  const charitiesSupported = summary?.charitiesSupported ?? 0;
  const selectedCause = summary?.selectedCause ?? null;
  const activeCharity = summary?.activeCharity ?? null;
  const breakdown = summary?.breakdown ?? [];
  const history = summary?.history ?? [];

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-8 pb-6">

        <h1 className="text-[28px] font-bold text-white leading-tight">Charity Hub</h1>

        {/* ── 1. Impact hero card ── */}
        <div
          className="rounded-xl p-6 border-l-4 border flex flex-col gap-4"
          style={{
            backgroundColor: "#131929",
            borderColor: "#2A3350",
            borderLeftColor: "#00C48C",
          }}
        >
          <div>
            <p className="text-sm mb-1" style={{ color: "#8895B3" }}>Your Total Impact</p>
            <p className="text-5xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-mono)" }}>
              ${totalDonated.toFixed(2)}
            </p>
            <p className="text-sm mt-1" style={{ color: "#8895B3" }}>
              {history.length > 0
                ? `across ${history.length} month${history.length !== 1 ? "s" : ""}`
                : "Place bets to start contributing to your chosen cause"}
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-3 pt-4 border-t"
            style={{ borderColor: "#2A3350" }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs" style={{ color: "#8895B3" }}>Bets Contributing</span>
              <span className="text-sm font-bold text-white">{betsWithCharity}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs" style={{ color: "#8895B3" }}>Charities Supported</span>
              <span className="text-sm font-bold text-white">{charitiesSupported}</span>
            </div>
          </div>
        </div>

        {/* ── 2. Active Cause ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>Your Active Cause</SectionHeading>

          <div
            className="rounded-xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8895B3" }}>
              {selectedCause ? (CAUSE_LABELS[selectedCause] ?? selectedCause) : "No cause selected"}
            </span>

            {activeCharity ? (
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ backgroundColor: "#1C2438" }}
                >
                  ♥
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">{activeCharity.name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#8895B3" }}>
                    {activeCharity.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#8895B3" }}>
                {selectedCause
                  ? "No charity is active for your cause this month."
                  : "Select a cause to get started."}
              </p>
            )}

            <div
              className="flex items-center justify-between rounded-lg px-4 py-2.5"
              style={{ backgroundColor: "rgba(0,196,140,0.08)" }}
            >
              <span className="text-xs font-medium" style={{ color: "#00C48C" }}>This Month</span>
              <span
                className="text-sm font-bold"
                style={{ color: "#00C48C", fontFamily: "var(--font-mono)" }}
              >
                ${thisMonth.toFixed(2)} donated
              </span>
            </div>

            <button
              className="w-full rounded-lg py-2.5 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
              style={{ borderColor: "#2A3350", color: "#8895B3" }}
            >
              Switch Cause
            </button>
          </div>
        </div>

        {/* ── 3. All Cause Categories ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>All Cause Categories</SectionHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAUSE_CATEGORIES.map(({ key, label, icon: Icon, defaultCharity }) => {
              const active = key === selectedCause;
              const categoryTotal = breakdown.find((b) => b.category === key)?.total ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-xl p-4 border flex items-center gap-4 cursor-pointer transition-colors hover:bg-[#1C2438]"
                  style={{
                    backgroundColor: "#131929",
                    borderColor: active ? "#0052FF" : "#2A3350",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: active ? "rgba(0,82,255,0.15)" : "#1C2438" }}
                  >
                    <Icon size={18} style={{ color: active ? "#0052FF" : "#8895B3" }} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <span className="text-xs truncate" style={{ color: "#8895B3" }}>
                      {categoryTotal > 0 ? `$${categoryTotal.toFixed(2)} donated` : defaultCharity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Donation History ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>Donation History</SectionHeading>

          {/* overflow-x-auto keeps the 4-col table from breaking at 375px */}
          <div className="rounded-xl border overflow-hidden overflow-x-auto" style={{ borderColor: "#2A3350" }}>
            {history.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No donations yet"
                description="Place a bet and your losses will automatically contribute to your chosen cause"
                actionLabel="Start Betting"
                actionHref="/markets"
              />
            ) : (
              <div className="min-w-[480px]">
                <div
                  className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: "#1C2438", color: "#8895B3" }}
                >
                  <span>Month</span>
                  <span>Charity</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>

                {history.map(({ month, charityName, amount, isDisbursed }, i) => (
                  <div
                    key={`${month}-${charityName}`}
                    className="grid grid-cols-4 items-center px-4 py-3 text-sm border-t"
                    style={{
                      borderColor: "#2A3350",
                      backgroundColor: i % 2 === 0 ? "#131929" : "transparent",
                    }}
                  >
                    <span className="text-white font-medium">{formatMonth(month)}</span>
                    <span className="truncate" style={{ color: "#8895B3" }}>{charityName}</span>
                    <span
                      className="text-right font-bold"
                      style={{ color: "#F7F9FC", fontFamily: "var(--font-mono)" }}
                    >
                      ${amount.toFixed(2)}
                    </span>
                    <div className="flex justify-end">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isDisbursed
                            ? "rgba(0,196,140,0.15)"
                            : "rgba(136,149,179,0.15)",
                          color: isDisbursed ? "#00C48C" : "#8895B3",
                        }}
                      >
                        {isDisbursed ? "Disbursed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
