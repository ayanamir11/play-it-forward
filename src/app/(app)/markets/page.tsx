"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import MarketCardRow from "@/components/home/MarketCardRow";
import { MarketCardSkeleton } from "@/components/ui/Skeletons";

// ─── Types ────────────────────────────────────────────────────────────────────

const TABS = ["All", "NFL", "NBA", "MLB", "NHL", "EPL", "MLS", "NCAAB"] as const;
type Tab = (typeof TABS)[number];

const SPORT_KEYS: Record<Tab, string | null> = {
  All:   null,
  NFL:   "americanfootball_nfl",
  NBA:   "basketball_nba",
  MLB:   "baseball_mlb",
  NHL:   "icehockey_nhl",
  EPL:   "soccer_epl",
  MLS:   "soccer_usa_mls",
  NCAAB: "basketball_ncaab",
};

const DEFAULT_SPORT: Tab = "NBA";

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

interface Game {
  eventId: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  gameTime: string;
  spreadHome: string;
  spreadAway: string;
  mlHome: string;
  mlAway: string;
  totalLine: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGameTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  if (day.getTime() === today.getTime()) return `Today ${time} ET`;
  if (day.getTime() === tomorrow.getTime()) return `Tomorrow ${time} ET`;

  const dayStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  return `${dayStr} ${time} ET`;
}

function fmtOdds(price?: number): string {
  if (price === undefined) return "—";
  return price > 0 ? `+${price}` : `${price}`;
}

function fmtPoint(point?: number): string {
  if (point === undefined) return "—";
  return point > 0 ? `+${point}` : `${point}`;
}

function eventToGame(ev: OddsEvent): Game {
  const bm = ev.bookmakers[0];
  const h2h     = bm?.markets.find((m) => m.key === "h2h");
  const spreads  = bm?.markets.find((m) => m.key === "spreads");
  const totals   = bm?.markets.find((m) => m.key === "totals");

  const homeH2h    = h2h?.outcomes.find((o) => o.name === ev.home_team);
  const awayH2h    = h2h?.outcomes.find((o) => o.name === ev.away_team);
  const homeSpread = spreads?.outcomes.find((o) => o.name === ev.home_team);
  const overTotal  = totals?.outcomes.find((o) => o.name === "Over");

  return {
    eventId:    ev.id,
    sportKey:   ev.sport_key,
    homeTeam:   ev.home_team,
    awayTeam:   ev.away_team,
    league:     ev.sport_title,
    gameTime:   formatGameTime(ev.commence_time),
    spreadHome: fmtPoint(homeSpread?.point),
    spreadAway: fmtOdds(homeSpread?.price),
    mlHome:     fmtOdds(homeH2h?.price),
    mlAway:     fmtOdds(awayH2h?.price),
    totalLine:  overTotal?.point !== undefined ? `O ${overTotal.point}` : "—",
  };
}

// ─── League header ────────────────────────────────────────────────────────────

function LeagueHeader({ league }: { league: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs font-semibold tracking-widest uppercase flex-shrink-0" style={{ color: "#8895B3" }}>
        {league}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "#2A3350" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_SPORT);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async (sportKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/odds/events?sport=${sportKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load events");
      setGames((data.events as OddsEvent[]).map(eventToGame));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = SPORT_KEYS[DEFAULT_SPORT]!;
    fetchEvents(key);
  }, [fetchEvents]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    const key = SPORT_KEYS[tab];
    if (key) fetchEvents(key);
  }

  const filtered = search.trim()
    ? games.filter(
        (g) =>
          g.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
          g.awayTeam.toLowerCase().includes(search.toLowerCase()) ||
          g.league.toLowerCase().includes(search.toLowerCase())
      )
    : games;

  const grouped = filtered.reduce<Record<string, Game[]>>((acc, g) => {
    (acc[g.league] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-5">

        <h1 className="text-[28px] font-bold text-white leading-tight">Markets</h1>

        {/* Search */}
        <div
          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 border"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <Search size={18} style={{ color: "#8895B3", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search teams, leagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#F7F9FC" }}
          />
        </div>

        {/* Sport tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: active ? "#0052FF" : "#131929",
                  color: active ? "#ffffff" : "#8895B3",
                  borderColor: active ? "#0052FF" : "#2A3350",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {activeTab === "All" ? "All Games" : `${activeTab} Games`}
          </h2>
          {!isLoading && (
            <span className="text-sm" style={{ color: "#8895B3" }}>
              {filtered.length} {filtered.length === 1 ? "game" : "games"}
            </span>
          )}
        </div>

        {/* Game list */}
        <div className="flex flex-col gap-3 pb-6">
          {isLoading ? (
            [0, 1, 2, 3, 4, 5].map((i) => <MarketCardSkeleton key={i} />)
          ) : error ? (
            <div
              className="rounded-xl px-5 py-6 text-center border"
              style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: "#FF3B5C" }}>
                Failed to load events
              </p>
              <p className="text-xs" style={{ color: "#8895B3" }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-xl px-5 py-10 text-center border"
              style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
            >
              <p className="text-sm font-medium text-white mb-1">No events available</p>
              <p className="text-xs" style={{ color: "#8895B3" }}>
                Check back later or try a different sport.
              </p>
            </div>
          ) : Object.entries(grouped).map(([league, leagueGames]) => (
            <div key={league} className="flex flex-col gap-3">
              {Object.keys(grouped).length > 1 && <LeagueHeader league={league} />}
              {leagueGames.map((game) => (
                <MarketCardRow
                  key={game.eventId}
                  {...game}
                />
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
