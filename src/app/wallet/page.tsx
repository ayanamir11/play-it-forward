"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Trophy, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = "deposit" | "withdrawal" | "bet-won" | "bet-lost";

interface Transaction {
  id: string;
  type: TxType;
  description: string;
  date: string;
  amount: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  { id: "1", type: "deposit",    description: "Visa ••••4242",    date: "Apr 25", amount:  100.00 },
  { id: "2", type: "bet-lost",   description: "Chiefs -3.5",      date: "Apr 25", amount:  -25.00 },
  { id: "3", type: "bet-won",    description: "Lakers ML",         date: "Apr 24", amount:   47.50 },
  { id: "4", type: "withdrawal", description: "Bank ••••9821",    date: "Apr 23", amount: -200.00 },
  { id: "5", type: "deposit",    description: "PayPal",            date: "Apr 22", amount:  250.00 },
  { id: "6", type: "bet-lost",   description: "Over 47.5",         date: "Apr 22", amount:  -50.00 },
  { id: "7", type: "bet-won",    description: "Eagles +3.5",       date: "Apr 21", amount:   22.75 },
  { id: "8", type: "deposit",    description: "Visa ••••4242",    date: "Apr 20", amount:  100.00 },
];

const QUICK_STATS = [
  { label: "Total Deposited",  value: "$1,240.00" },
  { label: "Total Withdrawn",  value: "$890.00"   },
  { label: "Total Wagered",    value: "$3,450.00" },
];

const TX_ICON: Record<TxType, { icon: React.ElementType; bg: string; color: string }> = {
  deposit:    { icon: ArrowDownLeft, bg: "rgba(0,196,140,0.15)",  color: "#00C48C" },
  withdrawal: { icon: ArrowUpRight,  bg: "rgba(255,59,92,0.15)",   color: "#FF3B5C" },
  "bet-won":  { icon: Trophy,        bg: "rgba(0,196,140,0.15)",  color: "#00C48C" },
  "bet-lost": { icon: X,             bg: "rgba(255,59,92,0.15)",   color: "#FF3B5C" },
};

const TX_LABEL: Record<TxType, string> = {
  deposit:    "Deposit",
  withdrawal: "Withdrawal",
  "bet-won":  "Bet Won",
  "bet-lost": "Bet Lost",
};

const FILTER_TABS = ["All", "Deposits", "Withdrawals", "Bets"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const FILTER_FN: Record<FilterTab, (t: Transaction) => boolean> = {
  All:         () => true,
  Deposits:    (t) => t.type === "deposit",
  Withdrawals: (t) => t.type === "withdrawal",
  Bets:        (t) => t.type === "bet-won" || t.type === "bet-lost",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const visible = TRANSACTIONS.filter(FILTER_FN[activeFilter]);

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

        <h1 className="text-[28px] font-bold text-white leading-tight">Wallet</h1>

        {/* ── 1. Balance card ── */}
        <div
          className="rounded-xl p-6 border flex flex-col gap-5"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm" style={{ color: "#8895B3" }}>Total Balance</p>
            <p
              className="text-5xl font-bold text-white leading-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              $250.00
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-xs mb-0.5" style={{ color: "#8895B3" }}>Available</p>
              <p className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                $225.00
              </p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: "#8895B3" }}>Bonus</p>
              <p className="text-base font-semibold" style={{ color: "#00C48C", fontFamily: "var(--font-mono)" }}>
                $25.00
              </p>
            </div>
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

        {/* ── 2. Quick stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {QUICK_STATS.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4 border flex flex-col items-center gap-1 text-center"
              style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
            >
              <p className="text-xs" style={{ color: "#8895B3" }}>{label}</p>
              <p
                className="text-base font-bold text-white"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── 3. Transaction history ── */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-white">Recent Transactions</h2>

          {/* Filter tabs */}
          <div className="flex border-b" style={{ borderColor: "#2A3350" }}>
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className="px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors"
                  style={{
                    color: active ? "#ffffff" : "#8895B3",
                    borderColor: active ? "#0052FF" : "transparent",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Transaction rows */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#2A3350" }}
          >
            {visible.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "#8895B3" }}>
                No transactions found.
              </p>
            ) : (
              visible.map(({ id, type, description, date, amount }, i) => {
                const { icon: Icon, bg, color } = TX_ICON[type];
                const positive = amount > 0;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-4 px-4 py-3"
                    style={{
                      borderTop: i > 0 ? `1px solid #2A3350` : undefined,
                      backgroundColor: i % 2 === 0 ? "#131929" : "transparent",
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>

                    {/* Type + date */}
                    <div className="flex flex-col gap-0.5 min-w-[110px]">
                      <span className="text-sm font-semibold text-white">
                        {TX_LABEL[type]}
                      </span>
                      <span className="text-xs" style={{ color: "#8895B3" }}>{date}</span>
                    </div>

                    {/* Description */}
                    <span className="flex-1 text-sm" style={{ color: "#8895B3" }}>
                      {description}
                    </span>

                    {/* Amount */}
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{
                        color: positive ? "#00C48C" : "#FF3B5C",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {positive ? "+" : ""}${Math.abs(amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
