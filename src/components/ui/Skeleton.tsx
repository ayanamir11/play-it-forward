// ─── Base skeleton atom ───────────────────────────────────────────────────────
// Uses Tailwind animate-pulse + the app's dark-blue swatch (#1E2A45).
// All composite skeletons below are built from this one primitive.

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "#1E2A45" }}
    />
  );
}

// ─── AccountProfileSkeleton ───────────────────────────────────────────────────
// Replaces the avatar + name / email / username / member-since block while the
// /api/account fetch is in flight.

export function AccountProfileSkeleton() {
  return (
    <div className="flex items-start gap-4">
      {/* Avatar circle */}
      <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />

      {/* Text block */}
      <div className="flex flex-col gap-2 min-w-0 pt-1">
        <Skeleton className="h-5 w-36" />   {/* display name */}
        <Skeleton className="h-3.5 w-48" /> {/* email */}
        <Skeleton className="h-3 w-24" />   {/* @username */}
        <Skeleton className="h-3 w-32" />   {/* member since */}
      </div>
    </div>
  );
}

// ─── CharityPageSkeleton ──────────────────────────────────────────────────────
// Full-page skeleton that mirrors the Charity Hub layout:
//   1. Page heading
//   2. Impact hero card
//   3. Active cause card
//   4. All Cause Categories grid
//   5. Donation History table stub

export function CharityPageSkeleton() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-8 pb-6">

        {/* Page heading */}
        <Skeleton className="h-8 w-44" />

        {/* ── Impact hero card ── */}
        <div
          className="rounded-xl p-6 border-l-4 border flex flex-col gap-4"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350", borderLeftColor: "#00C48C" }}
        >
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-28" />    {/* "Your Total Impact" label */}
            <Skeleton className="h-12 w-40" />   {/* big $ amount */}
            <Skeleton className="h-3 w-52" />    {/* subtitle */}
          </div>

          <div
            className="grid grid-cols-2 gap-3 pt-4 border-t"
            style={{ borderColor: "#2A3350" }}
          >
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>

        {/* ── Active Cause card ── */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-36" /> {/* section heading */}

          <div
            className="rounded-xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
          >
            <Skeleton className="h-3 w-24" /> {/* category label */}

            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-40" />  {/* charity name */}
                <Skeleton className="h-3 w-full" /> {/* description line 1 */}
                <Skeleton className="h-3 w-3/4" />  {/* description line 2 */}
              </div>
            </div>

            <Skeleton className="h-10 w-full" />  {/* "This month" bar */}
            <Skeleton className="h-10 w-full" />  {/* Switch Cause button */}
          </div>
        </div>

        {/* ── All Cause Categories ── */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-44" /> {/* section heading */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-4 border flex items-center gap-4"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              >
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Donation History stub ── */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-36" /> {/* section heading */}

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#2A3350" }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-4 px-4 py-2.5 gap-4"
              style={{ backgroundColor: "#1C2438" }}
            >
              {[28, 20, 20, 16].map((w, i) => (
                <Skeleton key={i} className={`h-3 w-${w}`} />
              ))}
            </div>

            {/* 3 skeleton rows */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center px-4 py-3 gap-4 border-t"
                style={{ borderColor: "#2A3350", backgroundColor: i % 2 === 0 ? "#131929" : "transparent" }}
              >
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-16 justify-self-end" />
                <Skeleton className="h-5 w-16 rounded-full justify-self-end" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── EventDetailSkeleton ──────────────────────────────────────────────────────
// Full-page skeleton matching the event detail layout:
//   1. Back button
//   2. Event header card (league badge · away vs home · game time)
//   3. Market tabs
//   4. Two odds buttons

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

        {/* Back button */}
        <Skeleton className="h-4 w-28" />

        {/* Event header card */}
        <div
          className="rounded-xl p-6 border flex flex-col items-center gap-4"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          <Skeleton className="h-6 w-24 rounded-full" />  {/* league badge */}

          <div className="flex flex-col items-center gap-2 w-full">
            <Skeleton className="h-6 w-52" />  {/* away team */}
            <Skeleton className="h-4 w-6" />   {/* "vs" */}
            <Skeleton className="h-6 w-48" />  {/* home team */}
          </div>

          <Skeleton className="h-4 w-36" />  {/* game time */}
        </div>

        {/* Market tabs + odds */}
        <div className="flex flex-col gap-4">
          {/* Tab bar */}
          <div className="flex gap-1 border-b pb-px" style={{ borderColor: "#2A3350" }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-none rounded-t-lg" />
            ))}
          </div>

          {/* Two odds buttons */}
          <div className="flex gap-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-xl p-4 border flex flex-col items-center gap-2"
                style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
              >
                <Skeleton className="h-4 w-32" />  {/* team name */}
                <Skeleton className="h-7 w-16" />  {/* odds */}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
