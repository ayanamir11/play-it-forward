"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Heart, Home, Receipt, User } from "lucide-react";

const TABS = [
  { label: "Home",    href: "/",        icon: Home      },
  { label: "Markets", href: "/markets", icon: BarChart2  },
  { label: "My Bets", href: "/my-bets", icon: Receipt    },
  { label: "Charity", href: "/charity", icon: Heart      },
  { label: "Account", href: "/account", icon: User       },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t pb-safe"
      style={{ backgroundColor: "#0D1321", borderColor: "#2A3350" }}
    >
      {TABS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 pt-3 pb-3 text-xs font-medium min-h-[56px]"
            style={{ color: active ? "#0052FF" : "#8895B3" }}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
