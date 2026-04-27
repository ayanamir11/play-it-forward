"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { BetSelection, useBetSlipStore } from "@/store/betSlipStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type BetType = BetSelection["betType"];
type Category = "spread" | "moneyline" | "total" | "prop" | "1h" | "player";

interface MarketSide {
  label: string;
  line: string;
  odds: number;
}

interface Market {
  id: string;
  heading: string;
  betType: BetType;
  category: Category;
  sides: [MarketSide, MarketSide];
}

// ─── Hardcoded event data ────────────────────────────────────────────────────

const HOME_TEAM = "Kansas City Chiefs";
const AWAY_TEAM = "Philadelphia Eagles";
const LEAGUE = "NFL";
const GAME_TIME = "Sun, Apr 27 · 8:20 PM ET";
const IS_LIVE = false;

const MARKETS: Market[] = [
  // Spreads
  {
    id: "spread-game",
    heading: "Point Spread",
    betType: "spread",
    category: "spread",
    sides: [
      { label: HOME_TEAM, line: "-3.5", odds: -110 },
      { label: AWAY_TEAM, line: "+3.5", odds: -110 },
    ],
  },
  {
    id: "spread-1h",
    heading: "1st Half Spread",
    betType: "spread",
    category: "1h",
    sides: [
      { label: HOME_TEAM, line: "-1.5", odds: -115 },
      { label: AWAY_TEAM, line: "+1.5", odds: -105 },
    ],
  },
  // Moneylines
  {
    id: "ml-game",
    heading: "Moneyline",
    betType: "moneyline",
    category: "moneyline",
    sides: [
      { label: HOME_TEAM, line: "", odds: -185 },
      { label: AWAY_TEAM, line: "", odds: +155 },
    ],
  },
  {
    id: "ml-1h",
    heading: "1st Half Moneyline",
    betType: "moneyline",
    category: "1h",
    sides: [
      { label: HOME_TEAM, line: "", odds: -140 },
      { label: AWAY_TEAM, line: "", odds: +115 },
    ],
  },
  // Totals
  {
    id: "total-game",
    heading: "Game Total",
    betType: "total",
    category: "total",
    sides: [
      { label: "Over",  line: "47.5", odds: -110 },
      { label: "Under", line: "47.5", odds: -110 },
    ],
  },
  {
    id: "total-1h",
    heading: "1st Half Total",
    betType: "total",
    category: "1h",
    sides: [
      { label: "Over",  line: "23.5", odds: -110 },
      { label: "Under", line: "23.5", odds: -110 },
    ],
  },
  {
    id: "total-chiefs",
    heading: "Team Total — Chiefs",
    betType: "total",
    category: "total",
    sides: [
      { label: "Over",  line: "26.5", odds: -115 },
      { label: "Under", line: "26.5", odds: -105 },
    ],
  },
  // Props
  {
    id: "prop-mahomes-pass",
    heading: "Mahomes Passing Yards",
    betType: "total",
    category: "player",
    sides: [
      { label: "Over",  line: "284.5", odds: -115 },
      { label: "Under", line: "284.5", odds: -105 },
    ],
  },
  {
    id: "prop-kelce-rec",
    heading: "Kelce Receiving Yards",
    betType: "total",
    category: "player",
    sides: [
      { label: "Over",  line: "67.5", odds: -120 },
      { label: "Under", line: "67.5", odds: +100 },
    ],
  },
  {
    id: "prop-first-td",
    heading: "First TD Scorer",
    betType: "moneyline",
    category: "prop",
    sides: [
      { label: "Travis Kelce",  line: "", odds: +550 },
      { label: "A.J. Brown",    line: "", odds: +600 },
    ],
  },
];

const TABS = ["All", "Spreads", "Moneylines", "Totals", "Props", "1st Half", "Player Props"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, (m: Market) => boolean> = {
  All:            () => true,
  Spreads:        (m) => m.category === "spread",
  Moneylines:     (m) => m.category === "moneyline",
  Totals:         (m) => m.category === "total",
  Props:          (m) => m.category === "prop",
  "1st Half":     (m) => m.category === "1h",
  "Player Props": (m) => m.category === "player",
};

const CATEGORY_LABELS: Record<Category, string> = {
  spread:    "Spreads",
  moneyline: "Moneylines",
  total:     "Totals",
  prop:      "Props",
  "1h":      "1st Half",
  player:    "Player Props",
};

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

// ─── Market side button ───────────────────────────────────────────────────────

function SideButton({
  side,
  selectionId,
  onToggle,
}: {
  side: MarketSide;
  selectionId: string;
  onToggle: () => void;
}) {
  const selected = useBetSlipStore((s) => s.selections.some((sel) => sel.id === selectionId));
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 flex flex-col items-center rounded-lg p-3 border transition-colors"
      style={{
        backgroundColor: selected ? "#0052FF" : hovered ? "#242d45" : "#1C2438",
        borderColor: selected ? "#0052FF" : hovered ? "#0052FF" : "transparent",
      }}
    >
      <span className="text-xs mb-1 text-center" style={{ color: selected ? "rgba(255,255,255,0.75)" : "#8895B3" }}>
        {side.label}
      </span>
      <span
        className="text-xl font-bold text-white"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {formatOdds(side.odds)}
      </span>
      {side.line && (
        <span
          className="text-xs mt-0.5"
          style={{ color: selected ? "rgba(255,255,255,0.75)" : "#8895B3", fontFamily: "var(--font-mono)" }}
        >
          {side.line}
        </span>
      )}
    </button>
  );
}

// ─── Market card ─────────────────────────────────────────────────────────────

function MarketCard({ market }: { market: Market }) {
  const { addSelection, removeSelection, selections } = useBetSlipStore();
  const cardKey = `${HOME_TEAM}${AWAY_TEAM}`;

  function toggle(side: MarketSide, sideIndex: number) {
    const id = `${cardKey}-${market.betType}-${market.id}-${sideIndex}`;
    const alreadySelected = selections.some((s) => s.id === id);
    if (alreadySelected) {
      removeSelection(id);
      return;
    }
    const label = side.line ? `${side.label} ${side.line}` : side.label;
    addSelection({
      id,
      homeTeam: HOME_TEAM,
      awayTeam: AWAY_TEAM,
      league: LEAGUE,
      gameTime: GAME_TIME,
      betType: market.betType,
      label,
      odds: side.odds,
    });
  }

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "#8895B3" }}>
        {market.heading}
      </p>
      <div className="flex gap-3">
        {market.sides.map((side, i) => (
          <SideButton
            key={i}
            side={side}
            selectionId={`${cardKey}-${market.betType}-${market.id}-${i}`}
            onToggle={() => toggle(side, i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: "#8895B3" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "#2A3350" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const visibleMarkets = MARKETS.filter(TAB_FILTER[activeTab]);

  const grouped = visibleMarkets.reduce<Record<string, Market[]>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="min-h-screen px-6 py-6">
        <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

          {/* ── Event header card ── */}
          <div
            className="rounded-xl p-6 border flex flex-col gap-5"
            style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-[#1C2438] transition-colors"
              >
                <ArrowLeft size={18} style={{ color: "#8895B3" }} />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8895B3" }}>
                  {LEAGUE}
                </span>
                <span className="text-xs" style={{ color: "#8895B3" }}>{GAME_TIME}</span>
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-4">
              {/* Home */}
              <div className="flex-1">
                <p className="text-xl font-bold text-white leading-tight">{HOME_TEAM}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8895B3" }}>(12-5)</p>
              </div>

              {/* Center */}
              <div className="flex-shrink-0 text-center">
                {IS_LIVE ? (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-mono)" }}>
                      24 – 17
                    </p>
                    <p className="text-xs font-bold" style={{ color: "#00C48C" }}>Q3 · 8:42</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold" style={{ color: "#2A3350" }}>VS</p>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 text-right">
                <p className="text-xl font-bold text-white leading-tight">{AWAY_TEAM}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8895B3" }}>(11-6)</p>
              </div>
            </div>
          </div>

          {/* ── Market tabs ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b" style={{ borderColor: "#2A3350" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap"
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

          {/* ── Markets list ── */}
          <div className="flex flex-col gap-3">
            {activeTab === "All"
              ? Object.entries(grouped).map(([category, markets]) => (
                  <div key={category} className="flex flex-col gap-3">
                    <SectionHeader label={CATEGORY_LABELS[category as Category]} />
                    {markets.map((m) => <MarketCard key={m.id} market={m} />)}
                  </div>
                ))
              : visibleMarkets.map((m) => <MarketCard key={m.id} market={m} />)
            }
          </div>

          {/* ── Game info strip ── */}
          <div className="flex flex-wrap gap-2">
            {[
              "📍 Lincoln Financial Field, Philadelphia",
              "📺 NBC",
              "🌡️ 54°F Partly Cloudy",
            ].map((pill) => (
              <span
                key={pill}
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350", color: "#8895B3" }}
              >
                {pill}
              </span>
            ))}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
