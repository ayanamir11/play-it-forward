"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Lock } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

const CAUSES = [
  { key: "health",    emoji: "🏥", label: "Health & Medical Research",  charity: "American Red Cross"   },
  { key: "education", emoji: "📚", label: "Education",                   charity: "Khan Academy"         },
  { key: "env",       emoji: "🌿", label: "Environment",                 charity: "WWF"                  },
  { key: "rights",    emoji: "⚖️",  label: "Human Rights",               charity: "Amnesty International"},
  { key: "poverty",   emoji: "🤝", label: "Poverty & Humanitarian Aid",  charity: "UNICEF"               },
] as const;

type CauseKey = (typeof CAUSES)[number]["key"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const STEP_LABELS = ["Account", "Identity", "Your Cause", "Confirm"];

// ─── Reusable input styles ────────────────────────────────────────────────────

function inputCls() {
  return "w-full rounded-lg px-4 py-3 text-sm text-white outline-none border transition-colors focus:border-[#0052FF] bg-[#0A0E1A]";
}

function inputStyle() {
  return { borderColor: "#2A3350" };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium" style={{ color: "#8895B3" }}>{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SelectInput({ value, onChange, children }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls()} appearance-none`}
      style={{ ...inputStyle(), backgroundColor: "#0A0E1A" }}
    >
      {children}
    </select>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue →",
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-lg py-3 text-sm font-semibold border transition-colors hover:bg-[#1C2438]"
        style={{ borderColor: "#2A3350", color: "#F7F9FC" }}
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-[2] rounded-lg py-3 text-sm font-bold text-white transition-opacity"
        style={{
          backgroundColor: nextDisabled ? "#2A3350" : "#0052FF",
          opacity: nextDisabled ? 0.6 : 1,
          cursor: nextDisabled ? "not-allowed" : "pointer",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-start justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = step < current;
        const active = step === current;

        return (
          <div key={label} className="flex items-start">
            {/* Circle + label */}
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
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: active ? "#F7F9FC" : "#8895B3" }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className="h-0.5 w-10 mt-4 mx-1 flex-shrink-0 transition-colors"
                style={{ backgroundColor: step < current ? "#00C48C" : "#2A3350" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_COLORS = ["#2A3350", "#FF3B5C", "#FF8C42", "#FFD166", "#00C48C"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function PasswordStrength({ password }: { password: string }) {
  const score = passwordStrength(password);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: bar <= score ? STRENGTH_COLORS[score] : "#2A3350" }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs" style={{ color: STRENGTH_COLORS[score] }}>
          {STRENGTH_LABELS[score]}
        </p>
      )}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-sm" style={{ color: "#8895B3" }}>Start your journey</p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Email">
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls()}
            style={inputStyle()}
          />
        </Field>

        <Field label="Password">
          <div
            className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
            style={{ backgroundColor: "#0A0E1A", borderColor: "#2A3350" }}
          >
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="px-3" tabIndex={-1}>
              {showPwd ? <EyeOff size={16} style={{ color: "#8895B3" }} /> : <Eye size={16} style={{ color: "#8895B3" }} />}
            </button>
          </div>
          {password && <PasswordStrength password={password} />}
        </Field>

        <Field label="Confirm Password">
          <div
            className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
            style={{ backgroundColor: "#0A0E1A", borderColor: confirm && confirm !== password ? "#FF3B5C" : "#2A3350" }}
          >
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="px-3" tabIndex={-1}>
              {showConfirm ? <EyeOff size={16} style={{ color: "#8895B3" }} /> : <Eye size={16} style={{ color: "#8895B3" }} />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs" style={{ color: "#FF3B5C" }}>Passwords do not match</p>
          )}
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls()}
            style={inputStyle()}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-lg py-3 text-sm font-bold text-white"
        style={{ backgroundColor: "#0052FF" }}
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [month, setMonth]         = useState("");
  const [day, setDay]             = useState("");
  const [year, setYear]           = useState("");
  const [address, setAddress]     = useState("");
  const [city, setCity]           = useState("");
  const [state, setState]         = useState("");
  const [zip, setZip]             = useState("");
  const [ssn4, setSsn4]           = useState("");
  const [showSsn, setShowSsn]     = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => String(currentYear - 18 - i));
  const days  = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Verify your identity</h2>
        <p className="text-sm" style={{ color: "#8895B3" }}>Required by law for all betting platforms</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name">
            <input type="text" placeholder="Ayana" value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputCls()} style={inputStyle()} />
          </Field>
          <Field label="Last Name">
            <input type="text" placeholder="Mir" value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputCls()} style={inputStyle()} />
          </Field>
        </div>

        {/* Date of birth */}
        <Field label="Date of Birth">
          <div className="grid grid-cols-3 gap-2">
            <SelectInput value={month} onChange={setMonth}>
              <option value="">Month</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </SelectInput>
            <SelectInput value={day} onChange={setDay}>
              <option value="">Day</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </SelectInput>
            <SelectInput value={year} onChange={setYear}>
              <option value="">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </SelectInput>
          </div>
        </Field>

        <Field label="Address">
          <input type="text" placeholder="123 Main St" value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls()} style={inputStyle()} />
        </Field>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input type="text" placeholder="New York" value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputCls()} style={inputStyle()} />
          </Field>
          <Field label="State">
            <SelectInput value={state} onChange={setState}>
              <option value="">State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectInput>
          </Field>
        </div>

        <Field label="ZIP Code">
          <input type="text" placeholder="10001" maxLength={5} value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            className={inputCls()} style={inputStyle()} />
        </Field>

        {/* SSN last 4 */}
        <Field label="Last 4 digits of SSN">
          <div
            className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[#0052FF]"
            style={{ backgroundColor: "#0A0E1A", borderColor: "#2A3350" }}
          >
            <Lock size={14} className="ml-4 flex-shrink-0" style={{ color: "#8895B3" }} />
            <input
              type={showSsn ? "text" : "password"}
              placeholder="••••"
              maxLength={4}
              value={ssn4}
              onChange={(e) => setSsn4(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <button type="button" onClick={() => setShowSsn((v) => !v)} className="px-3" tabIndex={-1}>
              {showSsn ? <EyeOff size={16} style={{ color: "#8895B3" }} /> : <Eye size={16} style={{ color: "#8895B3" }} />}
            </button>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: "#8895B3" }}>
            <Lock size={10} />
            Encrypted and secure — required for KYC
          </p>
        </Field>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ onBack, onNext }: { onBack: () => void; onNext: (cause: CauseKey) => void }) {
  const [selected, setSelected] = useState<CauseKey | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Choose your cause</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#8895B3" }}>
          Your losing bets will fund this cause. You can change this monthly.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CAUSES.map(({ key, emoji, label, charity }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className="flex items-center gap-4 rounded-xl p-4 border text-left transition-colors"
              style={{
                backgroundColor: active ? "#1C2438" : "#131929",
                borderColor: active ? "#0052FF" : "#2A3350",
              }}
            >
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8895B3" }}>
                  Featured this month: {charity}
                </p>
              </div>
              {/* Radio */}
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: active ? "#0052FF" : "#2A3350" }}
              >
                {active && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#0052FF" }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => selected && onNext(selected)}
        nextLabel="Create Account →"
      />
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function Step4({ causeKey }: { causeKey: CauseKey | null }) {
  const router = useRouter();
  const cause = CAUSES.find((c) => c.key === causeKey) ?? CAUSES[0];

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Animated checkmark */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
          style={{ backgroundColor: "rgba(0,196,140,0.15)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#00C48C" }}
          >
            <Check size={28} color="#ffffff" strokeWidth={3} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">You&apos;re all set! 🎉</h2>
        <p className="text-sm" style={{ color: "#8895B3" }}>Welcome to Play It Forward</p>
      </div>

      {/* Summary card */}
      <div
        className="w-full rounded-xl p-5 border flex flex-col gap-3 text-left"
        style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cause.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white">{cause.label}</p>
            <p className="text-xs" style={{ color: "#8895B3" }}>
              Featured charity: {cause.charity}
            </p>
          </div>
        </div>
        <div className="h-px" style={{ backgroundColor: "#2A3350" }} />
        <p className="text-sm leading-relaxed" style={{ color: "#8895B3" }}>
          Every losing bet you place will contribute to{" "}
          <span className="text-white font-semibold">{cause.charity}</span>.
          Your impact starts now.
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="w-full rounded-lg py-3 text-sm font-bold text-white"
        style={{ backgroundColor: "#0052FF" }}
      >
        Start Betting →
      </button>

      <p className="text-xs leading-relaxed" style={{ color: "#8895B3" }}>
        Your identity will be verified shortly.
        You can deposit once approved.
      </p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedCause, setSelectedCause] = useState<CauseKey | null>(null);

  function next() { setStep((s) => Math.min(s + 1, 4) as Step); }
  function back() {
    if (step === 1) { router.push("/login"); return; }
    setStep((s) => Math.max(s - 1, 1) as Step);
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <div className="w-full max-w-[480px] flex flex-col">

        {/* Brand */}
        <p className="text-center text-lg font-bold mb-8" style={{ color: "#0052FF" }}>
          ⚡ Play It Forward
        </p>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Step content */}
        <div
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: "#131929", borderColor: "#2A3350" }}
        >
          {step === 1 && <Step1 onNext={next} />}
          {step === 2 && <Step2 onBack={back} onNext={next} />}
          {step === 3 && (
            <Step3
              onBack={back}
              onNext={(cause) => { setSelectedCause(cause); next(); }}
            />
          )}
          {step === 4 && <Step4 causeKey={selectedCause} />}
        </div>

        {/* Sign in link (steps 1-3 only) */}
        {step < 4 && (
          <p className="text-center text-sm mt-6" style={{ color: "#8895B3" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#0052FF" }}>
              Sign in
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
