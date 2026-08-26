import { create } from 'zustand';

interface BillingState {
  plan: 'free' | 'pro' | 'enterprise';
  creditsRemaining: number;
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  setCreditsRemaining: (credits: number) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  plan: 'free',
  creditsRemaining: 100,
  setPlan: (plan) => set({ plan }),
  setCreditsRemaining: (credits) => set({ creditsRemaining: credits }),
}));
