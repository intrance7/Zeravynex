import { create } from 'zustand';

interface InvestigationState {
  activeInvestigationId: string | null;
  setActiveInvestigationId: (id: string | null) => void;
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  activeInvestigationId: null,
  setActiveInvestigationId: (id) => set({ activeInvestigationId: id }),
}));
