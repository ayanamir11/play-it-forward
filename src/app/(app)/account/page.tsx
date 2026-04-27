"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  LogOut,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const SETTINGS = [
  { icon: Bell,               label: "Notification Preferences", sublabel: null,       danger: false },
  { icon: SlidersHorizontal,  label: "Odds Format",              sublabel: "American", danger: false },
  { icon: Shield,             label: "Security & Password",      sublabel: null,       danger: false },
  { icon: HeartHandshake,     label: "Responsible Gambling",     sublabel: null,       danger: false },
  { icon: HelpCircle,         label: "Help & Support",           sublabel: null,       danger: false },
  { icon: LogOut,             label: "Log Out",                  sublabel: null,       danger: true  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8895B3" }}>{children}</h2>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {children}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

        {/* ── 1. Profile card ── */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-white"
              style={{ backgroundColor: "rgba(0,82,255,0.2)", color: "#0052FF" }}
            >
              AM
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-white">Ayana Mir</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(0,196,140,0.15)", color: "#00C48C" }}
                >
                  Verified ✓
                </span>
              </div>
              <span className="text-sm" style={{ color: "#8895B3" }}>ayana@email.com</span>
              <span className="text-xs" style={{ color: "#8895B3" }}>Member since January 2025</span>
            </div>
          </div>
        </Card>

        {/* ── 2. Wallet card ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>Wallet</SectionHeading>
          <Card className="p-5 flex flex-col gap-4">
            {/* Balances */}
            <div className="flex items-end gap-3">
              <div>
                <p className="text-xs mb-1" style={{ color: "#8895B3" }}>Available Balance</p>
                <p
                  className="text-4xl font-bold text-white leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  $250.00
                </p>
              </div>
              <div className="pb-0.5">
                <p className="text-xs mb-0.5" style={{ color: "#8895B3" }}>Bonus</p>
                <p
                  className="text-base font-semibold"
                  style={{ color: "#8895B3", fontFamily: "var(--font-mono)" }}
                >
                  +$25.00
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/wallet/deposit"
                className="flex-1 text-center rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#0052FF" }}
              >
                Deposit
              </Link>
              <Link
                href="/wallet/withdraw"
                className="flex-1 text-center rounded-lg py-2.5 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
                style={{ borderColor: "#2A3350", color: "#F7F9FC" }}
              >
                Withdraw
              </Link>
            </div>

            {/* Wallet link */}
            <Link
              href="/wallet"
              className="text-center text-xs font-medium"
              style={{ color: "#0052FF" }}
            >
              View All Transactions →
            </Link>
          </Card>
        </div>

        {/* ── 3. Settings list ── */}
        <div className="flex flex-col gap-3">
          <SectionHeading>Settings</SectionHeading>
          <Card>
            {SETTINGS.map(({ icon: Icon, label, sublabel, danger }, i) => (
              <button
                key={label}
                className={`w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#1C2438] ${
                  i < SETTINGS.length - 1 ? "border-b" : ""
                }`}
                style={{ borderColor: "#2A3350" }}
              >
                <Icon
                  size={18}
                  style={{ color: danger ? "#FF3B5C" : "#8895B3", flexShrink: 0 }}
                />
                <span
                  className="flex-1 text-left text-sm font-medium"
                  style={{ color: danger ? "#FF3B5C" : "#F7F9FC" }}
                >
                  {label}
                </span>
                {sublabel && (
                  <span className="text-sm mr-1" style={{ color: "#8895B3" }}>
                    {sublabel}
                  </span>
                )}
                {!danger && (
                  <ChevronRight size={16} style={{ color: "#8895B3", flexShrink: 0 }} />
                )}
              </button>
            ))}
          </Card>
        </div>

        {/* ── 4. App version ── */}
        <p className="text-center text-xs" style={{ color: "#8895B3" }}>
          v1.0.0
        </p>

      </div>
    </div>
  );
}
