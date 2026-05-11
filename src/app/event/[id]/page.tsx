"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { BetSelection, useBetSlipStore } from "@/store/betSlipStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type BetType = BetSelection["betType"];
type Category = "spread" | "moneyline" | "total";

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

interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    markets: Array<{ key: string; outcomes: OddsOutcome[] }>;
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS = ["All", "Spreads", "Moneylines", "Totals"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, (m: Market) => boolean> = {
  All:        () => true,
  Spreads:    (m) => m.category === "spread",
  Moneylines: (m) => m.category === "moneyline",
  Totals:     (m) => m.category === "total",
};

const CATEGORY_LABELS: Record<Category, string> = {
  spread:    "Spreads",
  moneyline: "Moneylines",
  total:     "Totals",
};

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function formatPoint(point?: number): string {
  if (point === undefined) return "";
  return point > 0 ? `+${point}` : `${point}`;
}

function formatGameTime(iso: string): string {
  const date = new Date(iso);
  const dayStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
  return `${dayStr} · ${time} ET`;
}

function buildMarkets(ev: OddsEvent): Market[] {
  const bm = ev.bookmakers[0];
  if (!bm) return [];

  const markets: Market[] = [];

  const h2h    = bm.markets.find((m) => m.key === "h2h");
  const spread = bm.markets.find((m) => m.key === "spreads");
  const totals = bm.markets.find((m) => m.key === "totals");

  if (h2h) {
    const home = h2h.outcomes.find((o) => o.name === ev.home_team);
    const away = h2h.outcomes.find((o) => o.name === ev.away_team);
    if (home && away) {
      markets.push({
        id: "ml-game",
        heading: "Moneyline",
        betType: "moneyline",
        category: "moneyline",
        sides: [
          { label: ev.home_team, line: "", odds: home.price },
          { label: ev.away_team, line: "", odds: away.price },
        ],
      });
    }
  }

  if (spread) {
    const home = spread.outcomes.find((o) => o.name === ev.home_team);
    const away = spread.outcomes.find((o) => o.name === ev.away_team);
    if (home && away) {
      markets.push({
        id: "spread-game",
        heading: "Point Spread",
        betType: "spread",
        category: "spread",
        sides: [
          { label: ev.home_team, line: formatPoint(home.point), odds: home.price },
          { label: ev.away_team, line: formatPoint(away.point), odds: away.price },
        ],
      });
    }
  }

  if (totals) {
    const over  = totals.outcomes.find((o) => o.name === "Over");
    const under = totals.outcomes.find((o) => o.name === "Under");
    if (over && under) {
      markets.push({
        id: "total-game",
        heading: "Game Total",
        betType: "total",
        category: "total",
        sides: [
          { label: "Over",  line: over.point  !== undefined ? String(over.point)  : "", odds: over.price  },
          { label: "Under", line: under.point !== undefined ? String(under.point) : "", odds: under.price },
        ],
      });
    }
  }

  return markets;
}

// ─── Side button ──────────────────────────────────────────────────────────────

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
      <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
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

// ─── Market card ──────────────────────────────────────────────────────────────

function MarketCard({
  market,
  homeTeam,
  awayTeam,
  league,
  gameTime,
}: {
  market: Market;
  homeTeam: string;
  awayTeam: string;
  league: string;
  gameTime: string;
}) {
  const { addSelection, removeSelection, selections } = useBetSlipStore();
  const cardKey = `${homeTeam}${awayTeam}`;

  function toggle(side: MarketSide, sideIndex: number) {
    const id = `${cardKey}-${market.betType}-${market.id}-${sideIndex}`;
    if (selections.some((s) => s.id === id)) {
      removeSelection(id);
      return;
    }
    const label = side.line ? `${side.label} ${side.line}` : side.label;
    addSelection({ id, homeTeam, awayTeam, league, gameTime, betType: market.betType, label, odds: side.odds });
  }

  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}>
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

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = useState<OddsEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");

  useEffect(() => {
    if (!id) return;
    const sport = new URLSearchParams(window.location.search).get("sport") ?? undefined;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const url = sport
          ? `/api/odds/events/${id}?sport=${sport}`
          : `/api/odds/events/${id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load event");
        setEvent(data.event as OddsEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  const markets = event ? buildMarkets(event) : [];
  const visibleMarkets = markets.filter(TAB_FILTER[activeTab]);
  const grouped = visibleMarkets.reduce<Record<string, Market[]>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  const gameTime = event ? formatGameTime(event.commence_time) : "";

  return (
    <AppShell>
      <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: "#0052FF" }} />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div
              className="rounded-xl p-6 border text-center flex flex-col items-center gap-4"
              style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
            >
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#1C2438] self-start">
                <ArrowLeft size={18} style={{ color: "#8895B3" }} />
              </button>
              <p className="text-sm font-medium" style={{ color: "#FF3B5C" }}>{error}</p>
              <p className="text-xs" style={{ color: "#8895B3" }}>
                Navigate back to the markets page and click the event again.
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && event && (
            <>
              {/* Event header */}
              <div
                className="rounded-xl p-6 border flex flex-col gap-5"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-[#1C2438] transition-colors"
                  >
                    <ArrowLeft size={18} style={{ color: "#8895B3" }} />
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8895B3" }}>
                      {event.sport_title}
                    </span>
                    <span className="text-xs" style={{ color: "#8895B3" }}>{gameTime}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-xl font-bold text-white leading-tight">{event.home_team}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8895B3" }}>Home</p>
                  </div>
                  <div className="flex-shrink-0 sm:text-center">
                    <p className="text-lg font-bold" style={{ color: "#2A3350" }}>VS</p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xl font-bold text-white leading-tight">{event.away_team}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8895B3" }}>Away</p>
                  </div>
                </div>
              </div>

              {/* Market tabs */}
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

              {/* Markets */}
              <div className="flex flex-col gap-3">
                {visibleMarkets.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "#8895B3" }}>
                    No markets available for this filter.
                  </p>
                ) : activeTab === "All" ? (
                  Object.entries(grouped).map(([category, categoryMarkets]) => (
                    <div key={category} className="flex flex-col gap-3">
                      <SectionHeader label={CATEGORY_LABELS[category as Category]} />
                      {categoryMarkets.map((m) => (
                        <MarketCard
                          key={m.id}
                          market={m}
                          homeTeam={event.home_team}
                          awayTeam={event.away_team}
                          league={event.sport_title}
                          gameTime={gameTime}
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  visibleMarkets.map((m) => (
                    <MarketCard
                      key={m.id}
                      market={m}
                      homeTeam={event.home_team}
                      awayTeam={event.away_team}
                      league={event.sport_title}
                      gameTime={gameTime}
                    />
                  ))
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
