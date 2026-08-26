import { create } from 'zustand';

interface AnalysisState {
  currentAnalysisId: string | null;
  isAnalyzing: boolean;
  setCurrentAnalysisId: (id: string | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysisId: null,
  isAnalyzing: false,
  setCurrentAnalysisId: (id) => set({ currentAnalysisId: id }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));
