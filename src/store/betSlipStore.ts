import { create } from "zustand";

export interface BetSelection {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  betType: "spread" | "moneyline" | "total";
  label: string;
  odds: number;
  gameTime: string;
}

interface BetSlipState {
  selections: BetSelection[];
  wagerAmount: string;
  isOpen: boolean;

  // Actions
  addSelection: (bet: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  setWagerAmount: (amount: string) => void;
  toggleOpen: () => void;

  // Computed
  potentialPayout: () => number;
  charityContribution: () => number;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  selections: [],
  wagerAmount: "",
  isOpen: false,

  addSelection: (bet) =>
    set((state) => ({
      selections: state.selections.some((s) => s.id === bet.id)
        ? state.selections.map((s) => (s.id === bet.id ? bet : s))
        : [bet],
      isOpen: true,
    })),

  removeSelection: (id) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.id !== id),
    })),

  clearSlip: () => set({ selections: [], wagerAmount: "", isOpen: false }),

  setWagerAmount: (amount) => set({ wagerAmount: amount }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  potentialPayout: () => {
    const { selections, wagerAmount } = get();
    const wager = parseFloat(wagerAmount);
    if (!selections.length || !wager || wager <= 0) return 0;

    const { odds } = selections[0];
    return odds < 0
      ? wager / (odds / -100) + wager
      : wager * (odds / 100) + wager;
  },

  charityContribution: () => {
    const { wagerAmount } = get();
    const wager = parseFloat(wagerAmount);
    if (!wager || wager <= 0) return 0;
    return Math.round(wager * 0.02 * 100) / 100;
  },
}));
