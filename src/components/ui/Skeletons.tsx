// Shimmer animation drives all skeleton elements.
// Tailwind's animate-pulse gives a fade; the shimmer keyframe gives
// the sweeping highlight effect seen in native sportsbook apps.

const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #1C2438 25%, #2A3350 50%, #1C2438 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.5s infinite",
};

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded-md ${className}`} style={shimmerStyle} />;
}

// ─── 1. MarketCardSkeleton ────────────────────────────────────────────────────

export function MarketCardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full rounded-xl p-4 border gap-3"
        style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
      >
        {/* Left: event info */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <Bone className="h-3 w-8" />
          <Bone className="h-4 w-40" />
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-24" />
        </div>

        {/* Right: three odds buttons */}
        <div className="flex gap-2 sm:flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 rounded-lg p-2 flex-1 sm:flex-none sm:min-w-[72px]"
              style={{ backgroundColor: "#1C2438" }}
            >
              <Bone className="h-3 w-12" />
              <Bone className="h-5 w-10" />
              <Bone className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── 2. CharityWidgetSkeleton ─────────────────────────────────────────────────

export function CharityWidgetSkeleton() {
  return (
    <div
      className="rounded-xl p-6 border flex flex-col gap-4"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Bone className="h-4 w-4 rounded-full" />
        <Bone className="h-3 w-36" />
      </div>

      {/* Primary stat */}
      <div className="flex flex-col items-center gap-2 py-2">
        <Bone className="h-12 w-32" />
        <Bone className="h-3 w-44" />
      </div>

      {/* Progress bar */}
      <Bone className="h-2 w-full rounded-full" />
      <Bone className="h-3 w-40" />

      {/* Footer stats */}
      <div className="flex justify-between pt-4 border-t" style={{ borderColor: "#2A3350" }}>
        <div className="flex flex-col gap-1.5">
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── 3. TransactionRowSkeleton ────────────────────────────────────────────────

export function TransactionRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{ backgroundColor: "#131929" }}
    >
      {/* Icon circle */}
      <Bone className="w-9 h-9 rounded-full flex-shrink-0" />

      {/* Type + date */}
      <div className="flex flex-col gap-1.5 min-w-[110px]">
        <Bone className="h-3.5 w-20" />
        <Bone className="h-3 w-12" />
      </div>

      {/* Description */}
      <div className="flex-1">
        <Bone className="h-3 w-32" />
      </div>

      {/* Amount */}
      <Bone className="h-4 w-16 flex-shrink-0" />
    </div>
  );
}

// ─── 4. BetCardSkeleton ───────────────────────────────────────────────────────

export function BetCardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-3"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Top row: league + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Bone className="h-3 w-8" />
          <Bone className="h-4 w-44" />
        </div>
        <Bone className="h-6 w-16 rounded-full" />
      </div>

      {/* Middle: pick + odds + wager */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2.5"
        style={{ backgroundColor: "#1C2438" }}
      >
        <div className="flex flex-col gap-1.5">
          <Bone className="h-3 w-16" />
          <Bone className="h-4 w-28" />
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col gap-1.5 items-center">
            <Bone className="h-3 w-8" />
            <Bone className="h-4 w-12" />
          </div>
          <div className="flex flex-col gap-1.5 items-center">
            <Bone className="h-3 w-10" />
            <Bone className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* Bottom row placeholder */}
      <Bone className="h-3 w-48" />
    </div>
  );
}
