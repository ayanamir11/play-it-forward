"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import CharityPotWidget from "@/components/home/CharityPotWidget";
import MarketCardRow from "@/components/home/MarketCardRow";
import { CharityWidgetSkeleton, MarketCardSkeleton } from "@/components/ui/Skeletons";
import { PageTransition } from "@/components/ui/PageTransition";
import { useAuthStore } from "@/store/authStore";

const FEATURED_GAMES = [
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[800px] flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white min-w-0 truncate">
              {getGreeting()}, {user?.username ?? "there"} 👋
            </h1>
            <button
              aria-label="Notifications"
              className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-[#1C2438]"
            >
              <Bell size={22} style={{ color: "#8895B3" }} />
            </button>
          </div>

          {/* Charity widget */}
          {isLoading ? (
            <CharityWidgetSkeleton />
          ) : (
            <motion.div {...fadeIn}>
              <CharityPotWidget />
            </motion.div>
          )}

          {/* Featured Games */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Featured Games</h2>
              <a href="/markets" className="text-sm font-medium" style={{ color: "#0052FF" }}>
                See All
              </a>
            </div>
            {isLoading ? (
              [0, 1, 2, 3].map((i) => <MarketCardSkeleton key={i} />)
            ) : (
              <motion.div {...fadeIn} className="flex flex-col gap-3">
                {FEATURED_GAMES.map((game) => (
                  <MarketCardRow key={`${game.homeTeam}-${game.awayTeam}`} {...game} />
                ))}
              </motion.div>
            )}
          </section>

          {/* Live Now */}
          {!isLoading && (
            <motion.section {...fadeIn} className="flex flex-col gap-3 pb-6">
              <h2 className="text-lg font-bold text-white">Live Now 🔴</h2>
              <div className="relative">
                <MarketCardRow
                  homeTeam="Denver Nuggets"
                  awayTeam="Milwaukee Bucks"
                  league="NBA"
                  gameTime="Q3 8:42 · 67 – 71"
                  spreadHome="-1.5"
                  spreadAway="-110"
                  mlHome="-125"
                  mlAway="+105"
                  totalLine="O 224.5"
                />
                <span
                  className="absolute top-3 right-3 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#FF3B5C", color: "#ffffff" }}
                >
                  LIVE
                </span>
              </div>
            </motion.section>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
