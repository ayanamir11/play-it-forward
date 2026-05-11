"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Heart, Home, Receipt, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Markets", href: "/markets", icon: BarChart2 },
  { label: "My Bets", href: "/my-bets", icon: Receipt },
  { label: "Charity", href: "/charity", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const balance = user ? parseFloat(user.balance) : 0;

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 border-r"
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {/* Logo */}
      <div className="px-5 py-6">
        <span className="text-lg font-bold" style={{ color: "#0052FF" }}>
          ⚡ Play It Forward
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 w-full rounded-lg py-3 px-4 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? "#0052FF" : "transparent",
                color: active ? "#ffffff" : "#8895B3",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "#1C2438";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "transparent";
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Wallet balance */}
      <div
        className="mx-3 mb-4 rounded-lg px-4 py-3"
        style={{ backgroundColor: "#1C2438" }}
      >
        <p className="text-xs font-medium" style={{ color: "#8895B3" }}>
          Balance
        </p>
        <p className="text-base font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          ${balance.toFixed(2)}
        </p>
      </div>
    </aside>
  );
}
