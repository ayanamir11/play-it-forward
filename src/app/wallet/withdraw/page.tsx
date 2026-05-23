"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Building2, Check, CheckCircle2, Info, Loader2, Lock, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface WithdrawMethod {
  key: string;
  label: string;
  sublabel: string;
  verified?: boolean;
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Available balance is read from authStore in WithdrawPage and passed as a prop

const WITHDRAW_METHODS: WithdrawMethod[] = [
  {
    key: "ach",
    label: "Bank ••••9821",
    sublabel: "3–5 business days · No fee",
    verified: true,
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(136,149,179,0.15)" }}>
        <Building2 size={18} style={{ color: "#8895B3" }} />
      </div>
    ),
  },
  {
    key: "paypal",
    label: "paypal@email.com",
    sublabel: "Within 24 hours · No fee",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
        style={{ backgroundColor: "rgba(0,82,255,0.15)", color: "#0052FF" }}>
        P
      </div>
    ),
  },
  {
    key: "check",
    label: "Check",
    sublabel: "5–7 business days · No fee",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(136,149,179,0.15)" }}>
        <Mail size={18} style={{ color: "#8895B3" }} />
      </div>
    ),
  },
];

const QUICK_AMOUNTS = [50, 100, 200, 500];
const STEP_LABELS = ["Method", "Amount", "Confirm"];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-start justify-center mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                style={{
                  backgroundColor: done ? "#00C48C" : active ? "#0052FF" : "transparent",
                  borderColor: done ? "#00C48C" : active ? "#0052FF" : "#2A3350",
                  color: done || active ? "#ffffff" : "#8895B3",
                }}
              >
                {done ? <Check size={14} /> : step}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: active ? "#F7F9FC" : "#8895B3" }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="h-0.5 w-12 mt-4 mx-1 flex-shrink-0 transition-colors"
                style={{ backgroundColor: step < current ? "#00C48C" : "#2A3350" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
  selected,
  available,
  onSelect,
  onNext,
}: {
  selected: string | null;
  available: number;
  onSelect: (key: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Withdraw Funds</h2>
        <p className="text-sm" style={{ color: "#8895B3" }}>Where should we send your money?</p>
      </div>

      {/* Balance pill */}
      <div className="flex justify-start">
        <span className="text-sm font-medium px-4 py-2 rounded-full border"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350", color: "#F7F9FC" }}>
          Available Balance:{" "}
          <span className="font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            ${available.toFixed(2)}
          </span>
        </span>
      </div>

      {/* Methods */}
      <div className="flex flex-col gap-3">
        {WITHDRAW_METHODS.map(({ key, label, sublabel, verified, icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className="flex items-center gap-4 rounded-xl p-4 border text-left transition-colors hover:bg-[#1C2438]"
              style={{
                backgroundColor: active ? "#1C2438" : "#131929",
                borderColor: active ? "#0052FF" : "#2A3350",
              }}
            >
              {icon}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{label}</span>
                  {verified && (
                    <CheckCircle2 size={14} style={{ color: "#00C48C", flexShrink: 0 }} />
                  )}
                </div>
                <span className="text-xs" style={{ color: "#8895B3" }}>{sublabel}</span>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: active ? "#0052FF" : "#2A3350" }}>
                {active && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#0052FF" }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex gap-3 rounded-xl p-4" style={{ backgroundColor: "#1C2438" }}>
        <Info size={16} style={{ color: "#0052FF", flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: "#8895B3" }}>
          Withdrawals require completed identity verification. First withdrawal may take an additional 24 hours for review.
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#0052FF" }}
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({
  amount,
  available,
  onAmountChange,
  selectedMethod,
  onBack,
  onNext,
}: {
  amount: string;
  available: number;
  onAmountChange: (v: string) => void;
  selectedMethod: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const method = WITHDRAW_METHODS.find((m) => m.key === selectedMethod);
  const parsed = parseFloat(amount) || 0;
  const overLimit = parsed > available;
  const display = amount
    ? parsed.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : "0";

  return (
    <div className="flex flex-col gap-6">
      {/* Method pill */}
      {method && (
        <div className="flex justify-center">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: "#1C2438", borderColor: "#0052FF", color: "#F7F9FC" }}>
            {method.label}
          </span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">How much?</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#8895B3" }}>Min $10 · Max ${available.toFixed(2)}</p>
          <button
            type="button"
            onClick={() => onAmountChange(String(available))}
            className="text-xs font-semibold"
            style={{ color: "#0052FF" }}
          >
            Max: ${available.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Big amount display */}
      <div
        className="flex items-center justify-center gap-2 py-4 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-5xl font-bold" style={{ color: overLimit ? "#FF3B5C" : "#F7F9FC" }}>$</span>
        <span
          className="text-[64px] font-bold leading-none"
          style={{ fontFamily: "var(--font-mono)", color: overLimit ? "#FF3B5C" : "#F7F9FC" }}
        >
          {display}
        </span>
        <input
          ref={inputRef}
          type="number"
          min={10}
          max={available}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="absolute opacity-0 w-0 h-0"
          aria-label="Withdrawal amount"
        />
      </div>

      {/* Insufficient funds warning */}
      {overLimit && (
        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3 border"
          style={{ backgroundColor: "#2D1B00", borderColor: "#F57C00" }}
        >
          <AlertTriangle size={16} style={{ color: "#F57C00", flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm" style={{ color: "#F57C00" }}>
            Insufficient funds. Your available balance is ${available.toFixed(2)}.
          </p>
        </div>
      )}

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((amt) => {
          const active = amount === String(amt);
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onAmountChange(String(amt))}
              className="rounded-lg py-3 text-sm font-semibold text-white border transition-colors"
              style={{
                backgroundColor: active ? "#1C2438" : "#131929",
                borderColor: active ? "#0052FF" : "#2A3350",
              }}
            >
              ${amt}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex-1 rounded-lg py-3 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
          style={{ borderColor: "#2A3350", color: "#F7F9FC" }}>
          ← Back
        </button>
        <button type="button" onClick={onNext} disabled={overLimit || parsed < 10}
          className="flex-[2] rounded-lg py-3 text-sm font-bold text-white transition-opacity"
          style={{
            backgroundColor: overLimit || parsed < 10 ? "#2A3350" : "#0052FF",
            opacity: overLimit || parsed < 10 ? 0.6 : 1,
            cursor: overLimit || parsed < 10 ? "not-allowed" : "pointer",
          }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({
  amount,
  selectedMethod,
  onBack,
}: {
  amount: string;
  selectedMethod: string | null;
  onBack: () => void;
}) {
  const [ssn4, setSsn4] = useState("");
  const [showSsn, setShowSsn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  const method = WITHDRAW_METHODS.find((m) => m.key === selectedMethod);
  const parsed = parseFloat(amount) || 0;
  const formatted = `$${parsed.toFixed(2)}`;
  const needsSsn = parsed >= 100;

  const arrivalMap: Record<string, string> = {
    ach: "May 1–3, 2026",
    paypal: "May 3, 2026",
    check: "May 6–8, 2026",
  };
  const arrival = selectedMethod ? arrivalMap[selectedMethod] : "—";

  async function handleWithdraw() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/payments/withdraw", { amount: parsed });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Withdrawal failed");
      fetchUser();
      setSuccess(true);
      toast.success("Withdrawal successful!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: "rgba(0,196,140,0.15)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#00C48C" }}>
              <Check size={28} color="#ffffff" strokeWidth={3} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold text-white mb-2">Withdrawal Requested!</p>
          <p className="text-sm" style={{ color: "#8895B3" }}>
            Estimated arrival: <span className="text-white font-semibold">{arrival}</span>
          </p>
        </div>

        <p className="text-sm" style={{ color: "#8895B3" }}>
          You'll receive an email confirmation shortly.
        </p>

        <Link href="/wallet"
          className="w-full text-center rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0052FF" }}>
          Back to Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold text-white">Confirm Withdrawal</h2>

      {/* Summary card */}
      <div className="rounded-xl p-5 border flex flex-col gap-4"
        style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Method</span>
          <span className="text-sm font-semibold text-white">{method?.label ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Amount</span>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
            {formatted}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Estimated arrival</span>
          <span className="text-sm font-semibold text-white">{arrival}</span>
        </div>
      </div>

      {/* Identity verification */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">Verify it's you</p>
        <div
          className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
          style={{ backgroundColor: "#0A0E1A", borderColor: "#2A3350" }}
        >
          <Lock size={14} className="ml-4 flex-shrink-0" style={{ color: "#8895B3" }} />
          <input
            type={showSsn ? "text" : "password"}
            placeholder="Last 4 of SSN"
            maxLength={4}
            value={ssn4}
            onChange={(e) => setSsn4(e.target.value.replace(/\D/g, ""))}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <button type="button" onClick={() => setShowSsn((v) => !v)}
            className="px-3 text-xs font-medium" style={{ color: "#8895B3" }} tabIndex={-1}>
            {showSsn ? "Hide" : "Show"}
          </button>
        </div>
        {needsSsn && (
          <p className="text-[11px] flex items-center gap-1" style={{ color: "#8895B3" }}>
            <Lock size={10} />
            Required for withdrawals over $100
          </p>
        )}
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: "rgba(255,59,92,0.12)", color: "#FF3B5C" }}
        >
          {error}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: "#8895B3" }}>
        By confirming you agree to our withdrawal terms
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 rounded-lg py-3 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
          style={{ borderColor: "#2A3350", color: "#F7F9FC" }}>
          ← Back
        </button>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={loading || (needsSsn && ssn4.length < 4)}
          className="flex-[2] flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-opacity"
          style={{
            backgroundColor: "#0052FF",
            opacity: loading || (needsSsn && ssn4.length < 4) ? 0.65 : 1,
            cursor: loading || (needsSsn && ssn4.length < 4) ? "not-allowed" : "pointer",
          }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Processing…" : `Withdraw ${formatted}`}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WithdrawPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const available = user ? parseFloat(user.balance) : 0;

  function next() { setStep((s) => Math.min(s + 1, 3) as Step); }
  function back() { setStep((s) => Math.max(s - 1, 1) as Step); }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[480px] flex flex-col">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 w-fit text-sm font-medium transition-colors hover:text-white mb-6"
          style={{ color: "#8895B3" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-[28px] font-bold text-white leading-tight mb-8">Withdraw</h1>

        <StepIndicator current={step} />

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}>
          {step === 1 && (
            <Step1
              selected={selectedMethod}
              available={available}
              onSelect={setSelectedMethod}
              onNext={next}
            />
          )}
          {step === 2 && (
            <Step2
              amount={amount}
              available={available}
              onAmountChange={setAmount}
              selectedMethod={selectedMethod}
              onBack={back}
              onNext={next}
            />
          )}
          {step === 3 && (
            <Step3
              amount={amount}
              selectedMethod={selectedMethod}
              onBack={back}
            />
          )}
        </div>

      </div>
    </div>
  );
}
