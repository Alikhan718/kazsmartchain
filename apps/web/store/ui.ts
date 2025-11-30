import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

type UIState = {
  selectedTenant: string;
  setTenant: (t: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const applyTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      selectedTenant: 'demo-bank',
      setTenant: (t: string) => set({ selectedTenant: t }),
      theme: 'dark' as Theme,
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          applyTheme(newTheme);
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'ui-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);


