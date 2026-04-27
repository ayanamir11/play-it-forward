"use client";

import { Heart } from "lucide-react";

const PROGRESS = 62;

export default function CharityPotWidget() {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#131929",
        boxShadow: "0 0 24px 0 rgba(0, 196, 140, 0.12)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Heart size={18} fill="#00C48C" stroke="#00C48C" />
        <span className="text-sm font-medium" style={{ color: "#8895B3" }}>
          Your Impact This Month
        </span>
      </div>

      {/* Primary stat */}
      <div className="text-center mb-6">
        <p className="text-5xl font-bold text-white leading-none mb-2">
          $12.40
        </p>
        <p className="text-sm" style={{ color: "#8895B3" }}>
          donated to American Red Cross
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full mb-2"
        style={{ backgroundColor: "#2A3350" }}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${PROGRESS}%`, backgroundColor: "#00C48C" }}
        />
      </div>
      <p className="text-xs mb-6" style={{ color: "#8895B3" }}>
        {PROGRESS}% of your monthly goal ($20)
      </p>

      {/* Footer stats */}
      <div
        className="flex justify-between pt-4 border-t"
        style={{ borderColor: "#2A3350" }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "#8895B3" }}>
            All-time donated
          </p>
          <p className="text-sm font-bold text-white">$147.80</p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-1" style={{ color: "#8895B3" }}>
            Bets contributed
          </p>
          <p className="text-sm font-bold text-white">34 bets</p>
        </div>
      </div>
    </div>
  );
}
