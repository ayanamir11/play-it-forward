"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronRight,
  HandHeart,
  Heart,
  HeartHandshake,
  HelpCircle,
  Leaf,
  Loader2,
  LogOut,
  Scale,
  Shield,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  selectedCause: string | null;
  balance: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CAUSE_CATEGORIES = [
  { key: "HEALTH",       label: "Health",        icon: Heart,     description: "Health & Medical Research"   },
  { key: "EDUCATION",    label: "Education",      icon: BookOpen,  description: "Education & Literacy"        },
  { key: "ENVIRONMENT",  label: "Environment",    icon: Leaf,      description: "Environment & Conservation"  },
  { key: "HUMAN_RIGHTS", label: "Human Rights",   icon: Scale,     description: "Human Rights & Justice"      },
  { key: "POVERTY",      label: "Poverty & Aid",  icon: HandHeart, description: "Poverty Relief & Aid"        },
];

const CAUSE_LABEL: Record<string, string> = {
  HEALTH:       "Health & Medical Research",
  EDUCATION:    "Education",
  ENVIRONMENT:  "Environment & Conservation",
  HUMAN_RIGHTS: "Human Rights",
  POVERTY:      "Poverty & Aid",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8895B3" }}>{children}</h2>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
    >
      {children}
    </div>
  );
}

function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Change Cause Modal ───────────────────────────────────────────────────────

interface ChangeCauseModalProps {
  current: string | null;
  onClose: () => void;
  onSave: (cause: string) => Promise<void>;
}

function ChangeCauseModal({ current, onClose, onSave }: ChangeCauseModalProps) {
  const [selected, setSelected] = useState(current);
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSave() {
    if (!selected || selected === current) { onClose(); return; }
    setSaving(true);
    try { await onSave(selected); } finally { setSaving(false); }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,14,26,0.85)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col gap-4 p-6 border"
        style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Change Cause</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1C2438] transition-colors">
            <X size={16} style={{ color: "#8895B3" }} />
          </button>
        </div>

        <p className="text-xs" style={{ color: "#8895B3" }}>
          A portion of your losing bets goes to a charity in your chosen cause.
        </p>

        <div className="flex flex-col gap-2">
          {CAUSE_CATEGORIES.map(({ key, label, icon: Icon, description }) => {
            const active = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="flex items-center gap-3 rounded-xl p-3 border text-left transition-colors hover:bg-[#1C2438]"
                style={{
                  backgroundColor: active ? "rgba(0,82,255,0.08)" : "transparent",
                  borderColor: active ? "#0052FF" : "#2A3350",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: active ? "rgba(0,82,255,0.15)" : "#1C2438" }}
                >
                  <Icon size={16} style={{ color: active ? "#0052FF" : "#8895B3" }} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-white">{label}</span>
                  <span className="text-xs" style={{ color: "#8895B3" }}>{description}</span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !selected}
          className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#0052FF" }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save Cause
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const setUser = useAuthStore((s) => s.fetchUser);

  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCauseModal, setShowCauseModal] = useState(false);

  useEffect(() => {
    api.get("/api/account")
      .then((r) => r.json())
      .then((data) => { if (data.id) setAccount(data as AccountData); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCauseChange(cause: string) {
    const res = await api.patch("/api/account/cause", { selectedCause: cause });
    const data = await res.json();
    if (res.ok) {
      setAccount((prev) => prev ? { ...prev, selectedCause: cause } : prev);
      await setUser();
    } else {
      throw new Error(data.error ?? "Failed to update cause");
    }
    setShowCauseModal(false);
  }

  const displayName = account
    ? `${account.firstName} ${account.lastName}`
    : user ? `${user.firstName} ${user.lastName}` : "—";

  const initials = account
    ? `${account.firstName[0] ?? ""}${account.lastName[0] ?? ""}`.toUpperCase()
    : user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "?";

  const email = account?.email ?? user?.email ?? "";
  const username = account?.username ?? user?.username ?? "";
  const balance = account
    ? `$${parseFloat(account.balance).toFixed(2)}`
    : user ? `$${parseFloat(user.balance).toFixed(2)}` : "$0.00";

  const selectedCause = account?.selectedCause ?? user?.selectedCause ?? null;
  const memberSince = account?.createdAt ? formatMemberSince(account.createdAt) : null;

  const SETTINGS = [
    { icon: Bell,              label: "Notification Preferences", sublabel: null,       danger: false, onClick: undefined         },
    { icon: SlidersHorizontal, label: "Odds Format",              sublabel: "American", danger: false, onClick: undefined         },
    { icon: Shield,            label: "Security & Password",      sublabel: null,       danger: false, onClick: undefined         },
    { icon: HeartHandshake,    label: "Responsible Gambling",     sublabel: null,       danger: false, onClick: undefined         },
    { icon: HelpCircle,        label: "Help & Support",           sublabel: null,       danger: false, onClick: undefined         },
    { icon: LogOut,            label: "Log Out",                  sublabel: null,       danger: true,  onClick: logout            },
  ] as const;

  return (
    <>
      <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[800px] flex flex-col gap-6 pb-8">

          {/* ── 1. Profile card ── */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold"
                style={{ backgroundColor: "rgba(0,82,255,0.2)", color: "#0052FF" }}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" style={{ color: "#0052FF" }} /> : initials}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-lg font-bold text-white">{displayName}</span>
                <span className="text-sm" style={{ color: "#8895B3" }}>{email}</span>
                <span className="text-xs" style={{ color: "#8895B3" }}>@{username}</span>
                {memberSince && (
                  <span className="text-xs mt-0.5" style={{ color: "#8895B3" }}>
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* ── 2. Active Cause card ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading>Charity Cause</SectionHeading>
            <Card className="p-5 flex flex-col gap-3">
              {selectedCause ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(0,196,140,0.12)" }}
                    >
                      <Heart size={16} style={{ color: "#00C48C" }} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-white">
                        {CAUSE_LABEL[selectedCause] ?? selectedCause}
                      </span>
                      <span className="text-xs" style={{ color: "#8895B3" }}>Active cause</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCauseModal(true)}
                    className="text-xs font-semibold flex-shrink-0"
                    style={{ color: "#0052FF" }}
                  >
                    Change →
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: "#8895B3" }}>No cause selected</span>
                  <button
                    onClick={() => setShowCauseModal(true)}
                    className="text-xs font-semibold"
                    style={{ color: "#0052FF" }}
                  >
                    Select Cause →
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* ── 3. Wallet card ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading>Wallet</SectionHeading>
            <Card className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: "#8895B3" }}>Available Balance</p>
                <p className="text-4xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                  {balance}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/wallet/deposit"
                  className="flex-1 text-center rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#0052FF" }}
                >
                  Deposit
                </Link>
                <Link
                  href="/wallet/withdraw"
                  className="flex-1 text-center rounded-lg py-2.5 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
                  style={{ borderColor: "#2A3350", color: "#F7F9FC" }}
                >
                  Withdraw
                </Link>
              </div>

              <Link
                href="/wallet"
                className="text-center text-xs font-medium"
                style={{ color: "#0052FF" }}
              >
                View All Transactions →
              </Link>
            </Card>
          </div>

          {/* ── 4. Settings list ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading>Settings</SectionHeading>
            <Card>
              {SETTINGS.map(({ icon: Icon, label, sublabel, danger, onClick }, i) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#1C2438] ${
                    i < SETTINGS.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "#2A3350" }}
                >
                  <Icon size={18} style={{ color: danger ? "#FF3B5C" : "#8895B3", flexShrink: 0 }} />
                  <span
                    className="flex-1 text-left text-sm font-medium"
                    style={{ color: danger ? "#FF3B5C" : "#F7F9FC" }}
                  >
                    {label}
                  </span>
                  {sublabel && (
                    <span className="text-sm mr-1" style={{ color: "#8895B3" }}>{sublabel}</span>
                  )}
                  {!danger && (
                    <ChevronRight size={16} style={{ color: "#8895B3", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </Card>
          </div>

          <p className="text-center text-xs" style={{ color: "#8895B3" }}>v1.0.0</p>

        </div>
      </div>

      {showCauseModal && (
        <ChangeCauseModal
          current={selectedCause}
          onClose={() => setShowCauseModal(false)}
          onSave={handleCauseChange}
        />
      )}
    </>
  );
}
