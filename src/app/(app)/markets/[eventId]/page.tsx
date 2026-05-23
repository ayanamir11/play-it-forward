"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BetSelection, useBetSlipStore } from "@/store/betSlipStore";
import { EventDetailSkeleton } from "@/components/ui/Skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{ markets: OddsMarket[] }>;
}

type MarketTab = "moneyline" | "spread" | "total";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: MarketTab; label: string }[] = [
  { key: "moneyline", label: "Moneyline" },
  { key: "spread",    label: "Spread"    },
  { key: "total",     label: "Total"     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtOdds(price?: number): string {
  if (price === undefined) return "—";
  return price > 0 ? `+${price}` : `${price}`;
}

function fmtPoint(point?: number): string {
  if (point === undefined) return "—";
  return point > 0 ? `+${point}` : `${point}`;
}

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

  if (day.getTime() === today.getTime()) return `Today · ${time} ET`;
  if (day.getTime() === tomorrow.getTime()) return `Tomorrow · ${time} ET`;

  return `${date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  })} · ${time} ET`;
}

// ─── Odds Button ──────────────────────────────────────────────────────────────

interface OddsButtonProps {
  title: string;
  subtitle?: string;
  odds: string;
  selected: boolean;
  onClick: () => void;
}

function OddsButton({ title, subtitle, odds, selected, onClick }: OddsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl p-4 border flex flex-col items-center gap-1.5 transition-colors"
      style={{
        backgroundColor: selected ? "#0A1628" : "#131929",
        borderColor: selected ? "#0052FF" : "#2A3350",
      }}
    >
      <span className="text-sm font-bold text-white text-center leading-snug">{title}</span>
      {subtitle && (
        <span className="text-xs font-semibold" style={{ color: selected ? "#93AFFF" : "#8895B3" }}>
          {subtitle}
        </span>
      )}
      <span
        className="text-lg font-bold"
        style={{ color: selected ? "#4D88FF" : "#F7F9FC", fontFamily: "var(--font-mono)" }}
      >
        {odds}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.eventId as string;
  const sport = searchParams.get("sport") ?? "basketball_nba";

  const [event, setEvent] = useState<OddsEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MarketTab>("moneyline");

  const { selections, addSelection, removeSelection } = useBetSlipStore();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/odds/events?sport=${sport}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load events");
        const found = (data.events as OddsEvent[]).find((e) => e.id === eventId);
        if (!found) throw new Error("Event not found");
        setEvent(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [eventId, sport]);

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm font-medium" style={{ color: "#FF3B5C" }}>
          {error ?? "Event not found"}
        </p>
        <button
          onClick={() => router.push("/markets")}
          className="text-xs font-semibold"
          style={{ color: "#0052FF" }}
        >
          ← Back to Markets
        </button>
      </div>
    );
  }

  // ── Parse bookmaker markets ──
  const bm        = event.bookmakers[0];
  const h2h       = bm?.markets.find((m) => m.key === "h2h");
  const spreads   = bm?.markets.find((m) => m.key === "spreads");
  const totals    = bm?.markets.find((m) => m.key === "totals");

  const homeH2h    = h2h?.outcomes.find((o) => o.name === event.home_team);
  const awayH2h    = h2h?.outcomes.find((o) => o.name === event.away_team);
  const homeSpread = spreads?.outcomes.find((o) => o.name === event.home_team);
  const awaySpread = spreads?.outcomes.find((o) => o.name === event.away_team);
  const overTotal  = totals?.outcomes.find((o) => o.name === "Over");
  const underTotal = totals?.outcomes.find((o) => o.name === "Under");

  const gameTime = formatGameTime(event.commence_time);

  // ── Selection helpers ──
  // IDs scoped to this event so they don't collide with MarketCardRow selections
  function selId(side: string): string {
    return `${eventId}-${activeTab}-${side}`;
  }

  function isSelected(side: string): boolean {
    return selections.some((s) => s.id === selId(side));
  }

  function handleSelect(
    side: "home" | "away" | "over" | "under",
    label: string,
    oddsStr: string,
    betType: BetSelection["betType"],
  ) {
    if (!event) return;
    const id = selId(side);
    if (selections.some((s) => s.id === id)) {
      removeSelection(id);
      return;
    }
    const odds = parseInt(oddsStr.replace("+", ""), 10);
    addSelection({
      id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      league: event.sport_title,
      gameTime,
      betType,
      label,
      odds,
    });
  }

  const shortHome = event.home_team.split(" ").at(-1)!;
  const shortAway = event.away_team.split(" ").at(-1)!;

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

        {/* ── Back button ── */}
        <button
          onClick={() => router.push("/markets")}
          className="flex items-center gap-1.5 w-fit text-sm font-medium transition-colors hover:text-white"
          style={{ color: "#8895B3" }}
        >
          <ArrowLeft size={16} />
          Back to Markets
        </button>

        {/* ── Event header card ── */}
        <div
          className="rounded-xl p-6 border flex flex-col items-center gap-4"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(0,82,255,0.15)", color: "#0052FF" }}
          >
            {event.sport_title}
          </span>

          <div className="flex flex-col items-center gap-1.5 w-full">
            <span className="text-xl font-bold text-white text-center">{event.away_team}</span>
            <span className="text-sm font-medium" style={{ color: "#8895B3" }}>vs</span>
            <span className="text-xl font-bold text-white text-center">{event.home_team}</span>
          </div>

          <span className="text-sm" style={{ color: "#8895B3" }}>{gameTime}</span>
        </div>

        {/* ── Markets ── */}
        <div className="flex flex-col gap-4">

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
                </button>
              );
            })}
          </div>

          {/* Odds buttons */}
          <div className="flex gap-3">

            {activeTab === "moneyline" && (
              <>
                <OddsButton
                  title={event.away_team}
                  odds={fmtOdds(awayH2h?.price)}
                  selected={isSelected("away")}
                  onClick={() =>
                    handleSelect("away", `${shortAway} ML`, fmtOdds(awayH2h?.price), "moneyline")
                  }
                />
                <OddsButton
                  title={event.home_team}
                  odds={fmtOdds(homeH2h?.price)}
                  selected={isSelected("home")}
                  onClick={() =>
                    handleSelect("home", `${shortHome} ML`, fmtOdds(homeH2h?.price), "moneyline")
                  }
                />
              </>
            )}

            {activeTab === "spread" && (
              <>
                <OddsButton
                  title={event.away_team}
                  subtitle={fmtPoint(awaySpread?.point)}
                  odds={fmtOdds(awaySpread?.price)}
                  selected={isSelected("away")}
                  onClick={() =>
                    handleSelect(
                      "away",
                      `${shortAway} ${fmtPoint(awaySpread?.point)}`,
                      fmtOdds(awaySpread?.price),
                      "spread",
                    )
                  }
                />
                <OddsButton
                  title={event.home_team}
                  subtitle={fmtPoint(homeSpread?.point)}
                  odds={fmtOdds(homeSpread?.price)}
                  selected={isSelected("home")}
                  onClick={() =>
                    handleSelect(
                      "home",
                      `${shortHome} ${fmtPoint(homeSpread?.point)}`,
                      fmtOdds(homeSpread?.price),
                      "spread",
                    )
                  }
                />
              </>
            )}

            {activeTab === "total" && (
              <>
                <OddsButton
                  title="Over"
                  subtitle={overTotal?.point !== undefined ? `${overTotal.point}` : undefined}
                  odds={fmtOdds(overTotal?.price)}
                  selected={isSelected("over")}
                  onClick={() =>
                    handleSelect(
                      "over",
                      `Over ${overTotal?.point ?? ""}`,
                      fmtOdds(overTotal?.price),
                      "total",
                    )
                  }
                />
                <OddsButton
                  title="Under"
                  subtitle={underTotal?.point !== undefined ? `${underTotal.point}` : undefined}
                  odds={fmtOdds(underTotal?.price)}
                  selected={isSelected("under")}
                  onClick={() =>
                    handleSelect(
                      "under",
                      `Under ${underTotal?.point ?? ""}`,
                      fmtOdds(underTotal?.price),
                      "total",
                    )
                  }
                />
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
