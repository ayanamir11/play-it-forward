"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Check, CreditCard, Loader2, Smartphone } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface PaymentMethod {
  key: string;
  label: string;
  sublabel: string;
  sublabelColor: string;
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: "card",
    label: "Credit / Debit Card",
    sublabel: "Instant deposit",
    sublabelColor: "#00C48C",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(0,82,255,0.15)" }}>
        <CreditCard size={18} style={{ color: "#0052FF" }} />
      </div>
    ),
  },
  {
    key: "paypal",
    label: "PayPal",
    sublabel: "Instant deposit",
    sublabelColor: "#00C48C",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
        style={{ backgroundColor: "rgba(0,82,255,0.15)", color: "#0052FF" }}>
        P
      </div>
    ),
  },
  {
    key: "ach",
    label: "Bank Account",
    sublabel: "3–5 business days",
    sublabelColor: "#8895B3",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(136,149,179,0.15)" }}>
        <Building2 size={18} style={{ color: "#8895B3" }} />
      </div>
    ),
  },
  {
    key: "applepay",
    label: "Apple Pay",
    sublabel: "Instant deposit",
    sublabelColor: "#00C48C",
    icon: (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#1a1a1a" }}>
        <Smartphone size={18} style={{ color: "#ffffff" }} />
      </div>
    ),
  },
];

const QUICK_AMOUNTS = [20, 50, 100, 250, 500, 1000];
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
  onSelect,
  onNext,
}: {
  selected: string | null;
  onSelect: (key: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Add Funds</h2>
        <p className="text-sm" style={{ color: "#8895B3" }}>Choose a payment method</p>
      </div>

      <div className="flex flex-col gap-3">
        {PAYMENT_METHODS.map(({ key, label, sublabel, sublabelColor, icon }) => {
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
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="text-xs" style={{ color: sublabelColor }}>{sublabel}</span>
              </div>
              <div className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: active ? "#0052FF" : "#2A3350" }}>
                {active && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#0052FF" }} />}
              </div>
            </button>
          );
        })}
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
  onAmountChange,
  selectedMethod,
  onBack,
  onNext,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  selectedMethod: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const method = PAYMENT_METHODS.find((m) => m.key === selectedMethod);
  const display = amount ? parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0";

  function handleQuick(amt: number) {
    onAmountChange(String(amt));
  }

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
        <p className="text-sm" style={{ color: "#8895B3" }}>Min $10 · Max $10,000</p>
      </div>

      {/* Big amount display */}
      <div
        className="flex items-center justify-center gap-2 py-4 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-5xl font-bold text-white">$</span>
        <span className="text-[64px] font-bold text-white leading-none" style={{ fontFamily: "var(--font-mono)" }}>
          {display}
        </span>
        {/* Hidden real input */}
        <input
          ref={inputRef}
          type="number"
          min={10}
          max={10000}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="absolute opacity-0 w-0 h-0"
          aria-label="Deposit amount"
        />
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map((amt) => {
          const active = amount === String(amt);
          return (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuick(amt)}
              className="rounded-lg py-3 text-sm font-semibold text-white border transition-colors"
              style={{
                backgroundColor: active ? "#1C2438" : "#131929",
                borderColor: active ? "#0052FF" : "#2A3350",
              }}
            >
              ${amt.toLocaleString()}
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
        <button type="button" onClick={onNext}
          className="flex-[2] rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0052FF" }}>
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const method = PAYMENT_METHODS.find((m) => m.key === selectedMethod);
  const parsed = parseFloat(amount) || 0;
  const formatted = `$${parsed.toFixed(2)}`;
  const newBalance = (250 + parsed).toFixed(2);

  function handleDeposit() {
    if (loading) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1500);
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
          <p className="text-2xl font-bold text-white mb-2">Deposit Successful!</p>
          <p className="text-sm" style={{ color: "#8895B3" }}>
            {formatted} has been added to your account
          </p>
        </div>

        <p className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
          ${newBalance}
        </p>
        <p className="text-xs" style={{ color: "#8895B3" }}>New balance</p>

        <div className="flex flex-col gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => { setSuccess(false); setLoading(false); router.push("/wallet/deposit"); }}
            className="w-full rounded-lg py-3 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
            style={{ borderColor: "#2A3350", color: "#F7F9FC" }}
          >
            Make Another Deposit
          </button>
          <Link href="/wallet"
            className="w-full text-center rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0052FF" }}>
            Back to Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white">Confirm Deposit</h2>

      {/* Summary card */}
      <div className="rounded-xl p-6 border flex flex-col gap-4"
        style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}>

        {/* Method row */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Payment method</span>
          <span className="text-sm font-semibold text-white">{method?.label ?? "—"}</span>
        </div>

        {/* Amount row */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Amount</span>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
            {formatted}
          </span>
        </div>

        {/* Availability row */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>Funds available</span>
          <span className="text-sm font-semibold" style={{ color: "#00C48C" }}>Instantly</span>
        </div>

        <div className="h-px" style={{ backgroundColor: "#2A3350" }} />

        {/* New balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#8895B3" }}>New balance</span>
          <span className="text-base font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
            ${newBalance}
          </span>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "#8895B3" }}>
        By confirming you agree to our deposit terms
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 rounded-lg py-3 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
          style={{ borderColor: "#2A3350", color: "#F7F9FC" }}>
          ← Back
        </button>
        <button
          type="button"
          onClick={handleDeposit}
          disabled={loading}
          className="flex-[2] flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-opacity"
          style={{ backgroundColor: "#0052FF", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Processing…" : `Deposit ${formatted}`}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DepositPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  function next() { setStep((s) => Math.min(s + 1, 3) as Step); }
  function back() { setStep((s) => Math.max(s - 1, 1) as Step); }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[480px] flex flex-col">

        <h1 className="text-[28px] font-bold text-white leading-tight mb-8">Deposit</h1>

        <StepIndicator current={step} />

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}>
          {step === 1 && (
            <Step1
              selected={selectedMethod}
              onSelect={setSelectedMethod}
              onNext={next}
            />
          )}
          {step === 2 && (
            <Step2
              amount={amount}
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
