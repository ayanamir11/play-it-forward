"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ReceiptText, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBetSlipStore } from "@/store/betSlipStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const QUICK_PICKS = [10, 25, 50, 100];

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

// ─── Detect desktop (lg: breakpoint = 1024px) ────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ─── Confirmation / Success Modal ────────────────────────────────────────────

interface ModalProps {
  onCancel: () => void;
  onDone: () => void;
}

function ConfirmModal({ onCancel, onDone }: ModalProps) {
  const { selections, wagerAmount, potentialPayout, charityContribution, clearSlip } =
    useBetSlipStore();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [confirmed, setConfirmed] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [betId, setBetId] = useState("");

  const bet = selections[0];
  const wager = parseFloat(wagerAmount) || 0;
  const payout = potentialPayout();
  const charity = charityContribution();

  async function handleConfirm() {
    if (!bet || isPlacing) return;
    setIsPlacing(true);
    setBetError(null);
    try {
      const res = await api.post("/api/bets", {
        sport: bet.league,
        event: `${bet.homeTeam} vs ${bet.awayTeam}`,
        pick: bet.label,
        betType: bet.betType.toUpperCase(),
        odds: bet.odds,
        wagerAmount: wager,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place bet");
      setBetId(`PIF-${data.bet.id.slice(-6).toUpperCase()}`);
      fetchUser();
      setConfirmed(true);
      toast.success("Bet placed successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place bet";
      setBetError(msg);
      toast.error(msg);
    } finally {
      setIsPlacing(false);
    }
  }

  function handleDone() {
    clearSlip();
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={!confirmed ? onCancel : undefined}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
        style={{ backgroundColor: "#131929", border: "1px solid #2A3350" }}
      >
        {confirmed ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle2 size={56} style={{ color: "#00C48C" }} />
            <div>
              <p className="text-xl font-bold text-white mb-1">Bet Placed!</p>
              <p className="text-xs" style={{ color: "#8895B3" }}>{betId}</p>
            </div>
            <div
              className="w-full rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(0,196,140,0.08)", color: "#00C48C" }}
            >
              ♥ Win or lose, ${formatMoney(charity)} goes to American Red Cross
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDone}
              className="w-full rounded-lg py-3 text-sm font-bold text-white"
              style={{ backgroundColor: "#0052FF" }}
            >
              Done
            </motion.button>
          </div>
        ) : (
          /* ── Confirm state ── */
          <>
            <div>
              <p className="text-lg font-bold text-white mb-1">Confirm Bet</p>
              <p className="text-sm" style={{ color: "#8895B3" }}>
                Review your bet before placing
              </p>
            </div>

            {bet && (
              <div
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{ backgroundColor: "#1C2438" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8895B3" }}>
                    {bet.league}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#0052FF", fontFamily: "var(--font-mono)" }}
                  >
                    {formatOdds(bet.odds)}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {bet.homeTeam} vs {bet.awayTeam}
                </p>
                <p className="text-sm" style={{ color: "#8895B3" }}>
                  {bet.label}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {[
                { label: "Wager",    value: `$${formatMoney(wager)}`,   color: "#F7F9FC" },
                { label: "To Win",   value: `$${formatMoney(payout)}`,  color: "#F7F9FC" },
                { label: "Charity ♥", value: `$${formatMoney(charity)}`, color: "#00C48C" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span style={{ color: "#8895B3" }}>{label}</span>
                  <span className="font-bold" style={{ color, fontFamily: "var(--font-mono)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {betError && (
              <div
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
              >
                {betError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={onCancel}
                disabled={isPlacing}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
                style={{ borderColor: "#2A3350", color: "#F7F9FC", opacity: isPlacing ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={isPlacing ? {} : { scale: 1.02 }}
                whileTap={isPlacing ? {} : { scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isPlacing}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: "#0052FF", opacity: isPlacing ? 0.75 : 1 }}
              >
                {isPlacing && <Loader2 size={14} className="animate-spin" />}
                {isPlacing ? "Placing…" : "Confirm Bet"}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main BetSlip ─────────────────────────────────────────────────────────────

export default function BetSlip() {
  const {
    selections,
    wagerAmount,
    isOpen,
    removeSelection,
    clearSlip,
    setWagerAmount,
    toggleOpen,
    potentialPayout,
    charityContribution,
  } = useBetSlipStore();
  const user = useAuthStore((s) => s.user);
  const isDesktop = useIsDesktop();

  const [showModal, setShowModal] = useState(false);

  const bet = selections[0] ?? null;
  const wager = parseFloat(wagerAmount) || 0;
  const payout = potentialPayout();
  const charity = charityContribution();
  const balance = user ? parseFloat(user.balance) : 0;
  const overBalance = wager > 0 && wager > balance;
  const canPlace = !!bet && wager > 0 && !overBalance;

  return (
    <>
      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 lg:left-auto lg:top-0 lg:right-0 lg:bottom-0 lg:w-[360px]"
            style={{
              backgroundColor: "#131929",
              borderLeft: "1px solid #2A3350",
              maxHeight: "85vh",
            }}
            initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col h-full overflow-y-auto rounded-t-2xl lg:rounded-none">

              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b"
                style={{ borderColor: "#2A3350" }}
              >
                <span className="text-base font-bold text-white flex-1">Bet Slip</span>
                {selections.length > 0 && (
                  <span
                    className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#0052FF", color: "#ffffff" }}
                  >
                    {selections.length}
                  </span>
                )}
                <button onClick={toggleOpen} className="p-1 rounded-md hover:bg-[#1C2438]">
                  <X size={18} style={{ color: "#8895B3" }} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4 px-4 py-4 flex-1">
                {!bet ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <ReceiptText size={40} style={{ color: "#2A3350" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#8895B3" }}>
                        No bets selected
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#8895B3" }}>
                        Tap any odds button to add a bet
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Selection card */}
                    <div
                      className="relative rounded-xl p-4 flex flex-col gap-2"
                      style={{ backgroundColor: "#1C2438" }}
                    >
                      <button
                        onClick={() => removeSelection(bet.id)}
                        className="absolute top-3 right-3 p-1 rounded hover:bg-[#2A3350]"
                      >
                        <X size={14} style={{ color: "#8895B3" }} />
                      </button>

                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#8895B3" }}
                      >
                        {bet.league} · {bet.gameTime}
                      </span>
                      <p className="text-sm font-bold text-white pr-6">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{bet.label}</span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#0052FF", fontFamily: "var(--font-mono)" }}
                        >
                          {formatOdds(bet.odds)}
                        </span>
                      </div>
                    </div>

                    {/* Wager input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium" style={{ color: "#8895B3" }}>
                          Wager Amount
                        </label>
                        {user && (
                          <span className="text-xs" style={{ color: "#8895B3" }}>
                            Balance:{" "}
                            <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                              ${formatMoney(balance)}
                            </span>
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center rounded-lg border overflow-hidden"
                        style={{ backgroundColor: "#0A0E1A", borderColor: "#2A3350" }}
                      >
                        <span className="pl-3 pr-1 text-sm font-medium" style={{ color: "#8895B3" }}>
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={wagerAmount}
                          onChange={(e) => setWagerAmount(e.target.value)}
                          className="flex-1 bg-transparent py-3 pr-3 text-sm text-white outline-none"
                          style={{ fontFamily: "var(--font-mono)" }}
                        />
                      </div>

                      {/* Quick picks */}
                      <div className="grid grid-cols-4 gap-2">
                        {QUICK_PICKS.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setWagerAmount(String(amt))}
                            className="rounded-lg py-2 text-xs font-semibold text-white transition-colors hover:opacity-80"
                            style={{ backgroundColor: "#1C2438" }}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payout display */}
                    <div
                      className="rounded-xl p-4 flex flex-col gap-3 border"
                      style={{ backgroundColor: "#0A0E1A", borderColor: "#2A3350" }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "#8895B3" }}>To Win</span>
                        <span
                          className="font-bold text-white"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          ${formatMoney(payout)}
                        </span>
                      </div>
                      <div className="h-px" style={{ backgroundColor: "#2A3350" }} />
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "#8895B3" }}>Charity Contribution ♥</span>
                        <span
                          className="font-bold"
                          style={{ color: "#00C48C", fontFamily: "var(--font-mono)" }}
                        >
                          ${formatMoney(charity)}
                        </span>
                      </div>
                    </div>

                    {/* Insufficient balance warning */}
                    {overBalance && (
                      <div
                        className="rounded-lg px-3 py-2.5 text-xs font-medium"
                        style={{ backgroundColor: "rgba(255,59,92,0.1)", color: "#FF3B5C" }}
                      >
                        Wager exceeds your balance of ${formatMoney(balance)}
                      </div>
                    )}

                    {/* Place bet button */}
                    <motion.button
                      whileHover={canPlace ? { scale: 1.02 } : {}}
                      whileTap={canPlace ? { scale: 0.98 } : {}}
                      disabled={!canPlace}
                      onClick={() => setShowModal(true)}
                      className="w-full rounded-lg py-3.5 text-sm font-bold text-white transition-opacity"
                      style={{
                        backgroundColor: canPlace ? "#0052FF" : "#2A3350",
                        cursor: canPlace ? "pointer" : "not-allowed",
                        opacity: canPlace ? 1 : 0.6,
                      }}
                    >
                      {overBalance
                        ? "Insufficient balance"
                        : canPlace
                          ? `Place Bet — $${formatMoney(wager)}`
                          : "Enter a wager to continue"}
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      {showModal && (
        <ConfirmModal
          onCancel={() => setShowModal(false)}
          onDone={() => setShowModal(false)}
        />
      )}
    </>
  );
}
