"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import MarketCardRow from "@/components/home/MarketCardRow";
import { MarketCardSkeleton } from "@/components/ui/Skeletons";

const TABS = ["All", "NFL", "NBA", "MLB", "NHL", "EPL", "MLS", "NCAAB"] as const;
type Tab = (typeof TABS)[number];

interface Game {
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

const ALL_GAMES: Game[] = [
  // NFL
  {
    homeTeam: "Kansas City Chiefs",
    awayTeam: "Philadelphia Eagles",
    league: "NFL",
    gameTime: "Tonight 8:20 PM ET",
    spreadHome: "-3.5",
    spreadAway: "-110",
    mlHome: "-185",
    mlAway: "+155",
    totalLine: "O 47.5",
  },
  {
    homeTeam: "Dallas Cowboys",
    awayTeam: "New York Giants",
    league: "NFL",
    gameTime: "Sun 1:00 PM ET",
    spreadHome: "-7.5",
    spreadAway: "-110",
    mlHome: "-310",
    mlAway: "+250",
    totalLine: "O 43.0",
  },
  {
    homeTeam: "San Francisco 49ers",
    awayTeam: "Seattle Seahawks",
    league: "NFL",
    gameTime: "Sun 4:25 PM ET",
    spreadHome: "-6.0",
    spreadAway: "-110",
    mlHome: "-245",
    mlAway: "+200",
    totalLine: "O 46.5",
  },
  // NBA
  {
    homeTeam: "Los Angeles Lakers",
    awayTeam: "Boston Celtics",
    league: "NBA",
    gameTime: "Tonight 7:30 PM ET",
    spreadHome: "+2.5",
    spreadAway: "-110",
    mlHome: "+115",
    mlAway: "-135",
    totalLine: "O 228.5",
  },
  {
    homeTeam: "Golden State Warriors",
    awayTeam: "Miami Heat",
    league: "NBA",
    gameTime: "Tonight 10:00 PM ET",
    spreadHome: "-4.5",
    spreadAway: "-110",
    mlHome: "-190",
    mlAway: "+160",
    totalLine: "O 215.0",
  },
  // MLB
  {
    homeTeam: "New York Yankees",
    awayTeam: "Boston Red Sox",
    league: "MLB",
    gameTime: "Tomorrow 1:05 PM ET",
    spreadHome: "-1.5",
    spreadAway: "+145",
    mlHome: "-165",
    mlAway: "+140",
    totalLine: "O 8.5",
  },
  {
    homeTeam: "Los Angeles Dodgers",
    awayTeam: "Chicago Cubs",
    league: "MLB",
    gameTime: "Tomorrow 4:10 PM ET",
    spreadHome: "-1.5",
    spreadAway: "+130",
    mlHome: "-150",
    mlAway: "+125",
    totalLine: "O 9.0",
  },
  // EPL
  {
    homeTeam: "Manchester City",
    awayTeam: "Arsenal",
    league: "EPL",
    gameTime: "Tomorrow 12:30 PM ET",
    spreadHome: "-0.5",
    spreadAway: "-115",
    mlHome: "-130",
    mlAway: "+340",
    totalLine: "O 2.5",
  },
];

function LeagueHeader({ league }: { league: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span
        className="text-xs font-semibold tracking-widest uppercase flex-shrink-0"
        style={{ color: "#8895B3" }}
      >
        {league}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "#2A3350" }} />
    </div>
  );
}

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const filteredGames =
    activeTab === "All"
      ? ALL_GAMES
      : ALL_GAMES.filter((g) => g.league === activeTab);

  const gameCount = filteredGames.length;

  const grouped = filteredGames.reduce<Record<string, Game[]>>((acc, game) => {
    (acc[game.league] ??= []).push(game);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-5">

        {/* Title */}
        <h1 className="text-[28px] font-bold text-white leading-tight">
          Markets
        </h1>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 border"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <Search size={18} style={{ color: "#8895B3", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search teams, leagues..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#F7F9FC" }}
          />
        </div>

        {/* Sport filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {activeTab === "All" ? "All Games" : `${activeTab} Games`}
          </h2>
          <span className="text-sm" style={{ color: "#8895B3" }}>
            {gameCount} {gameCount === 1 ? "game" : "games"}
          </span>
        </div>

        {/* Game list */}
        <div className="flex flex-col gap-3 pb-6">
          {isLoading
            ? [0, 1, 2, 3, 4, 5].map((i) => <MarketCardSkeleton key={i} />)
            : activeTab === "All"
              ? Object.entries(grouped).map(([league, games]) => (
                  <div key={league} className="flex flex-col gap-3">
                    <LeagueHeader league={league} />
                    {games.map((game) => (
                      <MarketCardRow
                        key={`${game.homeTeam}-${game.awayTeam}`}
                        {...game}
                      />
                    ))}
                  </div>
                ))
              : filteredGames.map((game) => (
                  <MarketCardRow
                    key={`${game.homeTeam}-${game.awayTeam}`}
                    {...game}
                  />
                ))
          }
        </div>

      </div>
    </div>
  );
}
