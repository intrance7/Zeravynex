import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  setSidebarOpen: (isOpen: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setTheme: (theme) => set({ theme }),
}));
