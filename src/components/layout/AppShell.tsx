"use client";

import BottomTabBar from "./BottomTabBar";
import Sidebar from "./Sidebar";
import BetSlip from "@/components/betting/BetSlip";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 lg:pl-60">
        {children}
      </main>
      <BottomTabBar />
      <BetSlip />
    </div>
  );
}
