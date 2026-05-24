import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
      {/* Icon circle */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#2A3350" }}
      >
        <Icon size={28} style={{ color: "#8895B3" }} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-bold text-white">{title}</p>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#8895B3" }}>
          {description}
        </p>
      </div>

      {/* Optional CTA */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-1 inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0052FF" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
