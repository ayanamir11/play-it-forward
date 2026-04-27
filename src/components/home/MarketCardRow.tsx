"use client";

import { useState } from "react";
import { BetSelection, useBetSlipStore } from "@/store/betSlipStore";

interface MarketCardRowProps {
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  gameTime?: string;
  spreadHome?: string;
  spreadAway?: string;
  mlHome?: string;
  mlAway?: string;
  totalLine?: string;
}

interface OddsButtonProps {
  label: string;
  value: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}

function OddsButton({ label, value, sub, selected, onClick }: OddsButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center rounded-lg px-3 py-2 min-w-[72px] border transition-colors"
      style={{
        backgroundColor: selected ? "#0052FF" : hovered ? "#242d45" : "#1C2438",
        borderColor: selected ? "#0052FF" : hovered ? "#0052FF" : "transparent",
        color: selected ? "#ffffff" : "#ffffff",
      }}
    >
      <span
        className="text-xs mb-0.5"
        style={{ color: selected ? "rgba(255,255,255,0.75)" : "#8895B3" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-bold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
      <span
        className="text-xs"
        style={{ color: selected ? "rgba(255,255,255,0.75)" : "#8895B3", fontFamily: "var(--font-mono)" }}
      >
        {sub}
      </span>
    </button>
  );
}

export default function MarketCardRow({
  homeTeam = "Kansas City Chiefs",
  awayTeam = "San Francisco 49ers",
  league = "NFL",
  gameTime = "Today 8:20 PM ET",
  spreadHome = "-3.5",
  spreadAway = "-110",
  mlHome = "-165",
  mlAway = "+140",
  totalLine = "O 44.5",
}: MarketCardRowProps) {
  const { selections, addSelection } = useBetSlipStore();

  const cardKey = `${homeTeam}${awayTeam}`;

  const isSelected = (betType: BetSelection["betType"]) =>
    selections.some((s) => s.id === `${cardKey}-${betType}`);

  function handleSelect(betType: BetSelection["betType"], label: string, oddsStr: string) {
    const id = `${cardKey}-${betType}`;
    // If already selected, deselect by removing from store
    if (isSelected(betType)) {
      useBetSlipStore.getState().removeSelection(id);
      return;
    }
    const odds = parseInt(oddsStr.replace("+", ""), 10);
    const bet: BetSelection = {
      id,
      homeTeam,
      awayTeam,
      league,
      gameTime,
      betType,
      label,
      odds,
    };
    addSelection(bet);
  }

  return (
    <div
      className="flex items-center justify-between w-full rounded-xl p-4 border"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Left: event info */}
      <div className="flex flex-col gap-1 min-w-0 mr-4">
        <span className="text-xs font-medium" style={{ color: "#8895B3" }}>
          {league}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-snug">{homeTeam}</span>
          <span className="text-sm font-bold text-white leading-snug">{awayTeam}</span>
        </div>
        <span className="text-xs" style={{ color: "#8895B3" }}>
          {gameTime}
        </span>
      </div>

      {/* Right: odds buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <OddsButton
          label="Spread"
          value={spreadHome}
          sub={spreadAway}
          selected={isSelected("spread")}
          onClick={() => handleSelect("spread", `${homeTeam.split(" ").pop()} ${spreadHome}`, spreadAway)}
        />
        <OddsButton
          label="Moneyline"
          value={mlHome}
          sub={mlAway}
          selected={isSelected("moneyline")}
          onClick={() => handleSelect("moneyline", `${homeTeam.split(" ").pop()} ML`, mlHome)}
        />
        <OddsButton
          label="Total"
          value={totalLine}
          sub="-110"
          selected={isSelected("total")}
          onClick={() => handleSelect("total", totalLine, "-110")}
        />
      </div>
    </div>
  );
}
