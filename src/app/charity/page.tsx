"use client";

import { BookOpen, HandHeart, Heart, Leaf, Scale, Star } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const MINI_STATS = [
  { label: "Bets Contributed", value: "34" },
  { label: "Current Streak",   value: "3 months" },
  { label: "Charities Supported", value: "4" },
];

const CAUSE_CATEGORIES = [
  { key: "health",      label: "Health",       icon: Heart,     charity: "American Red Cross" },
  { key: "education",   label: "Education",    icon: BookOpen,  charity: "Khan Academy" },
  { key: "environment", label: "Environment",  icon: Leaf,      charity: "The Nature Conservancy" },
  { key: "rights",      label: "Human Rights", icon: Scale,     charity: "Amnesty International" },
  { key: "poverty",     label: "Poverty & Aid",icon: HandHeart, charity: "Feeding America" },
];

const HISTORY = [
  { month: "April 2026",   charity: "American Red Cross",      amount: "$12.40", status: "Pending"   },
  { month: "March 2026",   charity: "American Red Cross",      amount: "$31.20", status: "Disbursed" },
  { month: "February 2026",charity: "American Red Cross",      amount: "$18.75", status: "Disbursed" },
  { month: "January 2026", charity: "Khan Academy",            amount: "$24.60", status: "Disbursed" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-white">{children}</h2>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= Math.floor(score) ? "#00C48C" : "none"}
          stroke="#00C48C"
        />
      ))}
      <span className="text-xs ml-1" style={{ color: "#8895B3" }}>
        {score}/5
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CharityPage() {
  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-8 pb-6">

        {/* Title */}
        <h1 className="text-[28px] font-bold text-white leading-tight">
          Charity Hub
        </h1>

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
            <p className="text-sm mb-1" style={{ color: "#8895B3" }}>
              Your Total Impact
            </p>
            <p className="text-5xl font-bold text-white leading-none">$147.80</p>
            <p className="text-sm mt-1" style={{ color: "#8895B3" }}>
              donated across 6 months
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-3 pt-4 border-t"
            style={{ borderColor: "#2A3350" }}
          >
            {MINI_STATS.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: "#8895B3" }}>{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Active Cause ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>Your Active Cause</SectionHeading>

          <div
            className="rounded-xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
          >
            {/* Category label */}
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8895B3" }}>
              Health &amp; Medical Research
            </span>

            {/* Charity identity */}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                style={{ backgroundColor: "#C8102E" }}
              >
                ✚
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-bold text-white">American Red Cross</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8895B3" }}>
                  Preventing and alleviating human suffering in the face of emergencies
                </p>
                <StarRating score={4.5} />
              </div>
            </div>

            {/* This month stat */}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-2.5"
              style={{ backgroundColor: "rgba(0,196,140,0.08)" }}
            >
              <span className="text-xs font-medium" style={{ color: "#00C48C" }}>
                This Month
              </span>
              <span className="text-sm font-bold" style={{ color: "#00C48C", fontFamily: "var(--font-mono)" }}>
                $12.40 donated
              </span>
            </div>

            {/* Switch button */}
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
            {CAUSE_CATEGORIES.map(({ key, label, icon: Icon, charity }) => {
              const active = key === "health";
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
                      {charity}
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

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#2A3350" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: "#1C2438", color: "#8895B3" }}
            >
              <span>Month</span>
              <span className="col-span-1">Charity</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>

            {/* Rows */}
            {HISTORY.map(({ month, charity, amount, status }, i) => {
              const disbursed = status === "Disbursed";
              return (
                <div
                  key={month}
                  className="grid grid-cols-4 items-center px-4 py-3 text-sm border-t"
                  style={{
                    borderColor: "#2A3350",
                    backgroundColor: i % 2 === 0 ? "#131929" : "transparent",
                  }}
                >
                  <span className="text-white font-medium">{month}</span>
                  <span className="truncate" style={{ color: "#8895B3" }}>{charity}</span>
                  <span
                    className="text-right font-bold"
                    style={{ color: "#F7F9FC", fontFamily: "var(--font-mono)" }}
                  >
                    {amount}
                  </span>
                  <div className="flex justify-end">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: disbursed ? "rgba(0,196,140,0.15)" : "rgba(136,149,179,0.15)",
                        color: disbursed ? "#00C48C" : "#8895B3",
                      }}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
