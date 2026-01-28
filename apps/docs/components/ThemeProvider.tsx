'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme on mount to prevent flash
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('docs-theme') || 'dark';
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(storedTheme);
    }
  }, []);

  return <>{children}</>;
}

