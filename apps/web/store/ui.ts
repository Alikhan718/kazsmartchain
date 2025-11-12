import { create } from 'zustand';

type UIState = {
  selectedTenant: string;
  setTenant: (t: string) => void;
};

export const useUI = create<UIState>((set) => ({
  selectedTenant: 'demo-bank',
  setTenant: (t: string) => set({ selectedTenant: t }),
}));


