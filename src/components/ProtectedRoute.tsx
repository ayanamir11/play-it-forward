"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/api";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace("/login");
    } else {
      setHasToken(true);
    }
    setChecked(true);
  }, [router]);

  if (!checked || !hasToken) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: "#0A0E1A" }}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2A3350] border-t-[#0052FF]" />
      </div>
    );
  }

  return <>{children}</>;
}
